'use client';

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
    // Add a slight delay to ensure proper initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      {!isLoading && <MapWithNoSSR persons={filteredPersons} />}
    </div>
  );
}