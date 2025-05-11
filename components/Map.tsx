// File: src/components/Map.tsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Child } from '@/lib/types';
import Image from 'next/image';

// Component to update map view when selected child changes
function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  const map = useMap();
  
  useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    
    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onMapClick]);
  
  return null;
}

interface MapProps {
  markers: Child[];
  selectedMarker: Child | null;
  onMarkerSelect: (childId: number) => void;
  onMapClick: (lat: number, lng: number) => void;
  defaultCenter: number[];
}

// Define type for Leaflet's Icon prototype
interface IconDefaultOptions {
  _getIconUrl?: unknown;
  iconRetinaUrl: string;
  iconUrl: string;
  shadowUrl: string;
}

const Map: React.FC<MapProps> = ({ 
  markers, 
  selectedMarker, 
  onMarkerSelect, 
  onMapClick,
  defaultCenter
}) => {
  // Fix Leaflet icon issues for client-side rendering
  useEffect(() => {
    delete ((L.Icon.Default.prototype as unknown) as IconDefaultOptions)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);
  
  // Set initial view to default center or selected marker if available
  const initialPosition: [number, number] = selectedMarker 
    ? [selectedMarker.lat, selectedMarker.lng] 
    : [defaultCenter[0], defaultCenter[1]];
  
  // Define different icons for different disability types
  const getIcon = (disability: string) => {
    const iconUrl = disability.toLowerCase().includes('visual') 
      ? '/visual-marker.png'  // Create your custom marker icons
      : disability.toLowerCase().includes('hearing')
        ? '/hearing-marker.png'
        : '/default-marker.png';
        
    return new L.Icon({
      iconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };
  
  return (
    <div className="w-full h-96 rounded-lg shadow-lg overflow-hidden">
      <MapContainer 
        center={initialPosition} 
        zoom={14} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render all markers */}
        {markers.map((child) => (
          <Marker 
            key={child.id}
            position={[child.lat, child.lng]}
            icon={getIcon(child.disability)}
            eventHandlers={{
              click: () => onMarkerSelect(child.id),
              mouseover: (e) => {
                e.target.openPopup();
              }
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{child.name}</p>
                <p>Age: {child.age}</p>
                <p>Disability: {child.disability}</p>
                {child.imageUrl && (
                  <div className="relative mt-2 w-24 h-24">
                    <Image 
                      src={child.imageUrl} 
                      alt={child.name}
                      fill
                      className="object-cover rounded-md"
                      sizes="96px"
                    />
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Update map view when selected marker changes */}
        <MapViewUpdater 
          center={selectedMarker ? [selectedMarker.lat, selectedMarker.lng] : initialPosition}
          zoom={selectedMarker ? 16 : 14} 
        />
        
        {/* Handle map clicks */}
        <MapClickHandler onMapClick={onMapClick} />
      </MapContainer>
    </div>
  );
};

export default Map;