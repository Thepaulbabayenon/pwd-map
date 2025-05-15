'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Create the RoutingMachine component for routing
interface RoutingMachineProps {
  start: [number, number];
  end: [number, number];
}

const RoutingMachine = ({ start, end }: RoutingMachineProps) => {
  const map = useRef<L.Map | null>(null);
  const routingControl = useRef<L.Control | null>(null);

  useEffect(() => {
    if (!map.current) return;

    // Remove previous routing control if it exists
    if (routingControl.current) {
      map.current.removeControl(routingControl.current);
    }

    // Create new routing control
    routingControl.current = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [
          { color: '#6366F1', opacity: 0.8, weight: 6 },
          { color: '#818CF8', opacity: 0.9, weight: 4 }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 1
      },
      createMarker: function() { return null; } // Don't create default markers
    }).addTo(map.current);

    return () => {
      if (routingControl.current && map.current) {
        map.current.removeControl(routingControl.current);
      }
    };
  }, [map, start, end]);

  return null;
};

// Custom icon creation functions
const createPersonMarkerIcon = (color = '#3B82F6') => {
  return L.divIcon({
    className: 'custom-person-marker',
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
};

const createFacilityMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-facility-marker',
    html: `
      <div style="
        width: 24px; 
        height: 24px; 
        background-color: #EF4444; 
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
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
};

interface Person {
  latitude: number;
  longitude: number;
  firstName: string;
  lastName: string;
  disabilityType: string;
}

interface Facility {
  lat: number;
  lng: number;
  name: string;
  type: string;
}

interface TrackingMapProps {
  person: Person;
  facility: Facility;
  currentPosition?: [number, number];
  showDirections: boolean;
}

const TrackingMap = ({ person, facility, currentPosition, showDirections }: TrackingMapProps) => {
  const personPosition: [number, number] = [person.latitude, person.longitude];
  const facilityPosition: [number, number] = [facility.lat, facility.lng];
  const mapRef = useRef<L.Map | null>(null);

  // Fix Leaflet default icon issue in Next.js
  useEffect(() => {
    // This is needed because Next.js and Leaflet don't play well together with default icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Calculate map bounds to include all markers
  const getBounds = () => {
    const points = [personPosition, facilityPosition];
    if (currentPosition) points.push(currentPosition);
    return L.latLngBounds(points.map(point => L.latLng(point[0], point[1])));
  };

  // Fit bounds when map is ready or dependencies change
  useEffect(() => {
    if (mapRef.current) {
      const bounds = getBounds();
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [personPosition, facilityPosition, currentPosition]);

  // Determine the starting point for directions
  const directionsStart = currentPosition || personPosition;

  return (
    <MapContainer
      style={{ height: '100%', width: '100%' }}
      center={personPosition}
      zoom={13}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Person Marker */}
      <Marker 
        position={personPosition} 
        icon={createPersonMarkerIcon()}
      >
        <Popup>
          <div className="p-1">
            <strong>{person.firstName} {person.lastName}</strong>
            <br />
            <span className="text-sm">{person.disabilityType}</span>
          </div>
        </Popup>
      </Marker>
      
      {/* Facility Marker */}
      <Marker 
        position={facilityPosition} 
        icon={createFacilityMarkerIcon()}
      >
        <Popup>
          <div className="p-1">
            <strong>{facility.name}</strong>
            <br />
            <span className="text-sm capitalize">{facility.type}</span>
          </div>
        </Popup>
      </Marker>
      
      {/* Current User Location Marker */}
      {currentPosition && (
        <Marker 
          position={currentPosition} 
          icon={createUserLocationIcon()}
        >
          <Popup>
            <div className="p-1">
              <strong>Your Current Location</strong>
            </div>
          </Popup>
        </Marker>
      )}
      
      {/* Routing/Directions */}
      {showDirections && (
        <RoutingMachine 
          start={directionsStart} 
          end={facilityPosition} 
        />
      )}
    </MapContainer>
  );
};

export default TrackingMap;