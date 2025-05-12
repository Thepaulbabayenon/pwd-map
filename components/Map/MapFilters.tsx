'use client';

import { useState, useEffect } from 'react';
import { PersonMapData } from '@/lib/types';
import ClientMapWrapper from '@/components/Map/ClientMapWrapper';

interface MapFiltersProps {
  initialData: PersonMapData[];
  disabilityTypes: string[];
}

export default function MapFilters({ initialData, disabilityTypes }: MapFiltersProps) {
  // State for filters
  const [disabilityType, setDisabilityType] = useState<string>('all');
  const [searchName, setSearchName] = useState<string>('');
  
  // State for filtered data
  const [filteredData, setFilteredData] = useState<PersonMapData[]>(initialData);
  
  // Apply filters whenever filter state changes
  useEffect(() => {
    let filtered = [...initialData];
    
    // Filter by disability type if not set to 'all'
    if (disabilityType !== 'all') {
      filtered = filtered.filter(person => person.disabilityType === disabilityType);
    }
    
    // Filter by name if search text is not empty
    if (searchName.trim() !== '') {
      const searchLower = searchName.toLowerCase().trim();
      filtered = filtered.filter(person => {
        const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
        return fullName.includes(searchLower);
      });
    }
    
    setFilteredData(filtered);
  }, [disabilityType, searchName, initialData]);
  
  // Handler for applying filters manually
  const handleApplyFilters = () => {
    // Nothing needed here since we're using useEffect to apply filters automatically
    // But this could be used for more complex filtering in the future
  };
  
  // Handler for resetting filters
  const handleResetFilters = () => {
    setDisabilityType('all');
    setSearchName('');
  };

  return (
    <>
      {/* Filter UI */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex-grow md:flex-grow-0">
          <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">
            Disability Type
          </label>
          <select
            id="filter-type"
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            value={disabilityType}
            onChange={(e) => setDisabilityType(e.target.value)}
          >
            <option value="all">All Types</option>
            {disabilityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-grow md:flex-grow-0">
          <label htmlFor="search-name" className="block text-sm font-medium text-gray-700 mb-1">
            Search by Name
          </label>
          <input
            type="text"
            id="search-name"
            placeholder="Enter name..."
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        
        <div className="flex-grow md:flex-grow-0 self-end flex space-x-2">
          <button 
            className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </button>
          
          <button 
            className="px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            onClick={handleResetFilters}
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="relative">
          {filteredData.length === 0 ? (
            <div className="w-full h-[70vh] bg-white rounded-lg border border-gray-100 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700">No Results Found</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
                No persons match your current filter criteria. Try adjusting your filters or search terms.
              </p>
              <button 
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={handleResetFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="w-full h-[70vh] rounded-lg overflow-hidden shadow-md">
              <ClientMapWrapper persons={filteredData} />
            </div>
          )}
        </div>
        
        {/* Legend */}
        {filteredData.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="font-medium text-gray-700">Map Legend:</div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block mr-2"></span>
              <span>Physical Disability</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-2"></span>
              <span>Visual Disability</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block mr-2"></span>
              <span>Hearing Disability</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block mr-2"></span>
              <span>Other Disability</span>
            </div>
          </div>
        )}
        
        {/* Filter results stats */}
        {filteredData.length > 0 && filteredData.length < initialData.length && (
          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredData.length} of {initialData.length} total records
          </div>
        )}
      </div>
      
      {/* Filtered data table preview */}
      {filteredData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {filteredData.length === initialData.length 
                ? "Mapped Individuals" 
                : `Filtered Results (${filteredData.length})`}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disability Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specific Disability</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.slice(0, 5).map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{person.firstName} {person.lastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.disabilityType || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.specificDisability || 'Not specified'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.images?.length || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a href={`/home/persons/${person.id}`} className="text-blue-600 hover:text-blue-900">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length > 5 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing 5 of {filteredData.length} records
            </div>
          )}
        </div>
      )}
    </>
  );
}