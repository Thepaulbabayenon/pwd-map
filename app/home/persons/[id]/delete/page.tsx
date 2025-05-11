"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Trash2, Loader2, AlertTriangle } from "lucide-react";

export default function DeletePersonPage() {
  const router = useRouter();
  const params = useParams();
  const personId = params.id as string;
  
  const [personData, setPersonData] = useState({
    idNumber: "",
    name: "",
    firstName: "",
    lastName: "",
    address: "",
    dob: "",
    gender: "",
    disabilityType: "",
    employment: "",
    imageUrl: "",
  });
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
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
        
        const data = await response.json();
        setPersonData(data);
      } catch (error) {
        console.error("Error fetching person data:", error);
        setDeleteError("Failed to load person data");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (personId) {
      fetchPersonData();
    }
  }, [personId]);

  // Handle delete confirmation
  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(`/api/persons/${personId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete person record");
      }

      // Redirect to the person list
      router.push("/home/persons");
      router.refresh();
      
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "An unknown error occurred");
      setIsDeleting(false);
    }
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Delete Person Record</h1>
          <div className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="font-medium">Warning: This action cannot be undone</span>
          </div>
        </div>
        
        {deleteError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            <p>{deleteError}</p>
          </div>
        )}
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Confirm Deletion</h3>
              <p className="mt-2 text-sm text-red-700">
                You are about to permanently delete the record for <strong>{personData.name}</strong>. 
                This will remove all associated data and cannot be recovered.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-md overflow-hidden mb-8">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h2 className="font-semibold">Person Details</h2>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {personData.imageUrl && (
                <div className="md:col-span-2 flex justify-center mb-4">
                  <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-gray-200">
                    <img 
                      src={personData.imageUrl} 
                      alt={personData.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">ID Number</h3>
                <p className="mt-1">{personData.idNumber || "Not provided"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="mt-1">{personData.name || "Not provided"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1">{personData.address || "Not provided"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                <p className="mt-1">
                  {personData.dob ? new Date(personData.dob).toLocaleDateString() : "Not provided"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                <p className="mt-1">{personData.gender || "Not provided"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Employment Status</h3>
                <p className="mt-1">{personData.employment || "Not provided"}</p>
              </div>
              
              {personData.disabilityType && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Disability Type</h3>
                  <p className="mt-1">{personData.disabilityType}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Link
            href="/home/persons"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}