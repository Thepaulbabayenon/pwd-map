'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import {  Upload, X, CheckCircle, Camera, Trash2 } from 'lucide-react';

// Define updated types for the component props
interface ImageUploaderProps {
  onImageUpload: (imageData: {
    imageUrl: string;
    publicId?: string;
    description: string;
    imageId?: number;
  }) => void;
  imageUrl?: string; // Optional prop for initial image URL
  onChange?: (value: string) => void; // Optional callback for when image changes
  initialDescription?: string; // Optional initial description
  idNumber: string; // ID number is now required
  apiEndpoint?: string; // Optional API endpoint for uploading (default: '/api/imagekit')
  showExistingImages?: boolean; // Whether to show existing images
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  imageUrl: initialImageUrl, 
  onChange,
  initialDescription = '',
  idNumber,
  apiEndpoint = '/api/upload',
  showExistingImages = true
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [description, setDescription] = useState<string>(initialDescription);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingImages, setExistingImages] = useState<Array<{
    id: number;
    url: string;
    description: string;
    createdAt: string;
  }>>([]);

  // Fetch existing images when component mounts or idNumber changes
  useEffect(() => {
    const fetchExistingImagesInternal = async () => {
      if (idNumber && showExistingImages) {
        try {
          setLoading(true);
          const response = await fetch(`/api/upload/image?idNumber=${idNumber}`);
          if (!response.ok) {
            throw new Error('Failed to fetch images');
          }
          const data = await response.json();
          if (data.success && data.images) {
            setExistingImages(data.images);
          }
        } catch (err) {
          console.error('Error fetching images:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchExistingImagesInternal();
  }, [idNumber, showExistingImages]);

  // Moved fetchExistingImages inside the component to be used elsewhere
  const fetchExistingImages = async () => {
    if (!idNumber) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/upload/image?idNumber=${idNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      if (data.success && data.images) {
        setExistingImages(data.images);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update preview if initialImageUrl changes
  useEffect(() => {
    if (initialImageUrl) {
      setPreview(initialImageUrl);
    }
  }, [initialImageUrl]);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadSuccess(false);

    // Validate file type
    if (!file.type.includes('image/')) {
      setError('Please select an image file.');
      return;
    }

    // File size validation (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB.');
      return;
    }

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const previewUrl = reader.result as string;
        setPreview(previewUrl);
        
        // Call onChange if provided
        if (onChange) {
          onChange(previewUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!preview) {
      setError('Please select an image to upload.');
      return;
    }

    if (!idNumber) {
      setError('ID number is required for upload.');
      return;
    }

    // Check if we've reached the maximum number of images
    if (existingImages.length >= 4) {
      setError('Maximum of 4 images allowed per ID. Please delete an image before uploading a new one.');
      return;
    }

    // If preview is already a URL (not a data URL) and matches initialImageUrl,
    // we can skip upload as the image is already uploaded
    if (preview === initialImageUrl && !fileInputRef.current?.files?.[0]) {
      if (onChange) {
        onChange(preview);
      }
      onImageUpload({
        imageUrl: preview,
        description: description.trim() || 'No description provided'
      });
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);
      return;
    }

    if (!fileInputRef.current?.files?.[0]) {
      setError('No file selected.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create a FormData object for the file upload
      const formData = new FormData();
      formData.append('file', fileInputRef.current.files[0]);
      formData.append('description', description.trim() || 'No description provided');
      formData.append('idNumber', idNumber);
      
      // Upload to our Next.js API endpoint
      const uploadResponse = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload successful:', uploadResult);

      // Update onChange if provided
      if (onChange) {
        onChange(uploadResult.url);
      }

      // Call the onImageUpload callback with the image URL and description
      onImageUpload({
        imageUrl: uploadResult.url,
        publicId: uploadResult.publicId || '',
        description: description.trim() || 'No description provided',
        imageId: uploadResult.imageId
      });

      // Reset the form
      setUploadSuccess(true);
      setPreview(null);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Fetch the updated list of images
      fetchExistingImages();
      
      setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? (err as Error).message 
        : 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle removing the image
  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Call onChange with empty string if provided
    if (onChange) {
      onChange('');
    }
  };

  // Handle deleting an existing image
  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`/api/upload/delete?imageId=${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }

      // Refresh the image list
      fetchExistingImages();
      
      // Show success message
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? (err as Error).message 
        : 'Failed to delete image. Please try again.');
    }
  };

  const displayText = idNumber 
    ? `Uploading for ID: ${idNumber}`
    : 'Add images to this profile';

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800">Upload Image</h3>
        <p className="text-sm text-gray-500">{displayText}</p>
        {existingImages.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {existingImages.length} of 4 images uploaded
          </p>
        )}
      </div>

      {/* Image Preview */}
      {preview ? (
        <div className="relative mb-4 w-full h-48">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain rounded-md"
          />
          <button 
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors mb-4"
        >
          <Camera size={48} className="text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-1">Click to select an image</p>
          <p className="text-xs text-gray-400">JPG, PNG, or GIF (max 5MB)</p>
        </div>
      )}

      {/* File Input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Description Input */}
      <div className="mb-4">
        <label htmlFor="image-description" className="block text-sm font-medium text-gray-700 mb-1">
          Image Description
        </label>
        <textarea
          id="image-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Provide a brief description of this image..."
          rows={3}
        ></textarea>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="mb-4 p-2 bg-green-50 text-green-600 text-sm rounded-md flex items-center">
          <CheckCircle size={16} className="mr-2" />
          Operation completed successfully!
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading || !preview || existingImages.length >= 4}
        className={`w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center ${
          uploading || !preview || existingImages.length >= 4
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {uploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <Upload size={16} className="mr-2" />
            Upload Image
          </>
        )}
      </button>

      {/* Existing Images */}
      {showExistingImages && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-2">Existing Images</h4>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : existingImages.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No images uploaded yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {existingImages.map((img) => (
                <div key={img.id} className="relative border border-gray-200 rounded-md overflow-hidden">
                  <div className="relative h-32">
                    <Image
                      src={img.url}
                      alt={img.description}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate" title={img.description}>
                      {img.description}
                    </p>
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="mt-2 flex items-center text-xs text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={12} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;