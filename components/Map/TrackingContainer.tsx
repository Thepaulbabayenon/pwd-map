'use client';

import { useState, useEffect } from 'react';
import TrackingPage, { PersonMapData, FacilityData } from './TrackingPage';
import { useSearchParams } from 'next/navigation';

// Define types based on the exported objects
type PersonMapDataType = typeof PersonMapData;
type FacilityDataType = typeof FacilityData;

// Default data to use when person or facility is null
const defaultPersonData: PersonMapDataType = {
  firstName: 'Loading',
  lastName: '...',
  latitude: 0,
  longitude: 0,
  disabilityType: 'Unknown',
};

const defaultFacilityData: FacilityDataType = {
  name: 'Loading...',
  type: 'Unknown',
  lat: 0,
  lng: 0,
};

const TrackingContainer = () => {
  const searchParams = useSearchParams();
  const [person, setPerson] = useState<PersonMapDataType | null>(null);
  const [facility, setFacility] = useState<FacilityDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const personId = searchParams.get('personId');
    const facilityId = searchParams.get('facilityId');

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch person data
        if (personId) {
          const personData = await fetchPersonData(personId);
          setPerson(personData);
        } else {
          throw new Error('Person ID is required');
        }
        
        // Fetch facility data
        if (facilityId) {
          const facilityData = await fetchFacilityData(facilityId);
          setFacility(facilityData);
        } else {
          throw new Error('Facility ID is required');
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchParams]);

  // Mock function to fetch person data - replace with actual API call
  const fetchPersonData = async (personId: string): Promise<PersonMapDataType> => {
    // Simulate API call
    console.log(`Fetching data for person ID: ${personId}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Replace with actual API call that would use personId
        resolve({
          firstName: 'John',
          lastName: 'Doe',
          latitude: 14.599512,
          longitude: 120.984222,
          disabilityType: 'Visual',
        });
      }, 1000);
    });
  };

  // Mock function to fetch facility data - replace with actual API call
  const fetchFacilityData = async (facilityId: string): Promise<FacilityDataType> => {
    // Simulate API call
    console.log(`Fetching data for facility ID: ${facilityId}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Replace with actual API call that would use facilityId
        resolve({
          name: 'City Hospital',
          type: 'medical',
          lat: 14.6091,
          lng: 121.0223,
        });
      }, 1000);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Use the actual data if available, otherwise use default data
  return (
    <TrackingPage
      person={person || defaultPersonData}
      facility={facility || defaultFacilityData}
    />
  );
};

export default TrackingContainer;