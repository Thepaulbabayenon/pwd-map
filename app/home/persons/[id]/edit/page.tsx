"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import { z } from "zod";
import MediaUploader from "@/components/ImageUpload";

// Define the form validation schema based on the database schema
const personSchema = z.object({
  idNumber: z.string().min(1, "ID Number is required"),
  doi: z.string().optional().nullable().transform(val => val || ""),
  name: z.string().min(1, "Full name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional().nullable().transform(val => val || ""),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  dob: z.string().min(1, "Date of birth is required"),
  age: z.string().optional().nullable().transform(val => val || ""),
  gender: z.string().min(1, "Gender is required"),
  disabilityType: z.string().optional().nullable().transform(val => val || ""),
  specificDisability: z.string().optional().nullable().transform(val => val || ""),
  idStatus: z.string().optional().nullable().transform(val => val || ""),
  employment: z.string().optional().nullable().transform(val => val || ""),
  imageUrl: z.string().optional().nullable().transform(val => val || ""),
  imageDescription: z.string().optional().nullable().transform(val => val || ""), 
});

type PersonFormData = z.infer<typeof personSchema>;

export default function EditPersonPage() {
  const router = useRouter();
  const params = useParams();
  const personId = params.id as string;
  
  const [formData, setFormData] = useState<PersonFormData>({
    idNumber: "",
    doi: "",
    name: "",
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    latitude: undefined,
    longitude: undefined,
    dob: "",
    age: "",
    gender: "",
    disabilityType: "",
    specificDisability: "",
    idStatus: "",
    employment: "",
    imageUrl: "",
    imageDescription: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Fetch person data on component mount
  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/persons/${personId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
          } else {
            throw new Error("Failed to fetch person data");
          }
          return;
        }
        
        const personData = await response.json();
        
        // Format date fields for form inputs
        const formattedData = {
          ...personData,
          dob: personData.dob ? new Date(personData.dob).toISOString().split('T')[0] : "",
          doi: personData.doi ? new Date(personData.doi).toISOString().split('T')[0] : "",
          age: personData.age?.toString() || "",
          // Ensure no null values in string fields
          middleName: personData.middleName || "",
          specificDisability: personData.specificDisability || "",
          disabilityType: personData.disabilityType || "",
          idStatus: personData.idStatus || "",
          employment: personData.employment || "",
          imageUrl: personData.imageUrl || "",
          imageDescription: personData.imageDescription || "",
        };
        
        setFormData(formattedData);
      } catch (error) {
        console.error("Error fetching person data:", error);
        setSubmitError("Failed to load person data");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (personId) {
      fetchPersonData();
    }
  }, [personId]);

  // Properly handle changes to form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Handle numeric conversions for latitude and longitude
    if (name === 'latitude' || name === 'longitude') {
      // Only convert to number if the value is not empty
      const numValue = value === '' ? undefined : parseFloat(value);
      
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      // Handle all other fields normally as strings, ensure no null values
      setFormData(prev => ({
        ...prev,
        [name]: value || "",
      }));
    }
  };

  // Handle image upload from the MediaUploader component
  const handleMediaUpload = (mediaData: { 
    mediaUrl: string; 
    publicId?: string; 
    description: string; 
    mediaId?: number;
    mediaType: "video" | "image";
  }) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: mediaData.mediaUrl,
      imageDescription: mediaData.description,
    }));
  };

  // Try to get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Handle form submission with better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset state before submission
    setIsSubmitting(true);
    setSubmitError("");
    setErrors({});

    try {
      // Validate form data
      const validatedData = personSchema.parse(formData);
      
      // Process form submission
      const response = await fetch(`/api/persons/${personId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update person record");
      }

      // Redirect to the person list
      router.push("/home/persons");
      router.refresh();
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        // Handle other errors
        setSubmitError(error instanceof Error ? error.message : "An unknown error occurred");
      }
    } finally {
      // Always reset isSubmitting, regardless of success or failure
      setIsSubmitting(false);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    if (!dob) return;
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    setFormData(prev => ({
      ...prev,
      age: age.toString(),
    }));
  };

  // If we're loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-xl">Loading person data...</span>
      </div>
    );
  }

  // If person not found, show not found message
  if (notFound) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <Link 
            href="/home/persons" 
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Persons List
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Person Not Found</h1>
          <p className="text-gray-600 mb-6">The person record you are looking for does not exist or has been removed.</p>
          <Link 
            href="/home/persons" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Persons List
          </Link>
        </div>
      </div>
    );
  }

  // Check if there are any form errors that would prevent submission
  const hasFormErrors = Object.keys(errors).length > 0;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <Link 
          href="/home/persons" 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Persons List
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Edit Person: {formData.name}</h1>
        
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            <p>{submitError}</p>
          </div>
        )}
        
        {hasFormErrors && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6" role="alert">
            <p>Please fix the errors highlighted below before submitting.</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number*
                </label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.idNumber ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.idNumber && <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          {/* Name Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Name Details</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
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
                  className={`w-full px-3 py-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>
              
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={formData.middleName || ""} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  className={`w-full px-3 py-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>
          </div>
          
          {/* Location Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Location Information</h2>
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address*
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude ?? ""}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude ?? ""}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Get Current Location
                </button>
              </div>
            </div>
          </div>
          
          {/* Demographic Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Demographic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth*
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={(e) => {
                    handleChange(e);
                    calculateAge(e.target.value);
                  }}
                  className={`w-full px-3 py-2 border rounded-md ${errors.dob ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
              </div>
              
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="text"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  readOnly
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender*
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="disabilityType" className="block text-sm font-medium text-gray-700 mb-1">
                  Disability Type
                </label>
                <select
                  id="disabilityType"
                  name="disabilityType"
                  value={formData.disabilityType || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Disability Type</option>
                  <option value="Physical">Physical</option>
                  <option value="Visual">Visual</option>
                  <option value="Hearing">Hearing</option>
                  <option value="Cognitive">Cognitive</option>
                  <option value="Multiple">Multiple</option>
                  <option value="None">None</option>
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
                  value={formData.specificDisability || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label htmlFor="idStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Status
                </label>
                <select
                  id="idStatus"
                  name="idStatus"
                  value={formData.idStatus || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select ID Status</option>
                  <option value="Valid">Valid</option>
                  <option value="Expired">Expired</option>
                  <option value="Pending">Pending</option>
                  <option value="None">None</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="employment" className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Status
                </label>
                <select
                  id="employment"
                  name="employment"
                  value={formData.employment || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Employment Status</option>
                  <option value="Employed">Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Student">Student</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Image Upload Section - Using MediaUploader component */}
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Upload Photo</h2>
            <div className="mb-6">
              <MediaUploader
                onMediaUpload={handleMediaUpload}
                mediaUrl={formData.imageUrl}
                onChange={(value) => setFormData(prev => ({ ...prev, imageUrl: value }))}
                initialDescription={formData.imageDescription || ''}
                idNumber={formData.idNumber}
                apiEndpoint="/api/upload"
              />
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/home/persons"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center px-4 py-2 text-white rounded-md ${
                isSubmitting 
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Person
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}