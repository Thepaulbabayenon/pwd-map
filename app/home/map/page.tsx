import {db} from "@/app/db/db";
import { PersonMapData } from '@/lib/types';
import { MapPinIcon, BarChart3Icon, Users2Icon, ImageIcon, InfoIcon } from 'lucide-react';
import { ReactNode } from 'react';
import Link from 'next/link';
import MapFilters from '@/components/Map/MapFilters';

// Function to fetch map data from the database
async function getPersonsDataForMap(): Promise<PersonMapData[]> {
  try {
    const personsFromDb = await db.query.person.findMany({
      where: (personTable, { and, isNotNull }) => and(
        isNotNull(personTable.latitude),
        isNotNull(personTable.longitude)
      ),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        disabilityType: true,
        specificDisability: true,
        latitude: true,
        longitude: true,
      },
      with: {
        images: {
          columns: {
            imageUrl: true,
            description: true,
          },
        },
      },
    });

    // Filter again to be absolutely sure and map to the strict PersonMapData type
    return personsFromDb
      .filter(p => p.latitude !== null && p.longitude !== null)
      .map(p => ({
        ...p,
        id: Number(p.id),
        latitude: p.latitude as number,
        longitude: p.longitude as number,
        images: p.images || [],
      })) as PersonMapData[];
  } catch (error) {
    console.error('Error fetching map data:', error);
    return [];
  }
}


// Empty state component
function EmptyState() {
  return (
    <div className="w-full h-[70vh] bg-white rounded-lg border border-gray-100 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <MapPinIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium text-gray-700">No Map Data Available</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
        There are no persons with location data to display on the map at this time.
      </p>
      <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
        Add New Person
      </button>
    </div>
  );
}

// Define interface for StatCard component props
interface StatCardProps {
  icon: ReactNode;
  count: number;
  label: string;
  bgColor: string;
  textColor: string;
}

// Stat Card Component with typed props
function StatCard({ icon, count, label, bgColor, textColor }: StatCardProps) {
  return (
    <div className={`${bgColor} p-5 rounded-lg shadow-sm flex items-center space-x-4 transition-transform hover:scale-102 duration-300`}>
      <div className={`${textColor} bg-white bg-opacity-25 p-3 rounded-full`}>
        {icon}
      </div>
      <div>
        <span className={`${textColor} font-bold text-2xl`}>{count}</span>
        <p className="text-gray-700 text-sm font-medium mt-1">{label}</p>
      </div>
    </div>
  );
}

export default async function MapPage() {
  const personsData = await getPersonsDataForMap();
  
  // Calculate stats data
  const totalPersons = personsData.length;
  const uniqueDisabilityTypes = new Set(personsData.map(p => p.disabilityType)).size;
  const totalImages = personsData.reduce((total, person) => total + (person.images?.length || 0), 0);
  
  // Get disability distribution
  const disabilityDistribution = personsData.reduce((acc, person) => {
    const type = person.disabilityType || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col space-y-6">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Interactive Disability Map</h1>
            <p className="text-gray-600 mt-1">Explore the geographic distribution of individuals in our database</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-2">
              <InfoIcon className="w-4 h-4" />
              <span>Help</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4" />
              <span>Add Location</span>
            </button>
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={<Users2Icon className="w-6 h-6" />}
            count={totalPersons}
            label="Total Individuals"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatCard 
            icon={<BarChart3Icon className="w-6 h-6" />}
            count={uniqueDisabilityTypes}
            label="Disability Types"
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <StatCard 
            icon={<ImageIcon className="w-6 h-6" />}
            count={totalImages}
            label="Total Images"
            bgColor="bg-purple-50"
            textColor="text-purple-600"
          />
        </div>
        
        {/* Filter section - Now uses client component */}
        {totalPersons > 0 && (
          <MapFilters 
            initialData={personsData} 
            disabilityTypes={Object.keys(disabilityDistribution)} 
          />
        )}

        {/* Legacy map section - will be replaced by the client component */}
        {personsData.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="relative">
              <EmptyState />
            </div>
          </div>
        )}
        
        {/* Data table preview (collapsed by default) */}
        {personsData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Mapped Individuals</h2>
              <Link href="/home/persons" className="text-blue-600 hover:underline text-sm font-medium">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disability Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specific Disability</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {personsData.slice(0, 3).map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{person.firstName} {person.lastName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.disabilityType || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.specificDisability || 'Not specified'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.images?.length || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a href={`/home/persons/${person.id}`} className="text-blue-600 hover:text-blue-900">View</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {personsData.length > 3 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Showing 3 of {personsData.length} records
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Revalidate data every 5 minutes to avoid excessive DB queries
export const revalidate = 300;