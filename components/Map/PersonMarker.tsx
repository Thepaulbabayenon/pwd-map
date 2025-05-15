// components/Map/PersonMarker.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { Marker, Tooltip, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import Image from 'next/image';
import { PersonMapData, PersonImage as PersonImageType } from '@/lib/types';
import EnhancedDirectionsControl from '@/components/Map/EnhancedDirectionsControl';

// Interface for finding nearest facility
interface Facility {
  type: string;
  name: string;
  lat: number;
  lng: number;
  distance: number;
}

// Disability type to color mapping
const DISABILITY_COLORS: Record<string, string> = {
  'PHYSICAL DISABILITY': '#3B82F6', // Blue
  'PSYCHOSOCIAL DISABILITY': '#EC4899', // Pink
  'ORTHOPEDIC DISABILITY': '#10B981', // Green
  'VISUAL DISABILITY': '#F59E0B', // Yellow
  'SPEECH AND LANGUAGE IMPAIRMENT': '#8B5CF6', // Purple
  'DEAF OR HARD OF HEARING': '#6366F1', // Indigo
  'VISUAL IMPAIRMENT': '#F43F5E', // Rose
  'LEARNING DISABILITY': '#6B7280', // Gray
  'INTELLECTUAL DISABILITY': '#F97316', // Orange
  'MENTAL DISABILITY': '#14B8A6', // Teal
  'CANCER (RA 11215)': '#A855F7', // Violet
  'RARE DISEASE': '#EF4444', // Red
  'PHYSICAL DISABILITY (B)': '#3B82F6', // Blue (same as Physical Disability)
  'Unknown': '#94A3B8', // Slate
};

// Sample facilities data
const FACILITIES = [
  { type: 'hospital', name: 'Guimbal District Hospital', lat: 10.6722, lng: 122.3103, distance: 0 },
  { type: 'hospital', name: 'Iloilo Provincial Hospital', lat: 10.7135, lng: 122.3645, distance: 0 },
  { type: 'hospital', name: 'West Visayas State University Medical Center', lat: 10.7001, lng: 122.5636, distance: 0 },
  { type: 'hospital', name: 'Miag-ao Rural Health Unit', lat: 10.6425, lng: 122.2307, distance: 0 },
  { type: 'school', name: 'Guimbal Central Elementary School', lat: 10.6717, lng: 122.3132, distance: 0 },
  { type: 'school', name: 'Guimbal National High School', lat: 10.6731, lng: 122.3148, distance: 0 },
  { type: 'school', name: 'SPED Integrated School - Iloilo', lat: 10.7155, lng: 122.5483, distance: 0 },
  { type: 'school', name: 'Western Visayas College of Science and Technology', lat: 10.6872, lng: 122.5679, distance: 0 },
];

// Custom icon creation function
function createMarkerIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 20px; 
        height: 20px; 
        border-radius: 50%; 
        background-color: ${color}; 
        border: 2px solid white; 
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Find nearest facility for a person
function findNearestFacility(
  lat: number, 
  lng: number, 
  facilityType: 'hospital' | 'school' | 'both' = 'both'
): Facility {
  const validFacilities = FACILITIES.filter(f => 
    facilityType === 'both' || f.type === facilityType
  ).map(facility => ({
    ...facility,
    distance: calculateDistance(lat, lng, facility.lat, facility.lng)
  }));
  
  // Sort by distance
  validFacilities.sort((a, b) => a.distance - b.distance);
  
  return validFacilities[0];
}

// PersonMarker component with enhanced direction capabilities
const PersonMarker = ({ person }: { person: PersonMapData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const position: LatLngExpression = [person.latitude, person.longitude];
  
  // Determine marker color based on disability type
  const markerColor = DISABILITY_COLORS[person.disabilityType] || DISABILITY_COLORS['Unknown'];
  
  const handleMarkerClick = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Find nearest facility if the person has video or images
  const nearestFacility = useMemo(() => {
    // Now we always find the nearest facility regardless of media status
    return findNearestFacility(person.latitude, person.longitude);
  }, [person.latitude, person.longitude]);
  
  // Lazy load images only when popup is open
  const mediaContent = useMemo(() => {
    if (!isOpen) return null;
    
    // Handle images from person.images array
    const imageContent = person.images && person.images.length > 0 ? (
      <div className="mt-3">
        <h4 className="font-medium mb-1">Proof Images:</h4>
        <div className="grid grid-cols-2 gap-2">
          {person.images.slice(0, 2).map((img: PersonImageType, index: number) => (
            <div key={index} className="relative w-full h-20 rounded overflow-hidden border border-gray-300">
              <Image
                src={img.imageUrl}
                alt={img.description || `Proof image ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    ) : null;
    
    // Handle media from person.media array
    const mediaItems = person.media && person.media.length > 0 ? (
      <div className="mt-3">
        <h4 className="font-medium mb-1">Media:</h4>
        <div className="grid grid-cols-2 gap-2">
          {person.media.slice(0, 2).map((media, index) => (
            <div key={index} className="relative w-full h-20 rounded overflow-hidden border border-gray-300">
              {media.mediaType === 'image' ? (
                <Image
                  src={media.mediaUrl}
                  alt={media.description || `Media ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <span className="text-xs text-gray-600">Video available</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : null;
    
    return (
      <>
        {imageContent}
        {mediaItems}
        {!imageContent && !mediaItems && (
          <p className="text-sm text-gray-500 mt-2">No proof images or media available.</p>
        )}
      </>
    );
  }, [isOpen, person.images, person.media]);

  return (
    <>
      <Marker 
        position={position} 
        icon={createMarkerIcon(markerColor)}
        eventHandlers={{ click: handleMarkerClick }}
      >
        <Tooltip>
          <strong>{`${person.firstName} ${person.lastName}`}</strong><br />
          {person.disabilityType}
        </Tooltip>
        <Popup 
          minWidth={250} 
          maxWidth={300}
          eventHandlers={{
            popupclose: () => setIsOpen(false)
          }}
        >
          <div className="p-2">
            <div 
              className="absolute top-2 right-2 w-4 h-4 rounded-full" 
              style={{ backgroundColor: markerColor }}
            ></div>
            <h3 className="text-lg font-semibold mb-2">
              {person.firstName} {person.lastName}
            </h3>
            <p><strong>Disability:</strong> {person.disabilityType}</p>
            {person.specificDisability && (
              <p><strong>Specific:</strong> {person.specificDisability}</p>
            )}
            {mediaContent}
            
            {/* Always show directions option with enhanced tracking now */}
            {nearestFacility && (
              <EnhancedDirectionsControl person={person} facility={nearestFacility} />
            )}
          </div>
        </Popup>
      </Marker>
    </>
  );
};

export default PersonMarker;
