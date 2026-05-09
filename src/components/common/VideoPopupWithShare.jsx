// src/components/common/VideoPopupWithShare.jsx
import { createPortal } from "react-dom";
import React, { useState, useRef, useEffect } from "react";
import { Play, X, Share2, Copy, Check } from "lucide-react";
import Lottie from "lottie-react";

const VideoPopupWithShare = ({ video_url, buttonCss = "", animationData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const popupRef = useRef(null);
  const shareRef = useRef(null);
  const LottieRef = useRef(null);

  // Get current page URL for sharing
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close video popup
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowSharePopup(false);
      }

      // Close share popup
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShowSharePopup(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close with Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setShowSharePopup(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => {
    setIsOpen(false);
    setShowSharePopup(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: "Check this out!",
        url: currentUrl,
      });
    } else {
      setShowSharePopup(true);
    }
  };

  // Default button classes with custom CSS override
  const defaultButtonClasses =
    "flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105";
  const buttonClasses = buttonCss || defaultButtonClasses;

  return (
    <>
      {/* Watch Button */}
      <button onClick={openPopup} className={buttonClasses}>
        <Play size={20} className="fill-current" />
        Watch Video
      </button>

      {/* Video Popup Overlay */}
      {isOpen &&
        createPortal(
          <div
            className="
        fixed inset-0 z-[999999]
        flex items-center justify-center
        bg-black/70
        backdrop-blur-sm
        p-4
      "
          >
            {/* Close */}
            <button
              onClick={closePopup}
              className="
          absolute top-5 right-5
          z-50
          flex h-12 w-12 items-center justify-center
          rounded-full
          bg-black/50
          text-white
          backdrop-blur-md
          transition-all duration-200
          hover:bg-black/80
        "
            >
              <X size={22} />
            </button>

            {/* Video */}
            <div
              ref={popupRef}
              className="
          relative
          w-full
          max-w-5xl
          aspect-video
          animate-[fadeIn_.25s_ease]
        "
            >
              <iframe
                src={video_url}
                className="
            h-full
            w-full
            rounded-2xl
            shadow-[0_25px_120px_rgba(0,0,0,0.65)]
          "
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video Player"
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default VideoPopupWithShare;
