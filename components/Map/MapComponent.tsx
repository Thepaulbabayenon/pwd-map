"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PersonMapData, PersonImage as PersonImageType } from '@/lib/types';
import Image from 'next/image';
import 'leaflet/dist/leaflet.css';
import RoutingMachine from './RoutingMachine';

// Define type for Leaflet's Icon prototype
interface IconDefaultOptions {
  _getIconUrl?: unknown;
  iconRetinaUrl: string;
  iconUrl: string;
  shadowUrl: string;
}

// Define facility type
interface Facility {
  type: 'hospital' | 'school' | 'municipality';
  name: string;
  lat: number;
  lng: number;
  distance: number;
}

// Center coordinates for Guimbal, Iloilo, Philippines
const GUIMBAL_CENTER: LatLngExpression = [10.6724, 122.3123];

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

// Facility colors
const FACILITY_COLORS = {
  'hospital': '#ef4444', // Red
  'school': '#3b82f6',   // Blue
  'municipality': '#10b981' // Green
};

// Updated facilities data for Guimbal, Iloilo area
const FACILITIES: Facility[] = [
  // Hospitals
  { type: 'hospital', name: 'Iloilo Provincial Hospital', lat: 10.926838, lng: 122.630375, distance: 0 },
  { type: 'hospital', name: 'Medicus Medical Center', lat: 10.703128, lng: 122.552460, distance: 0 },
  { type: 'hospital', name: 'Medical City', lat: 10.699496, lng: 122.542783, distance: 0 },
  { type: 'hospital', name: 'St. Pauls Hospital Iloilo Inc.', lat: 10.701560, lng: 122.566712, distance: 0 },
  { type: 'hospital', name: 'Western Visayas Hospital', lat: 10.718601, lng: 122.541724, distance: 0 },
  { type: 'hospital', name: 'Miag-ao Rural Health Unit', lat: 10.6425, lng: 122.2307, distance: 0 },
  { type: 'hospital', name: 'Guimbal RHU', lat: 10.661206, lng: 122.321739, distance: 0 },
  { type: 'hospital', name: 'Rep. Pedro Trono Memorial District Hospital', lat: 10.662150, lng: 122.323152, distance: 0 },
  { type: 'hospital', name: 'UPV Infimary', lat: 10.646094, lng: 122.230378, distance: 0 },
  
  // Schools
  { type: 'school', name: 'Guimbal National High School', lat: 10.665848585273197, lng: 122.32456160736905, distance: 0 },
  { type: 'school', name: 'SPED Integrated School - Iloilo', lat: 10.7155, lng: 122.5483, distance: 0 },
  { type: 'school', name: 'St. Nicholas of Tolentino Kinder School', lat: 10.660711972648416, lng: 122.32283235589303, distance: 0 },
  { type: 'school', name: 'Guimbal Central Elementary School', lat: 10.663860453620243, lng: 122.32486586448776, distance: 0 },
  { type: 'school', name: 'Cabasi-Sta. Rosa Elementary School', lat: 10.660588175845408, lng: 122.30864193289455, distance: 0 },
  { type: 'school', name: 'Particion Elementary School', lat: 10.679200829590059, lng: 122.30611324242876, distance: 0 },
  { type: 'school', name: 'Guimbal Providence Christian School', lat: 10.66056123591504, lng: 122.31631014687247, distance: 0 },
  { type: 'school', name: 'PG Garin Memorial Elementary School', lat: 10.687339645432425, lng: 122.29347039927015, distance: 0 },
  { type: 'school', name: 'Particion High School', lat: 10.679114939910567, lng: 122.30673956019648, distance: 0 },
  { type: 'school', name: 'Sipitan-Badiang Elementary School', lat: 10.681321590081991, lng: 122.31357828159695, distance: 0 },
  { type: 'school', name: 'Calampitao Elementary School', lat: 10.669184815860572, lng: 122.2778536175646, distance: 0 },
  { type: 'school', name: 'Valencia Elementary School', lat: 10.657649416215124, lng: 122.26734035929222, distance: 0 },
  { type: 'school', name: 'Kinaadman Elementary School', lat: 10.674938444995103, lng: 122.35215291730107, distance: 0 },
  { type: 'school', name: 'Buyu-an Elementary School', lat: 10.672928570625528, lng: 122.3577505765584, distance: 0 },
  { type: 'school', name: 'El Shekinah International Christian School', lat: 10.662312194163174, lng: 122.32582686660834, distance: 0 },
  { type: 'school', name: 'Guimbal National High School', lat: 10.665790479865034, lng: 122.32462312013544, distance: 0 },
  
  // Municipality buildings
  { type: 'municipality', name: 'PWD Center', lat: 10.660666957369044, lng: 122.32350224053643, distance: 0 },
  // You can add more municipality buildings as needed
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

// Create facility icon with SVG - Fixed and improved icons
function createFacilityIcon(type: 'hospital' | 'school' | 'municipality'): L.DivIcon {
  const color = FACILITY_COLORS[type];
  let svgIcon;
  
  if (type === 'hospital') {
    // Hospital icon with cross
    svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
        <circle cx="12" cy="12" r="11" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M7 12h10M12 7v10" stroke="white" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `;
  } else if (type === 'school') {
    // School icon (graduation cap)
    svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
        <circle cx="12" cy="12" r="11" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M6 14L12 8l6 6M9 16v-3M15 16v-3M12 8v8" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  } else {
    // Municipality icon (building)
    svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
        <circle cx="12" cy="12" r="11" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M7 10h10v7H7v-7zM9 17v-4M12 17v-4M15 17v-4M8 10V7l4-2 4 2v3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }
  
  return L.divIcon({
    className: 'facility-marker',
    html: svgIcon,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

// Delete default icon path
delete ((L.Icon.Default.prototype as unknown) as IconDefaultOptions)._getIconUrl;

// Helper component for map performance optimization
function MapEventHandler() {
  const map = useMap();
  
  useEffect(() => {
    // Set the view to Guimbal, Iloilo with appropriate zoom
    map.setView(GUIMBAL_CENTER as L.LatLngExpression, 12);
    
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

// Function to calculate distance between two points
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

// Find nearest facility for a person for a specific type
function findNearestFacility(
  lat: number, 
  lng: number, 
  facilityType: 'hospital' | 'school' | 'municipality'
): Facility | null {
  const validFacilities = FACILITIES.filter(f => 
    f.type === facilityType
  ).map(facility => ({
    ...facility,
    distance: calculateDistance(lat, lng, facility.lat, facility.lng)
  }));
  
  // Sort by distance
  validFacilities.sort((a, b) => a.distance - b.distance);
  
  return validFacilities.length > 0 ? validFacilities[0] : null;
}

// DirectionsControl component - Updated to show routes to multiple facilities
interface DirectionsControlProps {
  person: PersonMapData;
  hasVideo: boolean;
}

const DirectionsControl = ({ person, hasVideo }: DirectionsControlProps) => {
  const [activeDirections, setActiveDirections] = useState<string | null>(null);
  
  // Find nearest facilities
  const nearestHospital = useMemo(() => 
    findNearestFacility(person.latitude, person.longitude, 'hospital'),
  [person.latitude, person.longitude]);
  
  const nearestSchool = useMemo(() => 
    findNearestFacility(person.latitude, person.longitude, 'school'),
  [person.latitude, person.longitude]);
  
  const nearestMunicipality = useMemo(() => 
    findNearestFacility(person.latitude, person.longitude, 'municipality'),
  [person.latitude, person.longitude]);
  
  if (!hasVideo) return null;
  
  const handleDirectionClick = (facilityType: string) => {
    // Toggle off if already active
    if (activeDirections === facilityType) {
      setActiveDirections(null);
    } else {
      setActiveDirections(facilityType);
    }
  };
  
  return (
    <div className="directions-control mt-3">
      <h4 className="text-sm font-medium mb-2">Get directions to nearest:</h4>
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => handleDirectionClick('hospital')}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            activeDirections === 'hospital' 
              ? 'bg-red-600 text-white' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          Hospital
        </button>
        
        <button 
          onClick={() => handleDirectionClick('school')}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            activeDirections === 'school' 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          }`}
        >
          School
        </button>
        
        <button 
          onClick={() => handleDirectionClick('municipality')}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            activeDirections === 'municipality' 
              ? 'bg-green-600 text-white' 
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          Municipality
        </button>
      </div>
      
      {/* Render appropriate routing based on selection */}
      {activeDirections === 'hospital' && nearestHospital && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-1">
            Routing to {nearestHospital.name} ({(nearestHospital.distance || 0).toFixed(2)} km)
          </p>
          <RoutingMachine 
            start={[person.latitude, person.longitude]} 
            end={[nearestHospital.lat, nearestHospital.lng]} 
            color="#ef4444"
          />
        </div>
      )}
      
      {activeDirections === 'school' && nearestSchool && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-1">
            Routing to {nearestSchool.name} ({(nearestSchool.distance || 0).toFixed(2)} km)
          </p>
          <RoutingMachine 
            start={[person.latitude, person.longitude]} 
            end={[nearestSchool.lat, nearestSchool.lng]}
            color="#3b82f6" 
          />
        </div>
      )}
      
      {activeDirections === 'municipality' && nearestMunicipality && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-1">
            Routing to {nearestMunicipality.name} ({(nearestMunicipality.distance || 0).toFixed(2)} km)
          </p>
          <RoutingMachine 
            start={[person.latitude, person.longitude]} 
            end={[nearestMunicipality.lat, nearestMunicipality.lng]}
            color="#10b981"
          />
        </div>
      )}
    </div>
  );
};

// Custom marker component for improved rendering
const PersonMarker = ({ person }: { person: PersonMapData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const position: LatLngExpression = [person.latitude, person.longitude];
  
  // Determine marker color based on disability type
  const markerColor = DISABILITY_COLORS[person.disabilityType] || DISABILITY_COLORS['Unknown'];
  
  const handleMarkerClick = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  // Check if person has video media
  const hasVideo = useMemo(() => {
    return person.media?.some(m => m.mediaType === 'video') || false;
  }, [person.media]);

  // Check if person has images (for displaying in popup)
  const hasImages = useMemo(() => {
    return (person.images?.length ?? 0) > 0 || person.media?.some(m => m.mediaType === 'image');
  }, [person.media, person.images]);
  
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
          <div className="tooltip-content">
            <strong>{`${person.firstName} ${person.lastName}`}</strong><br />
            <span>{person.disabilityType}</span>
            {hasVideo && <span className="block text-xs italic mt-1">(Has video - click for directions)</span>}
          </div>
        </Tooltip>
        <Popup 
          minWidth={280} 
          maxWidth={320}
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
            
            {/* Show directions options if the person has video */}
            {hasVideo && (
              <DirectionsControl person={person} hasVideo={hasVideo} />
            )}
          </div>
        </Popup>
      </Marker>
    </>
  );
};

// Facility marker component
const FacilityMarker = ({ facility }: { facility: Facility }) => {
  return (
    <Marker
      position={[facility.lat, facility.lng]}
      icon={createFacilityIcon(facility.type)}
    >
      <Tooltip>
        <strong>{facility.name}</strong><br />
        {facility.type.charAt(0).toUpperCase() + facility.type.slice(1)}
      </Tooltip>
      <Popup>
        <div className="p-2">
          <h3 className="text-lg font-semibold mb-2">
            {facility.name}
          </h3>
          <p><strong>Type:</strong> {facility.type.charAt(0).toUpperCase() + facility.type.slice(1)}</p>
          <p><strong>Location:</strong> {facility.lat.toFixed(4)}, {facility.lng.toFixed(4)}</p>
        </div>
      </Popup>
    </Marker>
  );
};

// Facility Legend component
const FacilityLegend = () => {
  return (
    <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
      <h5 className="text-xs font-semibold">Facilities</h5>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <span className="text-xs text-gray-700">Hospital</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        <span className="text-xs text-gray-700">School</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-xs text-gray-700">Municipality</span>
      </div>
    </div>
  );
};

interface MapComponentProps {
  persons: PersonMapData[];
  isRoutingReady: boolean;
}

export default function MapComponent({ persons }: MapComponentProps) {
  // Default to Guimbal center coordinates
  const mapCenter = GUIMBAL_CENTER;
  const defaultZoom = 12; // Closer zoom for Guimbal area

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
        
        {/* Render all facilities first - now they will always show */}
        {FACILITIES.map((facility, index) => (
          <FacilityMarker key={`facility-${index}`} facility={facility} />
        ))}
        
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
        
        {/* Add facility legend */}
        <FacilityLegend />
      </div>
      
      {/* Information overlay to explain routing feature */}
      <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-md border border-gray-200 max-w-xs">
        <h4 className="text-sm font-semibold mb-1">Guimbal Facilities</h4>
        <p className="text-xs text-gray-600">
          Click on person markers with video content (indicated in tooltip) to see routing options to the nearest hospital, school, or municipality building.
        </p>
      </div>
    </div>
  );
}