"use client";

import { logout } from "@/actions/auth";
import { useState, useRef, useEffect } from "react";

interface UserProfileProps {
  userName?: string;
  userImage?: string;
}

export function UserProfile({
  userName = "John Doe",
  userImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
}: UserProfileProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setError(null);
    setIsLoggingOut(true);

    try {
      const result = await logout();
      // If we get a result, it means there was an error (successful logout redirects)
      if (result?.error) {
        console.log("Logout error:", result.error);
        setError(result.error);
        setIsLoggingOut(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoggingOut(false);
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none  rounded-full"
        aria-label="User menu"
      >
        <span className="text-sm font-medium">{userName}</span>
        <img
          src={userImage}
          alt="Profile picture"
          className="h-8 w-8 rounded-full object-cover"
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          {error && (
            <div className="px-4 py-2 text-xs text-red-600 bg-red-50 rounded-t-md border-b border-red-200">
              {error}
            </div>
          )}
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              console.log("Navigate to settings");
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Settings
          </button>
          <hr className="border-gray-200" />
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
