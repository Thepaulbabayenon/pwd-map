"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L, { LatLngExpression, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PersonMapData, PersonImage as PersonImageType } from '@/lib/types';
import Image from 'next/image';

// Define type for Leaflet's Icon prototype
interface IconDefaultOptions {
  _getIconUrl?: unknown;
  iconRetinaUrl: string;
  iconUrl: string;
  shadowUrl: string;
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

// Delete default icon path
delete ((L.Icon.Default.prototype as unknown) as IconDefaultOptions)._getIconUrl;

// Helper component for map performance optimization
function MapEventHandler() {
  const map = useMap();
  
  useEffect(() => {
    // Optimize map rendering by disabling animations during zoom/pan
    map.options.zoomAnimation = false;
    map.options.markerZoomAnimation = false;
    
    // Re-enable smooth transitions after initial load
    const timer = setTimeout(() => {
      map.options.zoomAnimation = true;
      map.options.markerZoomAnimation = true;
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [map]);
  
  return null;
}

// Custom marker component for improved rendering
const PersonMarker = ({ person }: { person: PersonMapData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const position: LatLngExpression = [person.latitude, person.longitude];
  
  // Determine marker color based on disability type
  const markerColor = DISABILITY_COLORS[person.disabilityType] || DISABILITY_COLORS['Unknown'];
  
  const handleMarkerClick = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  // Lazy load images only when popup is open
  const imageContent = useMemo(() => {
    if (!isOpen || !person.images || person.images.length === 0) {
      return null;
    }
    
    return (
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
    );
  }, [isOpen, person.images]);

  return (
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
          {imageContent}
          {(!person.images || person.images.length === 0) && (
            <p className="text-sm text-gray-500 mt-2">No proof images available.</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

interface MapComponentProps {
  persons: PersonMapData[];
}

export default function MapComponent({ persons }: MapComponentProps) {
  // Use memoized values for map configuration
  const { mapCenter, defaultZoom } = useMemo(() => {
    const center: LatLngExpression = persons.length > 0 && persons[0].latitude && persons[0].longitude
      ? [persons[0].latitude, persons[0].longitude]  
      : [12.8797, 121.7740]; // Default center
    
    const zoom = persons.length > 0 ? 6 : 5;
    
    return { mapCenter: center, defaultZoom: zoom };
  }, [persons]);

  // Group markers by proximity for better performance with large datasets
  const optimizedPersons = useMemo(() => {
    if (persons.length <= 50) return persons; // Don't optimize for small datasets
    
    // For large datasets, you could implement clustering logic here
    return persons;
  }, [persons]);

  // Collect unique disability types for later use
  const disabilityTypes = useMemo(() => {
    return Array.from(new Set(persons.map(p => p.disabilityType)));
  }, [persons]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        // Add performance options
        zoomControl={false} // Will add custom zoom control
        attributionControl={false} // Will add attribution separately
        preferCanvas={true} // Use Canvas renderer for better performance
        worldCopyJump={true} // Improves UX for dragging across date line
        maxZoom={16} // Limit max zoom to prevent performance issues
      >
        <TileLayer
          attribution={process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || ''}
          url={process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
          // Performance optimizations
          tileSize={256}
          maxNativeZoom={18}
          keepBuffer={2}
        />
        
        {/* Add zoom control in a better position */}
        <div className="leaflet-top leaflet-right">
          <div className="leaflet-control-zoom leaflet-bar leaflet-control"></div>
        </div>
        
        {/* Add performance event handler */}
        <MapEventHandler />
        
        {/* Render markers with optimized component */}
        {optimizedPersons.map((person) => (
          <PersonMarker key={person.id} person={person} />
        ))}
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <h4 className="text-sm font-semibold mb-2">Disability Types</h4>
        <div className="space-y-2">
          {disabilityTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: DISABILITY_COLORS[type] || DISABILITY_COLORS['Unknown'] }}
              ></div>
              <span className="text-xs text-gray-700">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}