

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
import SaveRoutineModal from "../components/SaveRoutineModal";
import Toast from "../components/Toast";
import ChatListItem from "../components/ChatListItem";

export default function ImagePage(){
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
      const [userRoutines, setUserRoutines] = useState([]);
      const [reloadRoutines, setReloadRoutines] = useState(false);
      const [isSaveRoutineModalOpen, setIsSaveRoutineModalOpen] = useState(false);
      const [toastMessage, setToastMessage] = useState("");
      const [toastType, setToastType] = useState("success");
      const [showToast, setShowToast] = useState(false);


        
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
  const handleSubmitImage = async () => {
  if (!imagePreview) {
    alert("Please upload an image first");
    return;
  }
  try {
    setIsAnalyzing(true);

    // Create a new chat with the image
    const res = await fetch("/api/chats/create", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: imagePreview,
        routineId: null,
        responses: [],
        metadata: {
          uploadedAt: new Date(),
          processingTime: 0,
          imageSize: "1024x1024",
        },
      }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.error || "Failed to create chat");
      return;
    }

    const chatId = data.chat._id;

    // Redirect to chat page with the new chat ID
    router.push(`/chat/${chatId}`);
  } catch (err) {
    console.error("Error creating chat:", err);
    alert("Failed to create chat");
  } finally {
    setIsAnalyzing(false);
  }


  
};


return(
        <>
        <div className="max-w-7xl mx-auto px-6 pt-9 flex gap-8">
                  {/* Left - big upload card */}
                  <UploadCard
                    onImageSelect={handleImageSelect}
                    imagePreview={imagePreview}
                  />
                 
        </div>
        <button
      onClick={handleSubmitImage}
      disabled={!imagePreview || isAnalyzing}
      className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 text-white rounded-lg font-semibold transition"
    >
      {isAnalyzing ? "Creating Chat..." : "Submit Image"}
    </button>
        </>
    )
    
}
