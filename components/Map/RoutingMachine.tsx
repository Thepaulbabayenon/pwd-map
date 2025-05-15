// components/Map/RoutingMachine.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine'; // This imports the actual JS for L.Routing
import { useMap } from 'react-leaflet';

// Extend Leaflet's L object with the routing namespace
// This helps TypeScript understand L.Routing and its methods/classes if not fully covered by @types
declare module 'leaflet' {
  namespace Routing {
    // Control class (from leaflet-routing-machine types)
    // interface ControlStatic extends ClassStatic {
    //   new (options?: ControlOptions): Control;
    // }
    // var Control: ControlStatic; // Not needed if types are correctly inferred

    // Explicitly type the control function if necessary, though @types should cover it
    function control(options: ControlOptions): Control;
    function osrmv1(options?: OSRMV1Options): IRouter;
    // function graphHopper(apiKey: string, options?: GraphHopperOptions): IRouter; // Example for GraphHopper
    // function LRMErrorHandler(options?: any): any; // If you were to use errorControl directly

    // Types for events and options (these might already be in @types/leaflet-routing-machine)
    interface ControlOptions {
      waypoints: LatLng[];
      router?: IRouter;
      routeWhileDragging?: boolean;
      show?: boolean;
      showAlternatives?: boolean;
      addWaypoints?: boolean;
      draggableWaypoints?: boolean;
      fitSelectedRoutes?: boolean | 'smart';
      lineOptions?: LineOptions;
      createMarker?: (waypointIndex: number, waypoint: Waypoint, numberOfWaypoints: number) => Marker | null | false;
      // ... other options
    }

    interface Control extends L.Control {
      on(type: string, fn: (event: any) => void, context?: any): this;
      // Add other methods you use from L.Routing.Control
      getPlan(): IPlan;
      getRouter(): IRouter;
      // ...
    }

    interface IRouter { /* ... */ }
    interface IPlan extends L.Evented { /* ... */ } // Base class for Plan
    interface Waypoint { /* ... */ }

    interface OSRMV1Options {
      serviceUrl?: string;
      profile?: string;
      timeout?: number;
      // ... other OSRM options
    }

    interface LineOptions {
      styles?: PathOptions[];
      // ... other line options
    }

    // Event types
    interface RoutingEvent extends L.LeafletEvent {
      routes: Route[];
    }
    interface RoutesFoundEvent extends RoutingEvent {} // Alias for clarity

    interface RoutingErrorEvent extends L.LeafletEvent {
      error: ErrorMessage; // Or a more specific error type from the library
    }
    interface ErrorMessage {
        status: number | string;
        message: string;
    }

    interface Route {
      summary: RouteSummary;
      coordinates: LatLng[];
      // ... other route properties
    }
    interface RouteSummary {
      totalDistance: number; // in meters
      totalTime: number; // in seconds
      // ... other summary properties
    }
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

const RoutingMachine: React.FC<RoutingMachineProps> = ({ start, end }) => {
  const map = useMap();
  const [error, setError] = useState<string | null>(null);
  const straightLineRef = useRef<L.Polyline | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null); // Typed the ref
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

    if (!L.Routing || !L.Routing.control) { // Check if L.Routing and its control method are available
      console.error("L.Routing or L.Routing.control is not available. Ensure leaflet-routing-machine is correctly loaded.");
      setError("Routing library not loaded or initialized properly.");
      return;
    }

    const directDistance = calculateDistance(start, end);
    // Display direct distance immediately for context, might be overwritten by route distance
    // setRouteDistance(directDistance); // Or set it only if routing fails/skipped


    if (directDistance > 500) { // Example threshold: 500km
      setError("Distance too large for demo routing (>500km). Showing direct line.");
      straightLineRef.current = drawStraightLine(map, start, end);
      setRouteDistance(directDistance); // Show direct distance here
      setRouteAttempted(true); // Mark as attempted to show info
      return; // Skip actual routing
    }

    try {
      const router = L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1', // OSRM Demo Server (NOT FOR PRODUCTION)
        profile: 'driving',
        timeout: 10000, // 10 seconds
      });

      const startLatLng = L.latLng(start as L.LatLngTuple);
      const endLatLng = L.latLng(end as L.LatLngTuple);

      const controlOptions: L.Routing.ControlOptions = {
        waypoints: [startLatLng, endLatLng],
        router: router,
        routeWhileDragging: false,
        show: false, // Set to true if you want the default itinerary panel
        showAlternatives: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: 'smart',
        lineOptions: {
          styles: [{ color: 'green', opacity: 0.9, weight: 6 }],
          extendToWaypoints: true,
          missingRouteTolerance: 1
        },
        createMarker: function() { return null; }, // We use our own markers
      };

      const newRoutingControl = L.Routing.control(controlOptions).addTo(map);
      routingControlRef.current = newRoutingControl;

      newRoutingControl.on('routesfound', function(e: L.Routing.RoutesFoundEvent) {
        setRouteAttempted(true);
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const route = routes[0];
          setRouteDistance(route.summary.totalDistance / 1000); // Convert meters to km
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

      newRoutingControl.on('routingerror', function(e: L.Routing.RoutingErrorEvent) {
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
    // For simplicity, this example doesn't include specific positioning CSS here.
    // You might want to render this as an overlay on the map or below it.
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