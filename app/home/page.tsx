'use client';

import { useState, useEffect, ComponentType } from 'react';
import { Child, PersonMapData } from '@/lib/types';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/Map/MapComponent'), { ssr: false });
const Map = dynamic(() => import('@/components/Map'), { ssr: false });
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPinIcon, 
  UsersIcon, 
  PieChartIcon, 
  BarChart3Icon, 
  ChevronRightIcon, 
  ArrowRightIcon, 
  HeartIcon, 
  HandIcon, 
  UserPlusIcon 
} from 'lucide-react';

// Extract components for better organization
const LoadingIndicator = () => (
  <div className="flex justify-center items-center h-64">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-sm text-gray-500">Loading data...</p>
    </div>
  </div>
);

const StatisticCard = ({ 
  color, 
  icon: Icon, 
  value, 
  title, 
  description 
}: { 
  color: string, 
  icon: ComponentType<{ className?: string }>, 
  value: string, 
  title: string, 
  description: string 
}) => (
  <div className="bg-white rounded-xl shadow-sm p-8 text-center relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
    <div className={`absolute top-0 left-0 w-full h-1 bg-${color}-600`}></div>
    <div className={`bg-${color}-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6`}>
      <Icon className={`h-8 w-8 text-${color}-600`} />
    </div>
    <div className={`text-${color}-600 text-4xl font-bold mb-3`}>{value}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const TabButton = ({ 
  name, 
  label, 
  activeTab, 
  onClick 
}: { 
  name: string, 
  label: string, 
  activeTab: string, 
  onClick: (tab: string) => void 
}) => (
  <button
    onClick={() => onClick(name)}
    className={`py-4 px-6 font-medium text-base relative ${
      activeTab === name
        ? 'text-blue-600'
        : 'text-gray-500 hover:text-gray-700'
    }`}
    aria-selected={activeTab === name}
    role="tab"
  >
    {label}
    {activeTab === name && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
    )}
  </button>
);

const ChildProfileCard = ({ 
  child, 
  onClose 
}: { 
  child: Child, 
  onClose: () => void 
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
    <div className="flex items-center mb-4">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mr-4">
        {child.imageUrl ? (
          <Image
            src={child.imageUrl}
            alt={child.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
            <UsersIcon className="h-8 w-8" />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800">{child.name}</h3>
        <p className="text-sm text-gray-500">ID: #{child.id}</p>
      </div>
    </div>
    
    <div className="space-y-4 mt-6">
      <div className="flex border-b border-gray-100 pb-2">
        <span className="w-1/3 text-gray-500 text-sm">Age</span>
        <span className="w-2/3 font-medium">{child.age} years</span>
      </div>
      <div className="flex border-b border-gray-100 pb-2">
        <span className="w-1/3 text-gray-500 text-sm">Disability</span>
        <span className="w-2/3 font-medium">{child.disability}</span>
      </div>
      <div className="flex border-b border-gray-100 pb-2">
        <span className="w-1/3 text-gray-500 text-sm">Address</span>
        <span className="w-2/3 font-medium">{child.address}</span>
      </div>
      <div className="flex pb-2">
        <span className="w-1/3 text-gray-500 text-sm">Coordinates</span>
        <span className="w-2/3 font-medium text-gray-700">
          {child.lat.toFixed(4)}, {child.lng.toFixed(4)}
        </span>
      </div>
    </div>
    
    <div className="mt-6 flex space-x-3">
      <Link 
        href={`/children/${child.id}`}
        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-center text-sm font-medium hover:bg-blue-700 transition duration-300"
      >
        View Full Profile
      </Link>
      <button 
        className="bg-gray-100 text-gray-700 p-2 rounded-md hover:bg-gray-200 transition duration-300"
        onClick={onClose}
        aria-label="Close profile"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
);

export default function HomePage() {
  // State for sample data - in production, this would come from an API
  const [persons, setPersons] = useState<PersonMapData[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sample data loading - simulating API fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would fetch this data from an API
        // await Promise.all([
        //   fetch('/api/persons').then(res => res.json()),
        //   fetch('/api/children').then(res => res.json())
        // ]);
        
        // Sample data for the disabilities map
        const samplePersons: PersonMapData[] = [
          {
            id: 1,
            firstName: "Maria",
            lastName: "Garcia",
            latitude: 14.5995,
            longitude: 120.9842,
            disabilityType: "Physical",
            specificDisability: "Mobility impairment",
            images: [
              { imageUrl: "/api/placeholder/150/150", description: "Medical certificate" },
              { imageUrl: "/api/placeholder/150/150", description: "ID card" }
            ]
          },
          {
            id: 2,
            firstName: "John",
            lastName: "Santos",
            latitude: 14.6091,
            longitude: 121.0223,
            disabilityType: "Visual",
            specificDisability: "Low vision",
            images: [
              { imageUrl: "/api/placeholder/150/150", description: "Medical assessment" }
            ]
          },
          {
            id: 3,
            firstName: "Ana",
            lastName: "Reyes",
            latitude: 14.5547,
            longitude: 121.0244,
            disabilityType: "Hearing",
            specificDisability: "Partial hearing loss",
            images: []
          }
        ];

        // Sample data for children with disabilities
        const sampleChildren: Child[] = [
          {
            id: 1,
            name: "Miguel Cruz",
            age: 12,
            disability: "Visual impairment",
            lat: 14.6042,
            lng: 121.0448,
            imageUrl: "/api/placeholder/100/100",
            address: "123 Rizal St., Makati City"
          },
          {
            id: 2,
            name: "Sofia Luna",
            age: 8,
            disability: "Hearing impairment",
            lat: 14.5891,
            lng: 121.0614,
            imageUrl: "/api/placeholder/100/100",
            address: "456 Bonifacio Ave., Quezon City"
          },
          {
            id: 3,
            name: "Carlos Mendoza",
            age: 15,
            disability: "Physical disability",
            lat: 14.5742,
            lng: 121.0322,
            imageUrl: "/api/placeholder/100/100",
            address: "789 Mabini St., Manila"
          }
        ];

        setPersons(samplePersons);
        setChildren(sampleChildren);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error state
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle map click for adding new markers
  const handleMapClick = (lat: number, lng: number) => {
    console.log(`New marker position: ${lat}, ${lng}`);
    // In a real app, this would open a form to add a new person at this location
  };

  // Handle child marker selection
  const handleChildSelect = (childId: number) => {
    const child = children.find(c => c.id === childId) || null;
    setSelectedChild(child);
  };

  // Clear selected child
  const clearSelectedChild = () => {
    setSelectedChild(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div 
            className="absolute inset-0" 
            style={{ 
              backgroundImage: "url('/api/placeholder/1600/800')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(1px)'
            }}
            aria-hidden="true"
          ></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Disability Mapping <span className="text-blue-200">Initiative</span>
            </h1>
            <p className="text-xl mb-8 leading-relaxed text-blue-100">
              Discover and understand the distribution of persons with disabilities in our community.
              This platform aims to enhance awareness and support for inclusivity.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab('map')}
                className="bg-white text-blue-800 font-medium py-3 px-8 rounded-md shadow-lg hover:bg-blue-50 transition duration-300 flex items-center group"
                aria-label="View interactive map"
              >
                <MapPinIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                <span>View Interactive Map</span>
                <ChevronRightIcon className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
              </button>
              <Link
                href="/about"
                className="bg-transparent border-2 border-white text-white font-medium py-3 px-8 rounded-md hover:bg-white hover:bg-opacity-10 transition duration-300 flex items-center"
                aria-label="Learn more about the initiative"
              >
                <span>Learn More</span>
                <ArrowRightIcon className="h-5 w-5 ml-2" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12 -mt-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Tabs for different views */}
          <div className="flex border-b border-gray-200" role="tablist">
            <TabButton name="summary" label="Overview" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton name="map" label="Adults Map" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton name="children" label="Children Map" activeTab={activeTab} onClick={setActiveTab} />
          </div>

          {/* Content based on active tab */}
          <div className="p-6" role="tabpanel">
            {activeTab === 'summary' && (
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                      <HeartIcon className="h-6 w-6 mr-2 text-blue-600" aria-hidden="true" />
                      Our Mission
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      To provide a clear, accessible, and data-driven visualization of disability demographics
                      to foster better resource allocation, policy-making, and community support.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                      <HandIcon className="h-6 w-6 mr-2 text-blue-600" aria-hidden="true" />
                      Key Objectives
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <MapPinIcon className="h-4 w-4 text-blue-700" aria-hidden="true" />
                        </div>
                        <p className="text-gray-700">Map the geographic distribution of persons with various disabilities</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <UsersIcon className="h-4 w-4 text-blue-700" aria-hidden="true" />
                        </div>
                        <p className="text-gray-700">Identify areas with concentrated needs for targeted interventions</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <PieChartIcon className="h-4 w-4 text-blue-700" aria-hidden="true" />
                        </div>
                        <p className="text-gray-700">Provide data-driven insights for policymakers and service providers</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <BarChart3Icon className="h-4 w-4 text-blue-700" aria-hidden="true" />
                        </div>
                        <p className="text-gray-700">Support inclusive community planning and development</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                    <UsersIcon className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
                    Disability Overview
                  </h2>
                  
                  {isLoading ? <LoadingIndicator /> : (
                    <>
                      <div className="mb-6">
                        <h3 className="text-sm font-medium uppercase text-gray-500 mb-3">Distribution by Type</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Physical</span>
                              <span>45%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: '45%' }}
                                role="progressbar"
                                aria-valuenow={45}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Visual</span>
                              <span>30%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: '30%' }}
                                role="progressbar"
                                aria-valuenow={30}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Hearing</span>
                              <span>25%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full" 
                                style={{ width: '25%' }}
                                role="progressbar"
                                aria-valuenow={25}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-blue-600">{persons.length + children.length}</p>
                          <p className="text-xs text-gray-600 mt-1">Total Registered</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-green-600">{persons.length}</p>
                          <p className="text-xs text-gray-600 mt-1">Adults</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-yellow-600">{children.length}</p>
                          <p className="text-xs text-gray-600 mt-1">Children</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-center">
                        <button 
                          className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-800 transition-colors"
                          onClick={() => setActiveTab('map')}
                        >
                          View detailed statistics
                          <ChevronRightIcon className="h-4 w-4 ml-1" aria-hidden="true" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Adults with Disabilities Map</h2>
                    <p className="text-gray-600 mt-1">
                      This map displays the geographical distribution of adults with various disabilities.
                      Click on markers to view detailed information about each individual.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <button 
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 text-sm font-medium flex items-center"
                      aria-label="Add new person to the map"
                    >
                      <UserPlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                      Add New Person
                    </button>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  {/* Filter controls */}
                  <div className="mb-4 flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-full md:w-auto flex-grow md:flex-grow-0">
                      <label htmlFor="disability-filter" className="sr-only">Filter by disability type</label>
                      <select 
                        id="disability-filter"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        aria-label="Filter by disability type"
                      >
                        <option value="all">All Disability Types</option>
                        <option value="physical">Physical</option>
                        <option value="visual">Visual</option>
                        <option value="hearing">Hearing</option>
                      </select>
                    </div>
                    <div className="w-full md:w-auto flex-grow">
                      <label htmlFor="name-search" className="sr-only">Search by name</label>
                      <input 
                        id="name-search"
                        type="text" 
                        placeholder="Search by name..."
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        aria-label="Search by name"
                      />
                    </div>
                    <div className="w-full md:w-auto">
                      <button 
                        className="w-full md:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-300 text-sm font-medium"
                        aria-label="Apply filters"
                      >
                        Filter
                      </button>
                    </div>
                  </div>
                
                  {/* Map container */}
                  <div 
                    className="h-96 rounded-lg overflow-hidden border border-gray-200"
                    aria-label="Interactive map showing locations of adults with disabilities"
                  >
                    {isLoading ? (
                      <LoadingIndicator />
                    ) : (
                      <MapComponent persons={persons} />
                    )}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm p-3 bg-gray-50 rounded-lg" aria-label="Map legend">
                    <div className="font-medium text-gray-700">Map Legend:</div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 inline-block mr-2" aria-hidden="true"></span>
                      <span>Physical</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-2" aria-hidden="true"></span>
                      <span>Visual</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block mr-2" aria-hidden="true"></span>
                      <span>Hearing</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'children' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Children with Disabilities Map</h2>
                    <p className="text-gray-600 mt-1">
                      This map shows the distribution of children with disabilities. Each marker represents a child
                      with specific needs. Click on markers to view details.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <button 
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 text-sm font-medium flex items-center"
                      aria-label="Register a new child"
                    >
                      <UserPlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                      Register Child
                    </button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <div 
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-96"
                      aria-label="Interactive map showing locations of children with disabilities"
                    >
                      {isLoading ? (
                        <LoadingIndicator />
                      ) : (
                        <Map
                          markers={children}
                          selectedMarker={selectedChild}
                          onMarkerSelect={handleChildSelect}
                          onMapClick={handleMapClick}
                          defaultCenter={[14.5839, 121.0685]} // Manila coordinates
                        />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    {selectedChild ? (
                      <ChildProfileCard child={selectedChild} onClose={clearSelectedChild} />
                    ) : (
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                        <MapPinIcon className="h-12 w-12 text-gray-300 mb-4" aria-hidden="true" />
                        <h3 className="text-lg font-medium text-gray-700">No Child Selected</h3>
                        <p className="text-sm text-gray-500 mt-2 max-w-xs">
                          Click on a marker on the map to view detailed information about a child.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Statistics/Impact Section */}
      <section className="bg-gradient-to-b from-white to-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Making an Impact</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our disability mapping initiative is creating positive change across communities by providing valuable data for better resource allocation and policy decisions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StatisticCard 
              color="green"
              icon={MapPinIcon}
              value="500+"
              title="Persons Registered"
              description="Individuals with various disabilities mapped and registered for better support services."
            />
            
            <StatisticCard 
              color="purple"
              icon={PieChartIcon}
              value="25%"
              title="Resource Optimization"
              description="Improved resource allocation efficiency through data-driven decision making."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Disability Mapping Initiative</h3>
              <p className="text-gray-400 mb-6">
                Creating a more inclusive society through data-driven insights and community engagement.
              </p>
              <div className="flex space-x-4">
                {/* Social media icons */}
                <a href="#" className="text-gray-400 hover:text-white transition duration-300" aria-label="Facebook">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300" aria-label="Twitter">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300" aria-label="Instagram">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/home" className="text-gray-400 hover:text-white transition duration-300">Home</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition duration-300">About Us</Link></li>
                <li><Link href="/map" className="text-gray-400 hover:text-white transition duration-300">Interactive Map</Link></li>
                <li><Link href="/statistics" className="text-gray-400 hover:text-white transition duration-300">Statistics</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition duration-300">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/resources" className="text-gray-400 hover:text-white transition duration-300">Disability Support</Link></li>
                <li><Link href="/resources/laws" className="text-gray-400 hover:text-white transition duration-300">Laws & Regulations</Link></li>
                <li><Link href="/resources/education" className="text-gray-400 hover:text-white transition duration-300">Educational Materials</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition duration-300">FAQs</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <address className="not-italic text-gray-400">
                <p className="mb-2">guimbal</p>
                <p className="mb-2">Guimbal, Philippines</p>
                <p className="mb-4">info@guimbalpwd-map.org</p>
                <p>+63 9458491489</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Disability Mapping Initiative. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
