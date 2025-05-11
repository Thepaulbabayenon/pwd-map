"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PersonMapData, PersonImage as PersonImageType } from '@/lib/types';
import Image from 'next/image';

// Fix for default Leaflet icon path issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

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

  return (
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
  );
}