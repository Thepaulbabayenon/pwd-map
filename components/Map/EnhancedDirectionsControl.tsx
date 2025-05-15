// components/Map/EnhancedDirectionsControl.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import L, { LatLngExpression } from 'leaflet';
import { useMap } from 'react-leaflet';
import RoutingMachine from '@/components/Map/RoutingMachine';
import { PersonMapData } from '@/lib/types';

interface EnhancedDirectionsControlProps {
  person: PersonMapData;
  facility: { 
    type: string; 
    name: string; 
    lat: number; 
    lng: number; 
  };
}

const EnhancedDirectionsControl: React.FC<EnhancedDirectionsControlProps> = ({ person, facility }) => {
  const map = useMap();
  const [showDirections, setShowDirections] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<LatLngExpression | null>(null);
  const [isNearPerson, setIsNearPerson] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Watch position ID for cleanup
  const watchIdRef = useRef<number | null>(null);
  
  // User marker reference
  const userMarkerRef = useRef<L.Marker | null>(null);
  
  // Calculate distance between two points in meters
  const calculateDistance = (pos1: LatLngExpression, pos2: LatLngExpression): number => {
    const lat1 = Array.isArray(pos1) ? pos1[0] : pos1.lat;
    const lng1 = Array.isArray(pos1) ? pos1[1] : pos1.lng;
    const lat2 = Array.isArray(pos2) ? pos2[0] : pos2.lat;
    const lng2 = Array.isArray(pos2) ? pos2[1] : pos2.lng;
    
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
  };
  
  // Start tracking user's location
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    
    setIsTracking(true);
    setTrackingStatus('Locating you...');
    
    // Check permission first
    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'denied') {
        setError('Location permission denied. Please enable location services.');
        setIsTracking(false);
        return;
      }
      
      // Clear any existing watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      
      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        // Success callback
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos: LatLngExpression = [latitude, longitude];
          setCurrentPosition(newPos);
          
          // Create or update user marker
          if (!userMarkerRef.current) {
            const userIcon = L.divIcon({
              className: 'current-location-marker',
              html: `
                <div style="
                  width: 20px; 
                  height: 20px; 
                  border-radius: 50%; 
                  background-color: #3b82f6; 
                  border: 3px solid white; 
                  box-shadow: 0 0 0 2px #3b82f6, 0 0 10px rgba(0,0,0,0.5);
                  opacity: 0.9;
                "></div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });
            
            userMarkerRef.current = L.marker(newPos, { icon: userIcon }).addTo(map);
            
            // Add accuracy circle
            if (position.coords.accuracy) {
              L.circle(newPos, {
                radius: position.coords.accuracy,
                fillColor: '#3b82f680',
                fillOpacity: 0.2,
                stroke: false
              }).addTo(map);
            }
            
            // Pan map to show both user and destination
            const bounds = L.latLngBounds([
              L.latLng(newPos),
              L.latLng([facility.lat, facility.lng])
            ]);
            map.fitBounds(bounds, { padding: [50, 50] });
          } else {
            userMarkerRef.current.setLatLng(L.latLng(latitude, longitude));
          }
          
          // Check proximity to the person
          const distanceToPerson = calculateDistance(newPos, [person.latitude, person.longitude]);
          const isClose = distanceToPerson <= 50; // Within 50 meters
          setIsNearPerson(isClose);
          
          if (isClose && !isNearPerson) {
            setTrackingStatus('You are near the person\'s location! Getting directions to facility...');
          } else if (!isClose) {
            setTrackingStatus(`You are ${(distanceToPerson/1000).toFixed(2)}km away from the person's location`);
          }
          
          // Check if arrived at facility
          const distanceToFacility = calculateDistance(newPos, [facility.lat, facility.lng]);
          if (distanceToFacility <= 50) { // Within 50 meters of facility
            setHasArrived(true);
            setTrackingStatus(`You have arrived at ${facility.name}!`);
            
            // Create an arrival notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Arrival Notification', {
                body: `You have arrived at ${facility.name}`,
                icon: '/notification-icon.png' // Add a suitable icon path
              });
            }
            
            // Optionally stop tracking after arrival
            // stopTracking();
          }
        },
        // Error callback
        (err) => {
          setError(`Location error: ${err.message}`);
          setIsTracking(false);
        },
        // Options
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };
  
  // Stop tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    
    setIsTracking(false);
    setTrackingStatus('');
  };
  
  // Toggle directions display
  const toggleDirections = () => {
    setShowDirections(!showDirections);
    
    if (!showDirections && !isTracking) {
      // Ask about tracking when enabling directions
      const wantToTrack = window.confirm("Would you like to track your current location to get live directions?");
      if (wantToTrack) {
        startTracking();
      }
    }
  };
  
  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (userMarkerRef.current && map) {
        map.removeLayer(userMarkerRef.current);
      }
    };
  }, [map]);
  
  if (!facility) return null;
  
  return (
    <div className="directions-control space-y-2">
      {/* Directions toggle button */}
      <button 
        onClick={toggleDirections}
        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors mt-2 w-full"
      >
        {showDirections ? 'Hide Directions' : `Directions to ${facility.name}`}
      </button>
      
      {/* Tracking controls - only show when directions are active */}
      {showDirections && (
        <div className="space-y-2">
          {!isTracking ? (
            <button 
              onClick={startTracking}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors w-full"
            >
              Track My Location
            </button>
          ) : (
            <button 
              onClick={stopTracking}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors w-full"
            >
              Stop Tracking
            </button>
          )}
          
          {/* Status messages */}
          {trackingStatus && (
            <div className="text-xs bg-gray-100 p-2 rounded">
              {trackingStatus}
              {hasArrived && (
                <div className="mt-1 font-bold text-green-600">
                  ✓ Destination reached!
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div className="text-xs bg-red-100 text-red-700 p-2 rounded">
              {error}
            </div>
          )}
        </div>
      )}
      
      {/* Render the routing component if directions are shown */}
      {showDirections && (
        <RoutingMachine 
          start={isNearPerson && currentPosition ? currentPosition : [person.latitude, person.longitude]} 
          end={[facility.lat, facility.lng]} 
        />
      )}
    </div>
  );
};

export default EnhancedDirectionsControl;