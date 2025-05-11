// components/sections/OverviewSection.jsx
import { HeartIcon, HandIcon, MapPinIcon, UsersIcon, PieChartIcon, BarChart3Icon, ChevronRightIcon } from 'lucide-react';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { PersonMapData, Child } from '@/lib/types';

interface OverviewSectionProps {
  isLoading: boolean;
  persons: PersonMapData[];
  children: Child[];
  onViewStatsClick: () => void;
}

export const OverviewSection = ({
  isLoading,
  persons,
  children,
  onViewStatsClick
}: OverviewSectionProps) => {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
            <HeartIcon className="h-6 w-6 mr-2 text-blue-600" aria-hidden="true" />
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            To provide a clear, accessible, and data-driven visualization of disability demographics
            to foster better resource allocation, policy-making, and community support.
          </p>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <HandIcon className="h-6 w-6 mr-2 text-blue-600" aria-hidden="true" />
            Key Objectives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-blue-50 p-4 rounded-lg flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <MapPinIcon className="h-4 w-4 text-blue-700" aria-hidden="true" />
              </div>
              <p className="text-gray-700">Map the geographic distribution of persons with various disabilities</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <UsersIcon className="h-4 w-4 text-blue-700" aria-hidden="true" />
              </div>
              <p className="text-gray-700">Identify areas with concentrated needs for targeted interventions</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <PieChartIcon className="h-4 w-4 text-blue-700" aria-hidden="true" />
              </div>
              <p className="text-gray-700">Provide data-driven insights for policymakers and service providers</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <BarChart3Icon className="h-4 w-4 text-blue-700" aria-hidden="true" />
              </div>
              <p className="text-gray-700">Support inclusive community planning and development</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
          <UsersIcon className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
          Disability Overview
        </h2>
        
        {isLoading ? <LoadingIndicator /> : (
          <>
            <div className="mb-6">
              <h3 className="text-sm font-medium uppercase text-gray-500 mb-3">Distribution by Type</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Physical</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: '45%' }}
                      role="progressbar"
                      aria-valuenow={45}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Visual</span>
                    <span>30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: '30%' }}
                      role="progressbar"
                      aria-valuenow={30}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Hearing</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: '25%' }}
                      role="progressbar"
                      aria-valuenow={25}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{persons.length + children.length}</p>
                <p className="text-xs text-gray-600 mt-1">Total Registered</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{persons.length}</p>
                <p className="text-xs text-gray-600 mt-1">Adults</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{children.length}</p>
                <p className="text-xs text-gray-600 mt-1">Children</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={onViewStatsClick}
                className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <span className="font-medium">View Detailed Statistics</span>
                <ChevronRightIcon className="h-4 w-4 ml-2" aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};