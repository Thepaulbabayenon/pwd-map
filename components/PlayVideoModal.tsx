// src/components/PlayVideoModal.tsx (or your components path)
'use client';
import React, { useState, useEffect, useRef, MouseEvent, useCallback } from "react";
import NextImage from "next/image"; // Renamed to avoid conflict
import ReactPlayer from "react-player/lazy"; // Lazy load ReactPlayer
import { X } from "lucide-react";

// This interface should match or be compatible with PersonMedia
interface MediaContent {
  id?: number; // Optional, but good to have if PersonMedia has it
  mediaUrl: string;
  mediaType: 'image' | 'video';
  description?: string | null;
  fileName?: string | null; // Optional
}

interface PlayVideoModalProps {
  media: MediaContent | null;
  onClose: () => void;
}

const PlayVideoModal: React.FC<PlayVideoModalProps> = ({ media, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Renamed for clarity
  const playerRef = useRef<ReactPlayer | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (media) {
      setIsLoading(true); // Reset loading state when media changes
      if (media.mediaType === 'video') {
        // Autoplay video after a slight delay for better perceived performance
        const timer = setTimeout(() => {
          setIsPlaying(true);
          setIsLoading(false); // Assume ready after short delay if ReactPlayer doesn't fire onReady quickly
        }, 300);
        return () => clearTimeout(timer);
      } else {
        setIsLoading(false); // Images load via NextImage, less manual loading state needed here
        setIsPlaying(false);
      }
    }
  }, [media]);

  const handleClose = useCallback(() => {
  setIsPlaying(false);
  if (media?.mediaType === 'video' && playerRef.current) {
    // playerRef.current.seekTo(0); // Optional: reset video
  }
  onClose();
}, [media, onClose]); // Include dependencies that are used inside the callback

// Close modal on escape key
useEffect(() => {
  const handleEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };
  window.addEventListener('keydown', handleEsc);
  return () => {
    window.removeEventListener('keydown', handleEsc);
  };
}, [handleClose]); // Now this dependency won't change on every render

  if (!media) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-8"
      onClick={handleClose} // Click on backdrop closes modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-modal-title"
    >
      <div
        ref={modalContentRef}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col relative"
        onClick={(e: MouseEvent) => e.stopPropagation()} // Prevent click inside content from closing modal
      >
        {/* Header with title and close button */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 id="media-modal-title" className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
                {media.fileName || media.description || (media.mediaType === 'image' ? 'Image' : 'Video')}
            </h2>
            <button
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleClose}
                aria-label="Close modal"
            >
                <X className="h-6 w-6" />
            </button>
        </div>

        {/* Media content area */}
        <div className="flex-grow p-1 sm:p-2 flex items-center justify-center overflow-hidden">
          {media.mediaType === 'image' ? (
            <div className="relative w-full h-full max-w-full max-h-full">
              <NextImage
                src={media.mediaUrl}
                alt={media.description || "Full screen image"}
                fill
                className="object-contain"
                onLoadingComplete={() => setIsLoading(false)}
                priority // Prioritize loading of modal image
              />
            </div>
          ) : (
            <div className="w-full h-full aspect-video relative">
              {isLoading && media.mediaType === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                  <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 dark:border-gray-600 rounded-full animate-spin"></div>
                </div>
              )}
              <ReactPlayer
                ref={playerRef}
                url={media.mediaUrl}
                playing={isPlaying}
                controls
                width="100%"
                height="100%"
                onReady={() => {
                  setIsPlaying(true); // Ensure playing is true once ready
                  setIsLoading(false);
                }}
                onError={(e) => {
                  console.error("ReactPlayer Error:", e);
                  setIsLoading(false);
                  // You could show an error message here
                }}
                config={{
                  file: { attributes: { controlsList: "nodownload", disablePictureInPicture: true } },
                  youtube: { playerVars: { disablekb: 1, modestbranding: 1 } }
                }}
                className="bg-black" // Ensure video player has a background
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
              />
            </div>
          )}
        </div>
        {/* Optional: Description below media */}
        {media.description && media.fileName && ( // Only show description if it's different from filename or provides more info
            <div className="p-4 border-t dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">{media.description}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PlayVideoModal;