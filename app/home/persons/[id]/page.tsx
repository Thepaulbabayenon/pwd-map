import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import  db  from "@/app/db/db";
import { person} from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft, MapPin, Calendar, Briefcase, IdCard } from "lucide-react";

interface PersonPageProps {
  params: {
    id: string;
  };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const personId = await parseInt(params.id);
  
  // Check if the ID is a valid number
  if (isNaN(personId)) {
    notFound();
  }
  
  // Fetch the person details from the database
  const personData = await db.query.person.findFirst({
    where: eq(person.id, personId),
    with: {
      images: true,
    },
  });
  
  // If person not found, show 404 page
  if (!personData) {
    notFound();
  }
  
  // Format the full name correctly
  const fullName = [
    personData.firstName || "",
    personData.middleName || "",
    personData.lastName || ""
  ].filter(Boolean).join(" ") || personData.name || "Unknown";
  
  return (
    <div className="max-w-5xl mx-auto p-6">
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
            {/* Left column - Images */}
            <div className="md:col-span-1">
              {personData.images && personData.images.length > 0 ? (
                <div className="space-y-4">
                  {personData.images.map((img) => (
                    <div key={img.id} className="border rounded-lg overflow-hidden">
                      <Image 
                        src={img.imageUrl} 
                        alt={img.description || `Photo of ${fullName}`}
                        width={400}
                        height={300}
                        className="w-full h-auto object-cover"
                      />
                      {img.description && (
                        <div className="p-2 text-sm text-gray-600">{img.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg p-12 flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500">No images available</p>
                </div>
              )}
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
                    
                    {personData.age && (
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
    </div>
  );
}