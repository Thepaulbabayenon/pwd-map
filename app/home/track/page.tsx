'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast, Toaster } from 'react-hot-toast';
import { ArrowLeft, Navigation, MapPin, CheckCircle } from 'lucide-react';

// Sample data - In a real application, these would come from a database or API
const personData = {
  firstName: 'John',
  lastName: 'Doe',
  latitude: 51.505,
  longitude: -0.09,
  disabilityType: 'Mobility Impairment',
};

const facilityData = {
  name: 'City Hospital',
  type: 'medical',
  lat: 51.51,
  lng: -0.1,
};

// Dynamic import for the Map component that uses Leaflet (client-side only)
const TrackingMap = dynamic(
  () => import('@/components/Map/TrackingMap'),
  { ssr: false }
);

// Main Page Component
export default function TrackingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proximityChecked, setProximityChecked] = useState(false);
  const [isNearPerson, setIsNearPerson] = useState(false);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [hasArrived, setHasArrived] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  
  // Calculate distance between two coordinates in meters
  const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                        Math.cos(φ1) * Math.cos(φ2) *
                        Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
  };
  
  // Check if user is near the person
  const checkProximity = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    toast.loading('Checking your proximity to the person...');
    
    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'denied') {
        toast.dismiss();
        toast.error('Location permission denied. Please enable location services.');
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.dismiss();
          const { latitude, longitude } = position.coords;
          setCurrentPosition([latitude, longitude]);
          
          // Calculate distance to the person
          const distanceToPerson = calculateDistance(
            latitude, 
            longitude, 
            personData.latitude, 
            personData.longitude
          );
          
          setDistance(distanceToPerson);
          
          // Check if within 100 meters
          const isClose = distanceToPerson <= 100;
          setIsNearPerson(isClose);
          
          if (isClose) {
            toast.success('You are near the person! Ready to navigate to facility.');
          } else {
            toast.error(`You are ${(distanceToPerson/1000).toFixed(2)}km away from the person's location.`);
          }
          
          setProximityChecked(true);
        },
        (err) => {
          toast.dismiss();
          toast.error(`Location error: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };
  
  // Start navigation
  const startNavigation = () => {
    toast.success('Navigation started! Following directions to the facility.');
    setNavigationStarted(true);
    
    // Start watching position for live updates
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition([latitude, longitude]);
          
          // Check if arrived at facility (within 50 meters)
          const distanceToFacility = calculateDistance(
            latitude, 
            longitude, 
            facilityData.lat, 
            facilityData.lng
          );
          
          if (distanceToFacility <= 50 && !hasArrived) {
            setHasArrived(true);
            
            // Show arrival toast
            toast.success(`You have arrived at ${facilityData.name}!`, {
              duration: 5000,
              icon: '🎉',
            });
            
            // Create an arrival notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Arrival Notification', {
                body: `You have arrived at ${facilityData.name}`,
              });
            }
          }
        },
        (err) => {
          console.error('Tracking error:', err);
          toast.error(`Location tracking error: ${err.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
      
      // Store watchId in session storage for cleanup
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('trackingWatchId', watchId.toString());
      }
    }
  };
  
  // Simulate loading data on mount
  useEffect(() => {
    // In a real app, you'd fetch data here
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      
      // Clear position watch if navigating away
      if (typeof window !== 'undefined') {
        const watchId = sessionStorage.getItem('trackingWatchId');
        if (watchId) {
          navigator.geolocation.clearWatch(parseInt(watchId));
          sessionStorage.removeItem('trackingWatchId');
        }
      }
    };
  }, []);
  
  // Show loading state
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
  
  // Show error state if needed
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-semibold text-center flex-1">
            {navigationStarted 
              ? `Navigating to ${facilityData.name}` 
              : `Tracking: ${personData.firstName} ${personData.lastName}`}
          </h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${hasArrived ? 'bg-green-500' : navigationStarted ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
            <h2 className="text-lg font-medium">
              {hasArrived 
                ? 'Arrived at Destination' 
                : navigationStarted 
                  ? 'Navigation in Progress' 
                  : 'Ready for Navigation Check'}
            </h2>
          </div>
          
          <div className="mt-4">
            {!proximityChecked ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  Before we can provide directions, we need to verify if you're near the person's location.
                </p>
                <button
                  onClick={checkProximity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
                >
                  <MapPin size={18} className="mr-2" />
                  Check Proximity
                </button>
              </div>
            ) : !isNearPerson ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                <p className="text-red-700">
                  You are {distance ? `${(distance/1000).toFixed(2)}km` : 'too far'} away from the person's location.
                </p>
                <p className="text-gray-600 mt-2">
                  Please move closer to the person's location before starting navigation.
                </p>
                <button
                  onClick={checkProximity}
                  className="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Check Again
                </button>
              </div>
            ) : !navigationStarted ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                <p className="text-green-700">
                  You are near the person's location! Ready to navigate to {facilityData.name}.
                </p>
                <button
                  onClick={startNavigation}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center mx-auto"
                >
                  <Navigation size={18} className="mr-2" />
                  Start Navigation
                </button>
              </div>
            ) : hasArrived ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle size={24} className="text-green-600 mr-2" />
                  <span className="text-green-700 font-medium">Destination Reached!</span>
                </div>
                <p className="text-gray-600">
                  You have successfully arrived at {facilityData.name}.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center">
                <p className="text-blue-700">
                  Following directions to {facilityData.name}...
                </p>
                <p className="text-gray-600 mt-2">
                  You will be notified when you arrive at your destination.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Map */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '500px' }}>
          <TrackingMap 
            person={personData}
            facility={facilityData}
            currentPosition={currentPosition ?? undefined}
            showDirections={navigationStarted}
          />
        </div>
        
        {/* Person Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-medium text-lg mb-2">Person Details</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{personData.firstName} {personData.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Disability Type</p>
                <p className="font-medium">{personData.disabilityType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Known Location</p>
                <p className="font-medium">{personData.latitude}, {personData.longitude}</p>
              </div>
            </div>
          </div>
          
          {/* Facility Information */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-medium text-lg mb-2">Destination Details</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{facilityData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium capitalize">{facilityData.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{facilityData.lat}, {facilityData.lng}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}