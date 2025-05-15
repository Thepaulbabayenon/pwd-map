'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, X, CheckCircle, Camera, Trash2, Film } from 'lucide-react';

// Define updated types for the component props
interface MediaUploaderProps {
  onMediaUpload: (mediaData: {
    mediaUrl: string;
    publicId?: string;
    description: string;
    mediaId?: number;
    mediaType: 'image' | 'video';
  }) => void;
  mediaUrl?: string; // Optional prop for initial media URL
  onChange?: (value: string) => void; // Optional callback for when media changes
  initialDescription?: string; // Optional initial description
  idNumber: string; // ID number is required
  apiEndpoint?: string; // Optional API endpoint for uploading
  showExistingMedia?: boolean; // Whether to show existing media
  initialMediaType?: 'image' | 'video'; // Optional initial media type
  maxAllowed?: number; // Maximum number of media items allowed
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onMediaUpload,
  mediaUrl: initialMediaUrl,
  onChange,
  initialDescription = '',
  idNumber,
  apiEndpoint = '/api/upload',
  showExistingMedia = true,
  initialMediaType = 'image',
  maxAllowed = 4
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(initialMediaUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [description, setDescription] = useState<string>(initialDescription);
  const [mediaType, setMediaType] = useState<'image' | 'video'>(initialMediaType);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingMedia, setExistingMedia] = useState<Array<{
    id: number;
    url: string;
    description: string;
    createdAt: string;
    mediaType: 'image' | 'video';
  }>>([]);

  // Fetch existing media when component mounts or idNumber changes
  useEffect(() => {
    const fetchExistingMediaInternal = async () => {
      if (idNumber && showExistingMedia) {
        try {
          setLoading(true);
          const response = await fetch(`/api/upload/media?idNumber=${idNumber}`);
          if (!response.ok) {
            throw new Error('Failed to fetch media');
          }
          const data = await response.json();
          if (data.success && data.media) {
            setExistingMedia(data.media);
          }
        } catch (err) {
          console.error('Error fetching media:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchExistingMediaInternal();
  }, [idNumber, showExistingMedia]);

  // Moved fetchExistingMedia inside the component to be used elsewhere
  const fetchExistingMedia = async () => {
    if (!idNumber) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/upload/media?idNumber=${idNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
      const data = await response.json();
      if (data.success && data.media) {
        setExistingMedia(data.media);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update preview if initialMediaUrl changes
  useEffect(() => {
    if (initialMediaUrl) {
      setPreview(initialMediaUrl);
    }
  }, [initialMediaUrl]);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadSuccess(false);

    // Determine media type
    const isVideo = file.type.includes('video/');
    const isImage = file.type.includes('image/');

    // Validate file type
    if (!isVideo && !isImage) {
      setError('Please select an image or video file.');
      return;
    }

    setMediaType(isVideo ? 'video' : 'image');

    // File size validation (limit to 50MB for videos, 5MB for images)
    const maxSize = isVideo ? 500 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`${isVideo ? 'Video' : 'Image'} size should be less than ${isVideo ? '50MB' : '5MB'}.`);
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
      setError('Please select a media file to upload.');
      return;
    }

    if (!idNumber) {
      setError('ID number is required for upload.');
      return;
    }

    // Check if we've reached the maximum number of media items
    if (existingMedia.length >= maxAllowed) {
      setError(`Maximum of ${maxAllowed} media items allowed per ID. Please delete one before uploading a new one.`);
      return;
    }

    // If preview is already a URL (not a data URL) and matches initialMediaUrl,
    // we can skip upload as the media is already uploaded
    if (preview === initialMediaUrl && !fileInputRef.current?.files?.[0]) {
      if (onChange) {
        onChange(preview);
      }
      onMediaUpload({
        mediaUrl: preview,
        description: description.trim() || 'No description provided',
        mediaType: mediaType
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
      formData.append('fileType', mediaType);
      
      // Upload to our Next.js API endpoint
      const uploadResponse = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload media');
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload successful:', uploadResult);

      // Update onChange if provided
      if (onChange) {
        onChange(uploadResult.url);
      }

      // Call the onMediaUpload callback with the media URL and description
      onMediaUpload({
        mediaUrl: uploadResult.url,
        publicId: uploadResult.publicId || '',
        description: description.trim() || 'No description provided',
        mediaId: uploadResult.mediaId,
        mediaType: uploadResult.mediaType || mediaType
      });

      // Reset the form
      setUploadSuccess(true);
      setPreview(null);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Fetch the updated list of media
      fetchExistingMedia();
      
      setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error uploading media:', err);
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? (err as Error).message 
        : 'Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle removing the media
  const handleRemoveMedia = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Call onChange with empty string if provided
    if (onChange) {
      onChange('');
    }
  };

  // Handle deleting an existing media item
  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm('Are you sure you want to delete this media item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/upload/delete?mediaId=${mediaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete media');
      }

      // Refresh the media list
      fetchExistingMedia();
      
      // Show success message
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error deleting media:', err);
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? (err as Error).message 
        : 'Failed to delete media. Please try again.');
    }
  };

  const displayText = idNumber 
    ? `Uploading for ID: ${idNumber}`
    : 'Add media to this profile';

  // Render preview based on media type
  const renderPreview = () => {
    if (!preview) return null;

    if (mediaType === 'video') {
      return (
        <div className="relative mb-4 w-full h-48">
          <video 
            src={preview} 
            controls 
            className="w-full h-full object-contain rounded-md"
          />
          <button 
            onClick={handleRemoveMedia}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      );
    } else {
      return (
        <div className="relative mb-4 w-full h-48">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain rounded-md"
          />
          <button 
            onClick={handleRemoveMedia}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      );
    }
  };

  // Render media grid item based on media type
  const renderMediaItem = (item: {
    id: number;
    url: string;
    description: string;
    mediaType: 'image' | 'video';
  }) => {
    if (item.mediaType === 'video') {
      return (
        <div key={item.id} className="relative border border-gray-200 rounded-md overflow-hidden">
          <div className="relative h-32">
            <video
              src={item.url}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
              <Film size={12} />
            </div>
          </div>
          <div className="p-2">
            <p className="text-xs text-gray-600 truncate" title={item.description}>
              {item.description}
            </p>
            <button
              onClick={() => handleDeleteMedia(item.id)}
              className="mt-2 flex items-center text-xs text-red-600 hover:text-red-800"
            >
              <Trash2 size={12} className="mr-1" />
              Delete
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div key={item.id} className="relative border border-gray-200 rounded-md overflow-hidden">
          <div className="relative h-32">
            <Image
              src={item.url}
              alt={item.description}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-2">
            <p className="text-xs text-gray-600 truncate" title={item.description}>
              {item.description}
            </p>
            <button
              onClick={() => handleDeleteMedia(item.id)}
              className="mt-2 flex items-center text-xs text-red-600 hover:text-red-800"
            >
              <Trash2 size={12} className="mr-1" />
              Delete
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800">Upload Media</h3>
        <p className="text-sm text-gray-500">{displayText}</p>
        {existingMedia.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {existingMedia.length} of {maxAllowed} media items uploaded
          </p>
        )}
      </div>

      {/* Media Preview */}
      {preview ? (
        renderPreview()
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors mb-4"
        >
          <div className="flex gap-2">
            <Camera size={36} className="text-gray-400" />
            <Film size={36} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1 mt-2">Click to select media</p>
          <p className="text-xs text-gray-400">Images: JPG, PNG, GIF (max 5MB)</p>
          <p className="text-xs text-gray-400">Videos: MP4, MOV, WebM (max 500MB)</p>
        </div>
      )}

      {/* File Input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Description Input */}
      <div className="mb-4">
        <label htmlFor="media-description" className="block text-sm font-medium text-gray-700 mb-1">
          Media Description
        </label>
        <textarea
          id="media-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Provide a brief description of this media..."
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
        disabled={uploading || !preview || existingMedia.length >= maxAllowed}
        className={`w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center ${
          uploading || !preview || existingMedia.length >= maxAllowed
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
            Upload Media
          </>
        )}
      </button>

      {/* Existing Media */}
      {showExistingMedia && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-2">Existing Media</h4>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : existingMedia.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No media uploaded yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {existingMedia.map((media) => renderMediaItem(media))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;