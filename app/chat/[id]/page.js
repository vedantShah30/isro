"use client";

import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatListItem from "../../components/ChatListItem";
import ChatSection from "../../components/ChatSection";
import Loader from "../../components/Loader";
import Promptbox from "../../components/Promptbox";
import RoutinesModal from "../../components/RoutinesModal";
import SaveRoutineModal from "../../components/SaveRoutineModal";
import Sidebar from "../../components/Sidebar";
import Toast from "../../components/Toast";
import UploadCard from "../../components/UploadCard";

const Scene3D = dynamic(() => import("../../components/Scene3D"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-black" />,
});

export default function ChatDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const chatId = params?.id;
  const [userChats, setUserChats] = useState([]);
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [userRoutines, setUserRoutines] = useState([]);
  const [reloadRoutines, setReloadRoutines] = useState(false);
  const [isSaveRoutineModalOpen, setIsSaveRoutineModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showToast, setShowToast] = useState(false);
  const [isRoutinesOpen, setIsRoutinesOpen] = useState(false);
  const [reloadChats, setReloadChats] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const [selectedQueryId, setSelectedQueryId] = useState(null);
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingSpeed = 45; // 45ms per character

  
  // WebSocket and streaming metadata
  const wsRef = useRef(null);
  const streamMetaRef = useRef({}); // streamId -> { prompt, categoryLower }

  const fetchChatData = useCallback(async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/chats/${chatId}/get`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to fetch chat");
        return;
      }

      const chatData = data.chats;

      if (!chatData) {
        setError("Chat not found");
        return;
      }

      setChat(chatData);
      setActiveChat(chatData);
      setImageUrl(chatData.imageUrl);

      // Extract coordinates from grounding responses
      const coordinatesData = [];
      if (chatData.responses && Array.isArray(chatData.responses)) {
        chatData.responses.forEach((r) => {
          if (r.type?.toLowerCase() === "grounding" && r.coordinates) {
            // r.coordinates is an array, so we need to handle each coordinate box
            if (Array.isArray(r.coordinates)) {
              coordinatesData.push(...r.coordinates);
            } else {
              coordinatesData.push(r.coordinates);
            }
          }
        });
      }

      // Don't set initial coordinates - only show when a query is clicked
      setCoordinates([]);
      // Format chat history from responses
      if (chatData.responses && chatData.responses.length > 0) {
        const typeMap = {
          captioning: "Captioning",
          grounding: "Grounding",
          vqa: "VQA",
        };

        const formattedMessages = chatData.responses.map((r) => {
          // Extract coordinates for this specific response
          let responseCoordinates = [];
          if (r.type?.toLowerCase() === "grounding" && r.coordinates) {
            if (Array.isArray(r.coordinates)) {
              responseCoordinates = r.coordinates;
            } else {
              responseCoordinates = [r.coordinates];
            }
          }

          return {
            id: r._id || Date.now() + Math.random(),
            query: r.prompt || "",
            response:
              typeof r.response === "string"
                ? r.response
                : JSON.stringify(r.response, null, 2),
            category: typeMap[r.type?.toLowerCase()] || "Captioning",
            timestamp: r.timestamp || new Date(),
            coordinates: responseCoordinates, // Store coordinates with each message
          };
        });

        setChatHistory(formattedMessages);
      }
    } catch (err) {
      console.error("Error fetching chat:", err);
      setError("Failed to load chat");
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const sendMessage = async (message, category) => {
    if (!message.trim() || !imageUrl) return;

    const msg = message.trim();
    const tempId = Date.now();
    let finalCategory = category;

    const tempChat = {
      id: tempId,
      query: msg,
      response: "Processing...",
      timestamp: new Date(),
      category: finalCategory || "Captioning",
      error: false,
      coordinates: [],
    };
    setChatHistory((prev) => [...prev, tempChat]);
    setInputMessage("");

    try {
      setIsAnalyzing(true);

      if (!finalCategory || finalCategory === "") {
        const classifyRes = await fetch("/api/models/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: msg }),
        });

        const classifyData = await classifyRes.json();
        finalCategory = classifyData.type || "Captioning";
        setChatHistory((prev) =>
          prev.map((c) =>
            c.id === tempId ? { ...c, category: finalCategory } : c
          )
        );
      }
      const categoryLower = finalCategory.toLowerCase();
      // If WebSocket is connected, stream the response
      const ws = wsRef.current;
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || null;
      const canStream =
        ws &&
        ws.readyState === WebSocket.OPEN &&
        wsUrl !== null;

      if (canStream) {
        // register metadata so WS handler can persist later
        streamMetaRef.current[tempId] = {
          prompt: msg,
          categoryLower,
        };

        ws.send(
          JSON.stringify({
            type: "start",
            streamId: tempId,
            prompt: msg,
            category: categoryLower,
            imageUrl,
          })
        );

        // In streaming mode, we don't immediately clear analyzing here;
        // it will be cleared when we receive "done" or "error" from WS.
        return;
      }

      // Fallback: current HTTP-based flow (no streaming)
      let aiResponse = "";
      let responseCoordinates = [];

      if (categoryLower === "captioning") {
        const captionRes = await fetch("/api/models/caption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl, prompt: msg }),
        });
        const captionData = await captionRes.json();
        aiResponse = captionData.caption || "No response from caption model";
      } else if (categoryLower === "grounding") {
        const groundingRes = await fetch("/api/models/ground", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl, prompt: msg }),
        });
        const groundingData = await groundingRes.json();
        aiResponse = groundingData.description || JSON.stringify(groundingData);
        responseCoordinates = groundingData.coordinates || [];
      } else if (categoryLower === "vqa") {
        const vqaRes = await fetch("/api/models/vqa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl, prompt: msg }),
        });
        const vqaData = await vqaRes.json();
        aiResponse = vqaData.answer || "No response from VQA model";
      }
      const res = await fetch("/api/chats/update", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imageUrl,
          routineId: null,
          responses: [
            {
              type: categoryLower,
              prompt: msg,
              response: aiResponse,
              coordinates:
                categoryLower === "grounding" ? responseCoordinates : [],
            },
          ],
          metadata: {
            uploadedAt: chat?.metadata?.uploadedAt || new Date(),
            processingTime: 0,
            imageSize: chat?.metadata?.imageSize || "1024x1024",
          },
        }),
      });
      setSelectedCategory("");

      const data = await res.json();

      if (!res.ok || !data.success) {
        setChatHistory((prev) =>
          prev.map((c) =>
            c.id === tempId
              ? {
                  ...c,
                  response: data.error || "Error saving chat",
                  error: true,
                }
              : c
          )
        );
        return;
      }

      const responsesArray = data.chat.responses;
      const savedResponse = responsesArray[responsesArray.length - 1].response;
      const savedCoordinates =
        responsesArray[responsesArray.length - 1].coordinates || [];

      setChatHistory((prev) =>
        prev.map((c) =>
          c.id === tempId
            ? {
                ...c,
                response: JSON.stringify(savedResponse, null, 2),
                coordinates:
                  categoryLower === "grounding" ? savedCoordinates || [] : [],
              }
            : c
        )
      );

      if (
        categoryLower === "grounding" &&
        savedCoordinates &&
        savedCoordinates.length > 0
      ) {
        setSelectedQueryId(tempId);
        setCoordinates(savedCoordinates);
        setSelectedCategory("Grounding");
      }

      setChat(data.chat);
      setActiveChat(data.chat);
      setReloadChats((prev) => !prev);
    } catch (err) {
      setChatHistory((prev) =>
        prev.map((c) =>
          c.id === tempId ? { ...c, response: err.message, error: true } : c
        )
      );
    } finally {
      // In streaming mode, we'll stop analyzing when WS sends "done"/"error"
      const ws = wsRef.current;
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || null;
      const canStream =
        ws &&
        ws.readyState === WebSocket.OPEN &&
        wsUrl !== null;
      if (!canStream) {
        setIsAnalyzing(false);
      }
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "loading" || !chatId) {
      return;
    }

    fetchChatData();
  }, [status, chatId, router, fetchChatData]);

  // Preload user chats for sidebar
  useEffect(() => {
    if (!session) return;

    const preloadChats = async () => {
      try {
        const res = await fetch("/api/chats/get", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (data.success) {
          setUserChats(data.chats);
        }
      } catch (err) {
        console.error("Failed to preload chats:", err);
      }
    };

    preloadChats();
  }, [session, reloadChats]);

  // Load routines
  useEffect(() => {
    if (!session) return;

    const loadRoutines = async () => {
      try {
        const res = await fetch("/api/routines/get", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (data.success) {
          setUserRoutines(data.routines);
        }
      } catch (err) {
        console.error("Failed to load routines:", err);
      }
    };

    loadRoutines();
  }, [session, reloadRoutines]);

  // WebSocket connection for streaming model outputs
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!session || !wsUrl) return;

    // Avoid reconnecting if already open
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, streamId, delta, full, coordinates, error } = msg;

        if (!streamId) return;

        if (type === "partial") {
          setChatHistory((prev) =>
            prev.map((c) =>
              c.id === streamId
                ? {
                    ...c,
                    response: (c.response === "Processing..." ? "" : c.response || "") + delta,
                  }
                : c
            )
          );
        } else if (type === "done") {
          const meta = streamMetaRef.current[streamId];
          if (!meta) return;
          const { prompt, categoryLower } = meta;

          // Update UI with final text and coordinates
          setChatHistory((prev) =>
            prev.map((c) =>
              c.id === streamId
                ? {
                    ...c,
                    response: full,
                    coordinates:
                      categoryLower === "grounding" ? coordinates || [] : c.coordinates || [],
                  }
                : c
            )
          );

          // Persist to DB using existing chats/update API
          try {
            const res = await fetch("/api/chats/update", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageUrl: imageUrl,
                routineId: null,
                responses: [
                  {
                    type: categoryLower,
                    prompt,
                    response: full,
                    coordinates:
                      categoryLower === "grounding" ? coordinates || [] : [],
                  },
                ],
                metadata: {
                  uploadedAt: chat?.metadata?.uploadedAt || new Date(),
                  processingTime: 0,
                  imageSize: chat?.metadata?.imageSize || "1024x1024",
                },
              }),
            });
            

            const data = await res.json();
            if (res.ok && data.success) {
              setChat(data.chat);
              setActiveChat(data.chat);
              setReloadChats((prev) => !prev);
            } else {
              console.error("Failed to save streamed chat:", data.error);
            }
          } catch (err) {
            console.error("Error saving streamed chat:", err);
          } finally {
            setIsAnalyzing(false);
          }

          delete streamMetaRef.current[streamId];
        } else if (type === "error") {
          setChatHistory((prev) =>
            prev.map((c) =>
              c.id === streamId
                ? {
                    ...c,
                    response: `Error: ${error}`,
                    error: true,
                  }
                : c
            )
          );
          setIsAnalyzing(false);
        }
      } catch (err) {
        console.error("WebSocket message parse error:", err);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [session, imageUrl, chat, setChatHistory]);

  if (status === "loading" || loading) {
    return <Loader />;
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={() => router.push("/image")}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            Go Back to Chat
          </button>
        </div>
      </div>
    );
  }
     
  const handleImageSelect = (file, cloudUrl) => {
    // Handle image selection if needed
    setImageUrl(cloudUrl);
  };

  const handleQueryClick = (chatItem) => {
    setSelectedQueryId(chatItem.id);

    // If it's a grounding query, show its coordinates
    if (
      chatItem.category === "Grounding" &&
      chatItem.coordinates &&
      chatItem.coordinates.length > 0
    ) {
      setCoordinates(chatItem.coordinates);
      console.log(chatItem.coordinates);
      setSelectedCategory("Grounding");
    } else {
      // Clear coordinates for non-grounding queries
      setCoordinates([]);
    }
  };

  const loadUserChats = async () => {
    try {
      const res = await fetch("/api/chats/get", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!data.success) {
        console.error("Error fetching chats:", data.error);
        return;
      }
      setUserChats(data.chats);
      setIsChatListOpen(true);
    } catch (err) {
      console.error("Failed to load chats:", err);
    }
  };

  const openChat = (selectedChat) => {
    // Navigate to the selected chat's page
    router.push(`/chat/${selectedChat._id}`);
  };

  const saveCurrentChatAsRoutine = async (
    routineTitle,
    routineDescription = ""
  ) => {
    if (chatHistory.length === 0) {
      throw new Error("No chat history to save");
    }

    try {
      const prompts = chatHistory.map((msg, idx) => ({
        type: msg.category.toLowerCase(),
        prompt: msg.query,
        order: idx + 1,
      }));

      const res = await fetch("/api/routines/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: routineTitle,
          description: routineDescription,
          prompts,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to save routine");
      }

      setReloadRoutines((prev) => !prev);
      setIsSaveRoutineModalOpen(false);
      setToastMessage(`Routine "${routineTitle}" saved successfully!`);
      setToastType("success");
      setShowToast(true);
    } catch (err) {
      console.error("Error saving routine:", err);
      setToastMessage(err.message || "Failed to save routine");
      setToastType("error");
      setShowToast(true);
      throw err;
    }
  };

  const handleSelectRoutine = async (selectedPrompts, routine) => {
    console.log("Routine selected:", routine);
    console.log("Selected prompts:", selectedPrompts);
    if (!imageUrl) {
      setToastMessage("Please ensure an image is loaded");
      setToastType("error");
      setShowToast(true);
      return;
    }
    if (!selectedPrompts || selectedPrompts.length === 0) {
      setToastMessage("No prompts selected");
      setToastType("error");
      setShowToast(true);
      return;
    }
    const sortedPrompts = [...selectedPrompts].sort((a, b) => (a.order || 0) - (b.order || 0));

    setIsAnalyzing(true);
    setToastMessage(`Running routine "${routine.title}" with ${sortedPrompts.length} prompts...`);
    setToastType("success");
    setShowToast(true);
    for (let i = 0; i < sortedPrompts.length; i++) {
      const prompt = sortedPrompts[i];
      const category = prompt.type.charAt(0).toUpperCase() + prompt.type.slice(1); // Capitalize first letter
      
      try {
        // Use the existing sendMessage logic but wait for each to complete
        await sendMessage(prompt.prompt, category);
        
        // Add a small delay between prompts to avoid overwhelming the API
        if (i < sortedPrompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error executing prompt ${i + 1}:`, error);
        // Continue with next prompt even if one fails
      }
    }
    setIsAnalyzing(false);
  setToastMessage(`Routine "${routine.title}" completed!`);
  setToastType("success");
  setShowToast(true);
  try {
    await fetch("/api/routines/update-usage", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routineId: routine._id }),
    });
  } catch (err) {
    console.error("Failed to update routine usage:", err);
  }

  };

  const handleSaveRoutineClick = () => {
    if (chatHistory.length === 0) {
      alert("No chat history to save as routine");
      return;
    }

    setIsSaveRoutineModalOpen(true);
  };
  return (
    <div className="min-h-screen text-white overflow-hidden relative bg-black">
      <Scene3D />

      <Sidebar
        onOpenRoutines={() => setIsRoutinesOpen(true)}
        onOpenChats={loadUserChats}
        onSaveRoutine={handleSaveRoutineClick}
      />

      {/* Main content area */}
      <main className="relative z-20 ml-20">
        <div className="max-w-7xl mx-auto px-6 pt-9 flex gap-8">
          {/* Left - Image box */}
          <div className="w-[800px] flex items-center justify-center">
            <UploadCard
              onImageSelect={handleImageSelect}
              imagePreview={chat?.croppedUrl || imageUrl}
              originalImageUrl={imageUrl}
              showChangeImageButton={false}
              coordinates={coordinates}
              setBoundingBox={Boolean(
                selectedQueryId &&
                  coordinates.length > 0 &&
                  selectedCategory === "Grounding"
              )}
              onCropComplete={fetchChatData}
            />
          </div>

          {/* Right - Chat Section */}
          <ChatSection
            chatHistory={chatHistory}
            onQueryClick={handleQueryClick}
            selectedQueryId={selectedQueryId}
          />
        </div>
        {isChatListOpen && (
          <div className="fixed right-0 top-0 h-full w-80 bg-[#0f1720] border-l border-cyan-800/20 p-4 overflow-y-auto z-50 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 ">Your Chats</h2>

              <button
                onClick={() => setIsChatListOpen(false)}
                className="text-gray-300 hover:text-white transition"
              >
                {/* Close Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Chat list */}
            {userChats.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                isActive={activeChat?._id === chat._id}
                onOpenChat={openChat}
                onRename={async (chatId, newTitle) => {
                  const res = await fetch("/api/chats/update-title", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chatId, title: newTitle }),
                  });
                  const data = await res.json();
                  if (data.success) setReloadChats((prev) => !prev);
                }}
                onDelete={async (chatIdToDelete) => {
                  const res = await fetch("/api/chats/delete", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chatId: chatIdToDelete }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setReloadChats((prev) => !prev);
                    if (
                      activeChat?._id === chatIdToDelete ||
                      chatId === chatIdToDelete
                    ) {
                      // If deleting current chat, redirect to chat page
                      router.push("/image");
                    }
                  }
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom - Searchbox/Promptbox */}
      <div className="relative z-10 text-center">
        <Promptbox
          value={inputMessage}
          onChange={(v) => setInputMessage(v)}
          onSend={(message, category) => sendMessage(message, category)}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>

      {/* Routines Modal */}
      <RoutinesModal
        open={isRoutinesOpen}
        onClose={() => setIsRoutinesOpen(false)}
        routines={userRoutines}
        onSelectRoutine={handleSelectRoutine}
      />

      {/* Save Routine Modal */}
      <SaveRoutineModal
        open={isSaveRoutineModalOpen}
        onClose={() => setIsSaveRoutineModalOpen(false)}
        onSave={saveCurrentChatAsRoutine}
        promptCount={chatHistory.length}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isOpen={showToast}
        duration={3500}
      />
    </div>
  );
}
