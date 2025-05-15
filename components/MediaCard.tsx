// src/components/MediaCard.tsx (or your components path)
'use client';
import React from "react";
import NextImage from "next/image"; // Renamed to avoid conflict with HTMLImageElement if used elsewhere
import { PlayCircle, Image as ImageIcon } from "lucide-react"; // Using PlayCircle for video overlay

// This interface should ideally match what PersonPageClient uses for its media objects.
// If you have a shared types file, import it. Otherwise, ensure consistency.
interface PersonMedia {
  id: number; // Important for keys and identification
  mediaUrl: string;
  mediaType: 'image' | 'video';
  description?: string | null;
  fileId?: string | null;
  fileName?: string | null;
}

interface MediaCardProps {
  media: PersonMedia;
  ownerName: string;
  onClick: (media: PersonMedia) => void; // Callback when the card is clicked
}

const MediaCard: React.FC<MediaCardProps> = ({ media, ownerName, onClick }) => {
  if (!media) return null;

  const handleCardClick = () => {
    // CRITICAL LOG: Check if this appears when you click a card.
    console.log(`[MediaCard] Clicked. Media ID: ${media.id}, Type: ${media.mediaType}. Calling parent onClick.`);
    onClick(media); // This calls the function passed down from PersonPageClient
  };

  return (
    <div
      className="group cursor-pointer bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
      onClick={handleCardClick} // The entire card is clickable
      tabIndex={0} // For accessibility
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }} // For accessibility
    >
      <div className={`aspect-video relative ${media.mediaType === 'image' ? 'aspect-square' : 'aspect-video'}`}>
        {media.mediaType === 'image' ? (
          <NextImage
            src={media.mediaUrl}
            alt={media.description || `Image for ${ownerName}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Fallback for broken images
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
              target.alt = 'Image not available';
            }}
          />
        ) : (
          // Video Thumbnail
          <div className="w-full h-full bg-black flex items-center justify-center">
            {/* You can use a poster frame from the video if available, or a generic video icon */}
            <video
                src={media.mediaUrl + "#t=0.5"} // Attempt to get a poster frame
                className="w-full h-full object-cover absolute inset-0 opacity-60 group-hover:opacity-40 transition-opacity duration-300"
                preload="metadata"
                muted
                playsInline
            />
            <PlayCircle className="w-16 h-16 text-white opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 z-10" />
          </div>
        )}
        {/* Media Type Badge */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full shadow">
          {media.mediaType.charAt(0).toUpperCase() + media.mediaType.slice(1)}
        </div>
      </div>

      {(media.fileName || media.description) && (
        <div className="p-3">
          {media.fileName && <p className="text-sm font-semibold truncate text-gray-800 dark:text-gray-200" title={media.fileName}>{media.fileName}</p>}
          {media.description && !media.fileName && <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{media.description}</p>}
        </div>
      )}
    </div>
  );
};

export default MediaCard;