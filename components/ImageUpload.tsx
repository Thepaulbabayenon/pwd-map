'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import { ImageIcon, Upload, X, CheckCircle } from 'lucide-react';

// Define updated types for the component props
interface ImageUploaderProps {
  onImageUpload: (imageData: {
    imageUrl: string;
    fileId: string;
    description: string;
  }) => void;
  imageUrl?: string; // Optional prop for initial image URL
  onChange?: (value: string) => void; // Optional callback for when image changes
  initialDescription?: string; // Optional initial description
}

// Define type for API response
interface AuthResponse {
  publicKey: string;
  signature: string;
  token: string;
  expire: string;
}

interface UploadResponse {
  url: string;
  fileId: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  imageUrl: initialImageUrl, 
  onChange,
  initialDescription = ''
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [description, setDescription] = useState<string>(initialDescription);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // If preview is already a URL (not a data URL) and matches initialImageUrl,
    // we can skip upload as the image is already uploaded
    if (preview === initialImageUrl && !fileInputRef.current?.files?.[0]) {
      if (onChange) {
        onChange(preview);
      }
      onImageUpload({
        imageUrl: preview,
        fileId: '', // We don't have fileId for existing images
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
      // Fetch authentication parameters from your backend
      const authResponse = await fetch('/api/imagekit');
      const authData: AuthResponse = await authResponse.json();

      // Prepare the upload form data
      const formData = new FormData();
      formData.append('file', fileInputRef.current.files[0]);
      formData.append('publicKey', authData.publicKey);
      formData.append('signature', authData.signature);
      formData.append('token', authData.token);
      formData.append('expire', authData.expire);
      formData.append('fileName', `map_image_${Date.now()}`);

      // Upload to ImageKit
      const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadResult: UploadResponse = await uploadResponse.json();

      // Update onChange if provided
      if (onChange) {
        onChange(uploadResult.url);
      }

      // Call the onImageUpload callback with the image URL and description
      onImageUpload({
        imageUrl: uploadResult.url,
        fileId: uploadResult.fileId,
        description: description.trim() || 'No description provided'
      });

      // Reset the form
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
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

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800">Upload Image</h3>
        <p className="text-sm text-gray-500">Add images to this location</p>
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
          <ImageIcon size={48} className="text-gray-400 mb-2" />
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
          Image uploaded successfully!
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading || !preview}
        className={`w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center ${
          uploading || !preview
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
    </div>
  );
};

export default ImageUploader;