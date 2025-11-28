"use client";
import { useState } from "react";

export default function ChatListItem({
  chat,
  isActive,
  onOpenChat,
  onRename,
  onDelete,
}) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);

  const handleRenameSubmit = () => {
    if (!newTitle.trim()) return;
    onRename(chat._id, newTitle.trim());
    setIsRenaming(false);
  };

  return (
    <div
      className={`relative p-3 rounded-lg mb-2 cursor-pointer transition-all border
        ${
          isActive
            ? "bg-cyan-900/40 border-cyan-500 shadow-lg"
            : "bg-white/5 border-transparent hover:bg-white/10"
        }
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMenuOpen(false);
      }}
      onClick={() => !isRenaming && onOpenChat(chat)}
    >
      {/* Title or rename input */}
      {!isRenaming ? (
        <p className="font-semibold">{chat.title}</p>
      ) : (
        <input
          className="w-full px-2 py-1 bg-black border border-cyan-700 rounded text-white mb-1"
          autoFocus
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
          onBlur={handleRenameSubmit}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <p className="text-xs text-gray-400">
        {new Date(chat.createdAt).toLocaleString()}
      </p>

      {/* Three dots button */}
      {hovered && !isRenaming && (
        <button
          className="absolute right-3 top-3 text-gray-300 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
        >
          ⋮
        </button>
      )}

      {/* Dropdown menu */}
      {menuOpen && !isRenaming && (
        <div
          className="absolute right-3 top-8 bg-[#0f1720] border border-cyan-700 rounded shadow-lg z-50 w-32"
          onClick={(e) => e.stopPropagation()}
        >
          <p
            className="px-3 py-2 text-sm hover:bg-white/10 cursor-pointer"
            onClick={() => {
              setIsRenaming(true);
              setMenuOpen(false);
            }}
          >
            Rename
          </p>

          <p
            className="px-3 py-2 text-sm hover:bg-white/10 cursor-pointer text-red-400"
            onClick={() => onDelete(chat._id)}
          >
            Delete
          </p>
        </div>
      )}
    </div>
  );
}
