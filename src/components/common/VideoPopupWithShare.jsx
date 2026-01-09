import React, { useState, useRef, useEffect } from 'react';
import { Play, X, Share2, Copy, Check } from 'lucide-react';
import Lottie from "lottie-react"


const VideoPopupWithShare = ({ video_url, buttonCss = "", animationData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const popupRef = useRef(null);
  const shareRef = useRef(null);
      const LottieRef = useRef(null)

    

  // Get current page URL for sharing
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

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
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close with Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowSharePopup(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
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
      console.error('Failed to copy: ', err);
    }
  };

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check this out!',
        url: currentUrl,
      });
    } else {
      setShowSharePopup(true);
    }
  };

  // Default button classes with custom CSS override
  const defaultButtonClasses = "flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105";
  const buttonClasses = buttonCss || defaultButtonClasses;

  return (
    <>
      {/* Watch Button */}
      <button
        onClick={openPopup}
        className={buttonClasses}
      >
        <Play size={20} className="fill-current" />
        Watch Video
      </button>

      {/* Video Popup Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div
            ref={popupRef}
            className="relative bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden"
          >
            {/* Header with Close and Share Buttons */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              {/* Share Button */}
              {/* <button
                onClick={shareUrl}
                className="bg-white bg-opacity-20 backdrop-blur-md rounded-full p-2 hover:bg-opacity-30 transition-all duration-200 text-white border border-white border-opacity-30"
              >
                <Share2 size={20} />
              </button> */}
              
              {/* Close Button */}
              <button
                onClick={closePopup}
                className="bg-white bg-opacity-20 backdrop-blur-md rounded-full p-2 hover:bg-opacity-30 transition-all duration-200 text-white border border-white border-opacity-30"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
              <iframe
                src={video_url}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video Player"
              />
               <Lottie
                        animationData={animationData}
                        loop={true}
                        autoplay={true}
                        lottieRef={LottieRef}
                        className="absolute top-0 left-0 w-full h-full"
                    />
            </div>

            {/* Share Popup */}
            {showSharePopup && (
              <div
                ref={shareRef}
                className="absolute top-20 right-4 bg-white rounded-lg shadow-xl p-4 min-w-64 z-20 border border-gray-200"
              >
                <h3 className="font-semibold text-gray-800 mb-3">Share this video</h3>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={currentUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50 text-gray-700"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="flex gap-2">
                  {/* Social Share Buttons */}
                  <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
                    Facebook
                  </button>
                  <button className="flex-1 px-3 py-2 bg-blue-400 text-white rounded text-sm hover:bg-blue-500 transition-colors">
                    Twitter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VideoPopupWithShare;