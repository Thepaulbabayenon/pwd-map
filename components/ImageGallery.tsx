'use client';
import Image from "next/image";
import { useState } from "react";

// Define types for image object
export interface ImageType {
  id?: number;
  imageUrl: string;
  description?: string;
  personId?: number;
}

// Props interface for ImageGallery component
export interface ImageGalleryProps {
  images: ImageType[];
  personName: string;
}

// Image Gallery Component
const ImageGallery = ({ images, personName }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // No images case
  if (!images || images.length === 0) {
    return (
      <div className="border rounded-lg p-12 flex items-center justify-center bg-gray-50 h-64">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // Image Modal for full-screen view
  const ImageModal = ({ image }: { image: ImageType }) => (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
      onClick={() => setSelectedImage(null)}
    >
      <div className="max-w-[90%] max-h-[90%] relative w-full h-full">
        <Image
          src={image.imageUrl}
          alt={image.description || `Photo of ${personName}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 90vw"
          style={{ 
            objectFit: 'contain', 
            objectPosition: 'center' 
          }}
          className="rounded-lg"
          onError={(e) => {
            console.error(`Failed to load full-screen image: ${image.imageUrl}`, e);
          }}
        />
        {image.description && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm rounded-b-lg">
            {image.description}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.filter(image => !imageErrors.has(image.id || -1)).map((image, index) => (
          <div 
            key={image.id || index} 
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity group"
            onClick={() => setSelectedImage(image)}
          >
            <Image
              src={image.imageUrl}
              alt={image.description || `Photo of ${personName}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              style={{ 
                objectFit: 'cover', 
                objectPosition: 'center' 
              }}
              priority={index < 3} // Prioritize first few images
              onError={() => {
                console.error(`Failed to load grid image: ${image.imageUrl}`);
                setImageErrors(prev => {
                  const newErrors = new Set(prev);
                  newErrors.add(image.id || -1);
                  return newErrors;
                });
              }}
            />
            {/* Optional: Add description overlay */}
            {image.description && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {image.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show error message if no images could be loaded */}
      {images.length > 0 && imageErrors.size === images.length && (
        <div className="border rounded-lg p-12 flex items-center justify-center bg-gray-50 h-64">
          <p className="text-red-500">Unable to load any images</p>
        </div>
      )}

      {/* Modal for full-screen image view */}
      {selectedImage && <ImageModal image={selectedImage} />}
    </div>
  );
};

export default ImageGallery;