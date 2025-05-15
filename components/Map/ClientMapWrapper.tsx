"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PersonMapData } from '@/lib/types';

// Dynamic import with SSR disabled (allowed in client components)
const MapWithNoSSR = dynamic(() => import('@/components/Map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-700">Loading map...</p>
      </div>
    </div>
  ),
});

interface ClientMapWrapperProps {
  persons: PersonMapData[];
}

export default function ClientMapWrapper({ persons }: ClientMapWrapperProps) {
  // State to track loading of routing library
  const [isRoutingReady, setIsRoutingReady] = useState(false);
  
  // If persons data is large, useMemo to prevent unnecessary recalculations
  const filteredPersons = useMemo(() => {
    // Filter out any persons with invalid coordinates, just to be extra safe
    return persons.filter(p => 
      typeof p.latitude === 'number' && 
      typeof p.longitude === 'number' &&
      !isNaN(p.latitude) && 
      !isNaN(p.longitude)
    );
  }, [persons]);

  // Control loading state
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load the leaflet-routing-machine script dynamically
    const loadRoutingMachine = async () => {
      try {
        // Check if we're in browser environment
        if (typeof window !== 'undefined') {
          // Check if Leaflet is already loaded
          if (window.L) {
            // Check if routing machine is already loaded
            if (!window.L.Routing) {
              // Add leaflet-routing-machine CSS
              const routingCss = document.createElement('link');
              routingCss.rel = 'stylesheet';
              routingCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet-routing-machine/3.2.12/leaflet-routing-machine.css';
              document.head.appendChild(routingCss);
              
              // Add leaflet-routing-machine script
              const routingScript = document.createElement('script');
              routingScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet-routing-machine/3.2.12/leaflet-routing-machine.min.js';
              routingScript.async = true;
              
              routingScript.onload = () => {
                setIsRoutingReady(true);
              };
              
              document.body.appendChild(routingScript);
            } else {
              setIsRoutingReady(true);
            }
          }
        }
      } catch (error) {
        console.error("Error loading routing machine:", error);
      }
    };
    
    loadRoutingMachine();
    
    // Add a slight delay to ensure proper initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      {!isLoading && <MapWithNoSSR persons={filteredPersons} />}
      
      {isLoading && (
        <div className="h-full w-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-700">Loading map with routing capabilities...</p>
          </div>
        </div>
      )}
    </div>
  );
}