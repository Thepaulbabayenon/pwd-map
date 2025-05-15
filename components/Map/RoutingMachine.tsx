// components/Map/RoutingMachine.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine'; // This imports the actual JS for L.Routing
import { useMap } from 'react-leaflet';

// Import the existing typings for leaflet-routing-machine
// This will allow us to only augment what we need
import 'leaflet-routing-machine';

// Extend Leaflet's L object with the routing module using interface augmentation
// Instead of namespace, we'll use interfaces and module augmentation
declare module 'leaflet' {
  interface Routing {
    control(options: Routing.RoutingControlOptions): Routing.Control;
    osrmv1(options: Routing.OSRMOptions): unknown;
  }

  interface RoutingStatic {
    Routing: Routing;
  }

  // Add these interfaces to the global L object
  interface RoutesFoundEvent extends L.LeafletEvent {
    routes: Routing.IRoute[];
  }

  interface RoutingErrorEvent extends L.LeafletEvent {
    error: RoutingError;
  }

  interface RoutingError {
    status: number | string;
    message: string;
  }

  // Update the L namespace with Routing
  interface Routing {
    Control: Routing.Control;
    RoutesFoundEvent: RoutesFoundEvent;
    RoutingErrorEvent: RoutingErrorEvent;
  }
}

interface RoutingMachineProps {
  start: LatLngExpression;
  end: LatLngExpression;
}

// Calculate distance between two points in km
function calculateDistance(start: LatLngExpression, end: LatLngExpression): number {
  const lat1 = Array.isArray(start) ? start[0] : start.lat;
  const lon1 = Array.isArray(start) ? start[1] : start.lng;
  const lat2 = Array.isArray(end) ? end[0] : end.lat;
  const lon2 = Array.isArray(end) ? end[1] : end.lng;

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Draw straight line between points (fallback when routing fails)
function drawStraightLine(map: L.Map, start: LatLngExpression, end: LatLngExpression): L.Polyline {
  const startLatLng = L.latLng(start as L.LatLngTuple); // Cast to ensure Leaflet gets valid types
  const endLatLng = L.latLng(end as L.LatLngTuple);

  const line = L.polyline([startLatLng, endLatLng], {
    color: 'blue',
    dashArray: '5, 10',
    weight: 3,
    opacity: 0.7
  }).addTo(map);

  const bounds = L.latLngBounds([startLatLng, endLatLng]);
  map.fitBounds(bounds, { padding: [50, 50] });

  return line;
}

// Define proper types for routing control options
interface RoutingControlOptions {
  waypoints: L.LatLng[];
  router: L.Routing.IRouter;
  routeWhileDragging: boolean;
  show: boolean;
  showAlternatives: boolean;
  addWaypoints: boolean;
  draggableWaypoints: boolean;
  fitSelectedRoutes: "smart" | boolean;
  lineOptions: {
    styles: { color: string; opacity: number; weight: number }[];
    extendToWaypoints: boolean;
    missingRouteTolerance: number;
  };
  createMarker: () => null;
}

const RoutingMachine: React.FC<RoutingMachineProps> = ({ start, end }) => {
  const map = useMap();
  const [error, setError] = useState<string | null>(null);
  const straightLineRef = useRef<L.Polyline | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeAttempted, setRouteAttempted] = useState(false);

  const cleanupRouting = useCallback(() => {
    if (map && routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    if (straightLineRef.current) {
      straightLineRef.current.remove();
      straightLineRef.current = null;
    }
  }, [map]); // map dependency for cleanup

  useEffect(() => {
    if (!map || !start || !end) return;

    cleanupRouting();
    setError(null);
    setRouteDistance(null);
    setRouteAttempted(false);

    if (!L.Routing || !L.Routing.control) {
      console.error("L.Routing or L.Routing.control is not available. Ensure leaflet-routing-machine is correctly loaded.");
      setError("Routing library not loaded or initialized properly.");
      return;
    }

    const directDistance = calculateDistance(start, end);

    if (directDistance > 500) { // Example threshold: 500km
      setError("Distance too large for demo routing (>500km). Showing direct line.");
      straightLineRef.current = drawStraightLine(map, start, end);
      setRouteDistance(directDistance); // Show direct distance here
      setRouteAttempted(true); // Mark as attempted to show info
      return; // Skip actual routing
    }

    try {
      // Using our custom types to avoid any
      const router = L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1', // OSRM Demo Server (NOT FOR PRODUCTION)
        profile: 'driving',
        timeout: 10000, // 10 seconds
      });

      const startLatLng = L.latLng(start as L.LatLngTuple);
      const endLatLng = L.latLng(end as L.LatLngTuple);

      const controlOptions: RoutingControlOptions = {
        waypoints: [startLatLng, endLatLng],
        router,
        routeWhileDragging: false,
        show: false, // Set to true if you want the default itinerary panel
        showAlternatives: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: 'smart',
        lineOptions: {
          styles: [{ color: 'green', opacity: 0.9, weight: 6 }],
          // These properties are required to be defined without optionality
          // to match the @types/leaflet-routing-machine declarations
          extendToWaypoints: true,
          missingRouteTolerance: 1
        },
        createMarker: function() { return null; }, // We use our own markers
      };

      const newRoutingControl = L.Routing.control(controlOptions).addTo(map);
      routingControlRef.current = newRoutingControl;

      newRoutingControl.on('routesfound', function(e: L.RoutesFoundEvent) {
        setRouteAttempted(true);
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const route = routes[0];
          setRouteDistance(route.summary && typeof route.summary.totalDistance === 'number' ? route.summary.totalDistance / 1000 : null); // Convert meters to km
          setError(null); // Clear any previous error
          if (straightLineRef.current) { // If a fallback line was drawn, remove it
            straightLineRef.current.remove();
            straightLineRef.current = null;
          }
        } else {
          setError("No routes found.");
          if (!straightLineRef.current) { // Fallback if no routes but also no prior error/line
            straightLineRef.current = drawStraightLine(map, start, end);
            setRouteDistance(directDistance);
          }
        }
      });

      newRoutingControl.on('routingerror', function(e: L.RoutingErrorEvent) {
        console.error('Routing error from LRM:', e.error);
        setRouteAttempted(true);
        const errorMessage = e.error?.message || 'Unknown routing error';
        setError(`Route calculation failed: ${errorMessage}`);

        // Fallback to straight line if routing fails and not already drawn
        if (!straightLineRef.current) {
          console.log("Falling back to straight line due to routing error...");
          straightLineRef.current = drawStraightLine(map, start, end);
          setRouteDistance(directDistance); // Show direct distance
        }
      });

    } catch (err) { // Catch errors during setup of L.Routing.control
      console.error("Error setting up leaflet-routing-machine:", err);
      setRouteAttempted(true); // Mark as attempted
      setError("Failed to initialize routing component.");
      // Fallback to straight line if setup fails
      if (!straightLineRef.current) {
        straightLineRef.current = drawStraightLine(map, start, end);
        setRouteDistance(directDistance);
      }
    }

    return cleanupRouting; // Cleanup on unmount or when deps change
  }, [map, start, end, cleanupRouting]); // Added cleanupRouting to dependencies

  // Render UI for distance and errors
  return (
    // This div will be positioned by its parent (e.g., inside the map container or a specific overlay)
    <div className="absolute bottom-20 left-4 z-[1000] p-2 bg-white/80 backdrop-blur-sm rounded shadow-md text-xs max-w-[200px]">
      {error && (
        <div className="routing-error text-red-700 mb-1">
          <strong>Error:</strong> {error}
        </div>
      )}
      {routeAttempted && routeDistance !== null && (
        <div className="routing-distance text-gray-800">
          <strong>Distance:</strong> {routeDistance.toFixed(1)} km
          {straightLineRef.current ? " (direct)" : " (via road)"}
        </div>
      )}
      {!routeAttempted && !error && (
         <div className="text-gray-600">Calculating route...</div>
      )}
    </div>
  );
};

export default RoutingMachine;