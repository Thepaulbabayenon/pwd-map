'use client';

import { useState, useEffect } from 'react';
import { Child, PersonMapData } from '@/lib/types';
import MapComponent from '@/components/Map/MapComponent';
import Map from '@/components/Map';
import Link from 'next/link';
import { MapPinIcon, UsersIcon, PieChartIcon, BarChart3Icon, ChevronRightIcon, ArrowRightIcon, HeartIcon, HandIcon, UserPlusIcon } from 'lucide-react';

export default function HomePage() {
  // State for sample data - in production, this would come from an API
  const [persons, setPersons] = useState<PersonMapData[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sample data loading - simulating API fetch
  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
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

      // Sample data for children with disabilities - added address property
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
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle map click for adding new markers (would connect to form in production)
  const handleMapClick = (lat: number, lng: number) => {
    console.log(`New marker position: ${lat}, ${lng}`);
    // In a real app, this would open a form to add a new person at this location
  };

  // Handle child marker selection
  const handleChildSelect = (childId: number) => {
    const child = children.find(c => c.id === childId) || null;
    setSelectedChild(child);
  };

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-sm text-gray-500">Loading data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: "url('/api/placeholder/1600/800')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(1px)'
          }}></div>
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
              >
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span>View Interactive Map</span>
                <ChevronRightIcon className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <Link
                href="/about"
                className="bg-transparent border-2 border-white text-white font-medium py-3 px-8 rounded-md hover:bg-white hover:bg-opacity-10 transition duration-300 flex items-center"
              >
                <span>Learn More</span>
                <ArrowRightIcon className="h-5 w-5 ml-2" />
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
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-6 font-medium text-base relative ${
                activeTab === 'summary'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
              {activeTab === 'summary' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`py-4 px-6 font-medium text-base relative ${
                activeTab === 'map'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Adults Map
              {activeTab === 'map' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('children')}
              className={`py-4 px-6 font-medium text-base relative ${
                activeTab === 'children'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Children Map
              {activeTab === 'children' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}
            </button>
          </div>

          {/* Content based on active tab */}
          <div className="p-6">
            {activeTab === 'summary' && (
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                      <HeartIcon className="h-6 w-6 mr-2 text-blue-600" />
                      Our Mission
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      To provide a clear, accessible, and data-driven visualization of disability demographics
                      to foster better resource allocation, policy-making, and community support.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                      <HandIcon className="h-6 w-6 mr-2 text-blue-600" />
                      Key Objectives
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <MapPinIcon className="h-4 w-4 text-blue-700" />
                        </div>
                        <p className="text-gray-700">Map the geographic distribution of persons with various disabilities</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <UsersIcon className="h-4 w-4 text-blue-700" />
                        </div>
                        <p className="text-gray-700">Identify areas with concentrated needs for targeted interventions</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <PieChartIcon className="h-4 w-4 text-blue-700" />
                        </div>
                        <p className="text-gray-700">Provide data-driven insights for policymakers and service providers</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <BarChart3Icon className="h-4 w-4 text-blue-700" />
                        </div>
                        <p className="text-gray-700">Support inclusive community planning and development</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                    <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
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
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Visual</span>
                              <span>30%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Hearing</span>
                              <span>25%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
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
                          <ChevronRightIcon className="h-4 w-4 ml-1" />
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
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 text-sm font-medium flex items-center">
                      <UserPlusIcon className="h-4 w-4 mr-2" />
                      Add New Person
                    </button>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  {/* Filter controls */}
                  <div className="mb-4 flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-full md:w-auto flex-grow md:flex-grow-0">
                      <select className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="all">All Disability Types</option>
                        <option value="physical">Physical</option>
                        <option value="visual">Visual</option>
                        <option value="hearing">Hearing</option>
                      </select>
                    </div>
                    <div className="w-full md:w-auto flex-grow">
                      <input 
                        type="text" 
                        placeholder="Search by name..."
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="w-full md:w-auto">
                      <button className="w-full md:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-300 text-sm font-medium">
                        Filter
                      </button>
                    </div>
                  </div>
                
                  {/* Map container */}
                  <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
                    {isLoading ? (
                      <LoadingIndicator />
                    ) : (
                      <MapComponent persons={persons} />
                    )}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-700">Map Legend:</div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 inline-block mr-2"></span>
                      <span>Physical</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-2"></span>
                      <span>Visual</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block mr-2"></span>
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
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 text-sm font-medium flex items-center">
                      <UserPlusIcon className="h-4 w-4 mr-2" />
                      Register Child
                    </button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-96">
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
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
                        <div className="flex items-center mb-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mr-4">
                            {selectedChild.imageUrl ? (
                              <img
                                src={selectedChild.imageUrl}
                                alt={selectedChild.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                                <UsersIcon className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800">{selectedChild.name}</h3>
                            <p className="text-sm text-gray-500">ID: #{selectedChild.id}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4 mt-6">
                          <div className="flex border-b border-gray-100 pb-2">
                            <span className="w-1/3 text-gray-500 text-sm">Age</span>
                            <span className="w-2/3 font-medium">{selectedChild.age} years</span>
                          </div>
                          <div className="flex border-b border-gray-100 pb-2">
                            <span className="w-1/3 text-gray-500 text-sm">Disability</span>
                            <span className="w-2/3 font-medium">{selectedChild.disability}</span>
                          </div>
                          <div className="flex border-b border-gray-100 pb-2">
                            <span className="w-1/3 text-gray-500 text-sm">Address</span>
                            <span className="w-2/3 font-medium">{selectedChild.address}</span>
                          </div>
                          <div className="flex pb-2">
                            <span className="w-1/3 text-gray-500 text-sm">Coordinates</span>
                            <span className="w-2/3 font-medium text-gray-700">
                              {selectedChild.lat.toFixed(4)}, {selectedChild.lng.toFixed(4)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex space-x-3">
                          <Link 
                            href={`/children/${selectedChild.id}`}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-center text-sm font-medium hover:bg-blue-700 transition duration-300"
                          >
                            View Full Profile
                          </Link>
                          <button className="bg-gray-100 text-gray-700 p-2 rounded-md hover:bg-gray-200 transition duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                        <MapPinIcon className="h-12 w-12 text-gray-300 mb-4" />
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
            <div className="bg-white rounded-xl shadow-sm p-8 text-center relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-blue-600 text-4xl font-bold mb-3">15+</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Communities Mapped</h3>
              <p className="text-gray-600 text-sm">Comprehensive mapping across diverse neighborhoods to ensure inclusive representation.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-8 text-center relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-600"></div>
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <UserPlusIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-green-600 text-4xl font-bold mb-3">300+</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Individuals Registered</h3>
              <p className="text-gray-600 text-sm">Growing database of persons with disabilities, providing valuable demographic insights.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-8 text-center relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-600"></div>
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <BarChart3Icon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-purple-600 text-4xl font-bold mb-3">85%</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Resources Optimized</h3>
              <p className="text-gray-600 text-sm">Better allocation of support services and resources based on data-driven insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0">
            <path fill="#ffffff" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,197.3C672,224,768,224,864,202.7C960,181,1056,139,1152,117.3C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Join Our Initiative</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Help us build a more inclusive community by contributing to our mapping project or supporting our mission.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="bg-white hover:bg-gray-100 text-blue-700 font-medium py-3 px-8 rounded-md shadow-md transition duration-300 flex items-center"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Register a Person
            </Link>
            <Link
              href="/volunteer"
              className="bg-blue-600 hover:bg-blue-800 text-white border border-blue-500 font-medium py-3 px-8 rounded-md shadow-md transition duration-300 flex items-center"
            >
              <HandIcon className="h-5 w-5 mr-2" />
              Volunteer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}