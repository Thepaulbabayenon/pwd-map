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
  const [isRoutingReady, setIsRoutingReady] = useState(false);
  
  const filteredPersons = useMemo(() => {
    return persons.filter(p => 
      typeof p.latitude === 'number' && 
      typeof p.longitude === 'number' &&
      !isNaN(p.latitude) && 
      !isNaN(p.longitude)
    );
  }, [persons]);

  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadRoutingMachine = async () => {
      try {
        if (typeof window !== 'undefined') {
          if (window.L) {
            if (!window.L.Routing) {
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
                setIsLoading(false); // End loading when routing is ready
              };
              
              document.body.appendChild(routingScript);
            } else {
              setIsRoutingReady(true);
              setIsLoading(false); // End loading when routing is ready
            }
          }
        }
      } catch (error) {
        console.error("Error loading routing machine:", error);
        setIsLoading(false); // End loading even if there's an error
      }
    };
    
    loadRoutingMachine();
    
    // Fallback timer in case something goes wrong with routing initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Increased from 500ms to give more time for routing to initialize
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      {!isLoading && <MapWithNoSSR persons={filteredPersons} isRoutingReady={isRoutingReady} />}
      
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