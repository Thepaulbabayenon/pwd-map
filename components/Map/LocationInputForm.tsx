'use client';

import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, UserRound, Building, ArrowRight } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Define disability types for dropdown options
const disabilityTypes = [
  'Visual Impairment',
  'Hearing Impairment',
  'Mobility Impairment',
  'Cognitive Impairment',
  'Other'
];

// Define facility types for dropdown options
const facilityTypes = [
  'hospital',
  'clinic',
  'rehabilitation center',
  'community center',
  'special needs school',
  'other'
];

const LocationInputForm = () => {
  const router = useRouter();
  
  // Form states with simplified structure 
  const [formStep, setFormStep] = useState(1); // 1: Person info, 2: Location
  const [formData, setFormData] = useState({
    // Person information
    firstName: '',
    lastName: '',
    disabilityType: '',
    specificDisability: '',
    
    // Location
    latitude: '',
    longitude: '',
  });
  
  // Handle input changes
type FormData = {
    firstName: string;
    lastName: string;
    disabilityType: string;
    specificDisability: string;
    latitude: string;
    longitude: string;
};

const handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
        ...formData,
        [name]: value
    });
};
  
  // Use geolocation API to get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    const loadingToast = toast.loading('Fetching current location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss(loadingToast);
        toast.success('Location fetched successfully!');
        
        const { latitude, longitude } = position.coords;
        
        setFormData({
          ...formData,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        });
      },
      (error) => {
        toast.dismiss(loadingToast);
        toast.error(`Error getting location: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  
  // Go to next step in form
  const nextStep = () => {
    if (formStep === 1) {
      // Validate person info fields
      if (!formData.firstName || !formData.lastName || !formData.disabilityType) {
        toast.error('Please fill all required person information fields');
        return;
      }
    }
    
    setFormStep(formStep + 1);
  };
  
  // Go to previous step in form
  const prevStep = () => {
    setFormStep(formStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate location fields
    if (!formData.latitude || !formData.longitude) {
      toast.error('Please provide location coordinates');
      return;
    }
    
    // Validate latitude and longitude formats
    if (
      isNaN(parseFloat(formData.latitude)) || 
      isNaN(parseFloat(formData.longitude)) ||
      parseFloat(formData.latitude) < -90 ||
      parseFloat(formData.latitude) > 90 ||
      parseFloat(formData.longitude) < -180 ||
      parseFloat(formData.longitude) > 180
    ) {
      toast.error('Please enter valid latitude (-90 to 90) and longitude (-180 to 180) values');
      return;
    }
    
    // Here you would typically submit to your API
    // For now, we'll simulate an API call with a timeout
    toast.loading('Saving person data...');
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success toast
      toast.dismiss();
      toast.success('Person added successfully!');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        disabilityType: '',
        specificDisability: '',
        latitude: '',
        longitude: '',
      });
      
      setFormStep(1);
      
      // Refresh the page to show the new data
      // In a real app, you might use SWR or React Query to revalidate
      router.refresh();
      
    } catch (error) {
      toast.dismiss();
      toast.error('Error saving data. Please try again.');
    }
  };
  
  // Render different form steps based on current step
  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Person Information</h2>
            <p className="text-gray-600 text-sm">Enter details about the person</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disability Type *
              </label>
              <select
                name="disabilityType"
                value={formData.disabilityType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select disability type</option>
                {disabilityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Disability (Optional)
              </label>
              <input
                type="text"
                name="specificDisability"
                value={formData.specificDisability}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E.g. Macular Degeneration"
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Location Information</h2>
            <p className="text-gray-600 text-sm">Enter the person's current location</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 37.7749"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. -122.4194"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={getCurrentLocation}
              className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition flex items-center justify-center text-gray-700"
            >
              <MapPin size={16} className="mr-2 text-blue-600" />
              Use Current Location
            </button>
            
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Back
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Save Person
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg">
      <Toaster position="top-center" />
      
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            formStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            <UserRound size={18} />
          </div>
          <div className={`h-1 w-12 ${
            formStep > 1 ? 'bg-blue-600' : 'bg-gray-200'
          }`}></div>
        </div>
        
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            formStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            <MapPin size={18} />
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {renderFormStep()}
      </form>
    </div>
  );
};
export default LocationInputForm;