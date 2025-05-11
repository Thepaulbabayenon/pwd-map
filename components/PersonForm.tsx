// components/PersonForm.tsx
'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MapPinIcon, UserIcon, Save, Image as ImageIcon, X } from 'lucide-react';
import ImageUploader from './ImageUpload';

// Define types
interface Coordinates {
  lat?: number;
  lng?: number;
}

interface FormDataType {
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  latitude: string | number;
  longitude: string | number;
  dob: string;
  age: string;
  gender: string;
  disabilityType: string;
  specificDisability: string;
  idNumber: string;
  idStatus: string;
  employment: string;
  doi: string;
}

interface UploadedImage {
  imageUrl: string;
  description: string;
}

interface PersonFormProps {
  initialCoordinates?: Coordinates;
}

const PersonForm: React.FC<PersonFormProps> = ({ initialCoordinates }) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    latitude: initialCoordinates?.lat || '',
    longitude: initialCoordinates?.lng || '',
    dob: '',
    age: '',
    gender: '',
    disabilityType: '',
    specificDisability: '',
    idNumber: '',
    idStatus: '',
    employment: '',
    doi: ''
  });

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (imageData: UploadedImage) => {
    setUploadedImages(prev => [...prev, imageData]);
  };

  // Remove an uploaded image
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First, create the person record
      const personResponse = await fetch('/api/persons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!personResponse.ok) {
        throw new Error('Failed to create person record');
      }

      const personData = await personResponse.json();
      const personId = personData.id;

      // Then, add images if any were uploaded
      if (uploadedImages.length > 0) {
        const imagePromises = uploadedImages.map(image => 
          fetch('/api/person-images', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              personId,
              imageUrl: image.imageUrl,
              description: image.description
            }),
          })
        );

        await Promise.all(imagePromises);
      }

      // Success! Redirect to the map page
      router.push('/map');
      router.refresh();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create select options for disability types
  const disabilityTypes = [
    "Physical",
    "Visual",
    "Hearing",
    "Intellectual",
    "Psychosocial",
    "Multiple",
    "Other"
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <UserIcon className="mr-2 h-6 w-6 text-blue-600" />
          Add New Person
        </h2>
        <p className="text-gray-600 mt-1">Enter the person&aposs details and upload images</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name*
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input
                type="text"
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name*
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Information Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <MapPinIcon className="mr-2 h-5 w-5 text-blue-600" />
            Location Information
          </h3>
          
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address*
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                Latitude*
              </label>
              <input
                type="number"
                step="any"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                Longitude*
              </label>
              <input
                type="number"
                step="any"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Disability Information Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Disability Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="disabilityType" className="block text-sm font-medium text-gray-700 mb-1">
                Disability Type*
              </label>
              <select
                id="disabilityType"
                name="disabilityType"
                value={formData.disabilityType}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Disability Type</option>
                {disabilityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="specificDisability" className="block text-sm font-medium text-gray-700 mb-1">
                Specific Disability
              </label>
              <input
                type="text"
                id="specificDisability"
                name="specificDisability"
                value={formData.specificDisability}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ID Information Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">ID Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                ID Number
              </label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="idStatus" className="block text-sm font-medium text-gray-700 mb-1">
                ID Status
              </label>
              <input
                type="text"
                id="idStatus"
                name="idStatus"
                value={formData.idStatus}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="doi" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Issue
              </label>
              <input
                type="date"
                id="doi"
                name="doi"
                value={formData.doi}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="employment" className="block text-sm font-medium text-gray-700 mb-1">
              Employment Status
            </label>
            <input
              type="text"
              id="employment"
              name="employment"
              value={formData.employment}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="space-y-4">
          <ImageUploader onImageUpload={handleImageUpload} />
          
          {/* Display uploaded images */}
          {uploadedImages.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded border border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center mr-3">
                        <ImageIcon size={20} className="text-blue-600" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-800 truncate">{image.description}</p>
                        <p className="text-xs text-gray-500 truncate">{image.imageUrl.split('/').pop()}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white font-medium flex items-center ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Person
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonForm;