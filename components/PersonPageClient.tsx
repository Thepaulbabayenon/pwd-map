'use client';
import React, { useState } from "react"; // useEffect for potential debugging
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Briefcase, IdCard } from "lucide-react";
import MediaCard from "@/components/MediaCard"; // Assuming this component exists
import PlayVideoModal from "@/components/PlayVideoModal"; // Assuming this component exists
import { PersonMedia } from "@/lib/types";

// Define interfaces for type safety
interface PersonData {
  id: number;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  name?: string | null;
  idNumber?: string | null;
  idStatus?: string | null;
  gender?: string | null;
  dob?: string | null;
  age?: number | null;
  employment?: string | null;
  address?: string | null;
  doi?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  disabilityType?: string | null;
  specificDisability?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  media?: PersonMedia[];
}

interface PersonPageClientProps {
  personData: PersonData;
  fullName: string;
}

// Client-side component to handle media viewing functionality
function PersonPageClient({
  personData,
  fullName,
}: PersonPageClientProps) {
  const [selectedMedia, setSelectedMedia] = useState<PersonMedia | null>(null);

  // Separate media by type
  const images = personData.media?.filter(m => m.mediaType === 'image') || [];
  const videos = personData.media?.filter(m => m.mediaType === 'video') || [];
  const allMedia = personData.media || [];

  // Handle media selection - CORRECTED
  const handleMediaClick = (mediaItem: PersonMedia) => {
    console.log("handleMediaClick called with:", mediaItem); // For debugging
    setSelectedMedia(mediaItem);
    console.log("selectedMedia set to:", mediaItem); // For debugging
  };

  // Handle modal closing
  const handleCloseModal = () => {
    setSelectedMedia(null);
  };


  return (
    <div className="max-w-5xl mx-auto p-6"> {/* Parent z-index. Modal should be higher. */}
      <div className="mb-6">
        <Link href="/home/persons" className="flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to persons list
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 p-6 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{fullName}</h1>
            <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              ID: {personData.idNumber || "N/A"}
            </div>
          </div>
          {personData.idStatus && (
            <div className="mt-2 text-sm text-gray-600">
              ID Status: <span className="font-medium">{personData.idStatus}</span>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left column - Media */}
            <div className="md:col-span-1">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Media</h2>
                {allMedia.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-4 z-auto">
                    {allMedia.map((mediaItem) => ( // Renamed 'media' to 'mediaItem' for clarity
                      <MediaCard
                        key={mediaItem.id}
                        media={mediaItem}
                        ownerName={fullName}
                        // CORRECTED: Pass the full mediaItem from the map.
                        // This ensures the complete PersonMedia object is sent.
                        onClick={() => handleMediaClick(mediaItem)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No media available</p>
                )}
              </div>

              {/* Media counts */}
              <div className="mt-6 flex space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{images.length}</span> Images
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{videos.length}</span> Videos
                </div>
              </div>
            </div>

            {/* Right column - Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Personal Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal details */}
                  <div className="space-y-3">
                    {personData.gender && (
                      <div>
                        <span className="text-gray-600 text-sm">Gender:</span>
                        <p>{personData.gender}</p>
                      </div>
                    )}

                    {personData.dob && (
                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 mt-1 mr-2 text-gray-500" />
                        <div>
                          <span className="text-gray-600 text-sm">Date of Birth:</span>
                          <p>{personData.dob}</p>
                        </div>
                      </div>
                    )}

                    {(personData.age !== null && personData.age !== undefined) && (
                      <div>
                        <span className="text-gray-600 text-sm">Age:</span>
                        <p>{personData.age}</p>
                      </div>
                    )}

                    {personData.employment && (
                      <div className="flex items-start">
                        <Briefcase className="h-4 w-4 mt-1 mr-2 text-gray-500" />
                        <div>
                          <span className="text-gray-600 text-sm">Employment:</span>
                          <p>{personData.employment}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Location and ID */}
                  <div className="space-y-3">
                    {personData.address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mt-1 mr-2 text-gray-500" />
                        <div>
                          <span className="text-gray-600 text-sm">Address:</span>
                          <p>{personData.address}</p>
                        </div>
                      </div>
                    )}

                    {personData.doi && (
                      <div className="flex items-start">
                        <IdCard className="h-4 w-4 mt-1 mr-2 text-gray-500" />
                        <div>
                          <span className="text-gray-600 text-sm">Date of Issue:</span>
                          <p>{personData.doi}</p>
                        </div>
                      </div>
                    )}

                    {(personData.latitude && personData.longitude) && (
                      <div>
                        <span className="text-gray-600 text-sm">GPS Coordinates:</span>
                        <p>{personData.latitude}, {personData.longitude}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Disability Information */}
              {(personData.disabilityType || personData.specificDisability) && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold border-b pb-2">Disability Information</h2>

                  <div className="grid grid-cols-1 gap-4">
                    {personData.disabilityType && (
                      <div>
                        <span className="text-gray-600 text-sm">Disability Type:</span>
                        <p>{personData.disabilityType}</p>
                      </div>
                    )}

                    {personData.specificDisability && (
                      <div>
                        <span className="text-gray-600 text-sm">Specific Disability:</span>
                        <p>{personData.specificDisability}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-2 pt-6 text-xs text-gray-500 border-t">
                <p>Created: {personData.createdAt ? new Date(personData.createdAt).toLocaleString() : "Unknown"}</p>
                <p>Last Updated: {personData.updatedAt ? new Date(personData.updatedAt).toLocaleString() : "Unknown"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Media Modal */}
      {/* Ensure PlayVideoModal uses a higher z-index than its parent page elements, e.g., z-[1000] or similar Tailwind class */}
      <PlayVideoModal
        media={selectedMedia}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default PersonPageClient;
