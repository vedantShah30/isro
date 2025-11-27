"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import UploadCard from "../components/UploadCard";
import AppFooter from "../components/AppFooter";
import Promptbox from "../components/Promptbox";
import ChatSection from "../components/ChatSection";
import RoutinesModal from "../components/RoutinesModal";
const Scene3D = dynamic(() => import("../components/Scene3D"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-black" />,
});

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRoutinesOpen, setIsRoutinesOpen] = useState(false);
  const [routines, setRoutines] = useState([]);

  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Captioning");
  const [currentImage, setCurrentImage] = useState(null);
  const [userChats, setUserChats] = useState([]);
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [reloadChats, setReloadChats] = useState(false);

  useEffect(() => {
    if (!session) return;

    const preload = async () => {
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

    preload();
  }, [session, reloadChats]);

  const sendMessage = async (message, category) => {
    if (!message.trim()) return;

    const msg = message.trim();

    const tempId = Date.now();

    // temporary UI message
    const tempChat = {
      id: tempId,
      query: msg,
      response: "Processing...",
      timestamp: new Date(),
      category,
      error: false,
    };

    setChatHistory((prev) => [...prev, tempChat]);
    setInputMessage("");

    try {
      const res = await fetch("/api/chats/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imagePreview,
          routineId: null,
          responses: [
            {
              type: category.toLowerCase(),
              prompt: msg,
              response: `This is placeholder response for ${msg} this will be replaced soon`,
            },
          ],
          metadata: {
            uploadedAt: new Date(),
            processingTime: 0,
            imageSize: "1024x1024",
          },
        }),
      });

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

      setChatHistory((prev) =>
        prev.map((c) =>
          c.id === tempId
            ? { ...c, response: JSON.stringify(savedResponse, null, 2) }
            : c
        )
      );
      if (activeChat) {
        setActiveChat(data.chat);
      }
      setReloadChats((prev) => !prev);
    } catch (err) {
      setChatHistory((prev) =>
        prev.map((c) =>
          c.id === tempId ? { ...c, response: err.message, error: true } : c
        )
      );
    }
  };
  const handleSendMessage = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    sendMessage(inputMessage, selectedCategory);
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const handleImageSelect = (file, cloudUrl) => {
    if (activeChat) {
      setActiveChat(null);
    } else if (currentImage && cloudUrl !== currentImage) {
      window.location.reload();
      return;
    }
    setSelectedImage(file);
    setImagePreview(cloudUrl);
    setCurrentImage(cloudUrl);
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

  const openChat = (chat) => {
    setCurrentImage(null);

    setActiveChat(chat);
    setImagePreview(chat.imageUrl);
    const typeMap = {
      captioning: "Captioning",
      grounding: "Grounding",
      vqa: "VQA",
    };
    const formattedMessages = chat.responses.map((r) => ({
      id: r._id,
      query: r.prompt,
      response:
        typeof r.response === "string"
          ? r.response
          : JSON.stringify(r.response, null, 2),
      category: typeMap[r.type?.toLowerCase()] ?? "Captioning",
      timestamp: r.timestamp,
      error: false,
    }));

    setChatHistory(formattedMessages);
    setIsChatListOpen(false);
    setTimeout(() => {
      const chatContainer = document.getElementById("chat-container");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 50);
  };

  return (
    <div className="min-h-screen text-white overflow-hidden relative bg-black ">
      <Scene3D />

      <Sidebar
        onOpenRoutines={() => setIsRoutinesOpen(true)}
        onOpenChats={() => setIsChatListOpen(true)}
      />

      {/* Main content area */}
      <main className="relative z-20 ml-20">
        <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8">
          {/* Left - big upload card */}
          <UploadCard onImageSelect={handleImageSelect} />
          <ChatSection chatHistory={chatHistory} />
        </div>
        {isChatListOpen && (
          <div className="fixed right-0 top-0 h-full w-80 bg-[#0f1720] border-l border-cyan-800/20 p-4 overflow-y-auto z-50 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-cyan-400">Your Chats</h2>

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
            {userChats.map((chat) => {
              const isActive = activeChat?._id === chat._id;
              return (
                <div
                  key={chat._id}
                  onClick={() => openChat(chat)}
                  className={`
                    p-3 rounded-lg mb-2 cursor-pointer transition-all border
                    ${
                      isActive
                        ? "bg-cyan-900/40 border-cyan-500 shadow-lg"
                        : "bg-white/5 border-transparent hover:bg-white/10"
                    }
                  `}
                >
                  <p className="font-semibold">{chat.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(chat.createdAt).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
      {/* Bottom centered query input */}
      <div className="relative z-30 mb-24 text-center">
        <Promptbox
          value={inputMessage}
          onChange={(v) => setInputMessage(v)}
          onSend={(message, category) => sendMessage(message, category)}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>
      {/* <AppFooter /> */}
      {/* Routines Modal */}
      <RoutinesModal
        open={isRoutinesOpen}
        onClose={() => setIsRoutinesOpen(false)}
      />
    </div>
  );
}
