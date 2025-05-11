// components/ui/ChildProfileCard.jsx
import Link from 'next/link';
import Image from 'next/image';
import { UsersIcon } from 'lucide-react';
import { Child } from '@/lib/types';

interface ChildProfileCardProps {
  child: Child;
  onClose: () => void;
}

export const ChildProfileCard = ({
  child,
  onClose
}: ChildProfileCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
    <div className="flex items-center mb-4">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mr-4">
        {child.imageUrl ? (
          <Image
            src={child.imageUrl}
            alt={child.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
            <UsersIcon className="h-8 w-8" />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800">{child.name}</h3>
        <p className="text-sm text-gray-500">ID: #{child.id}</p>
      </div>
    </div>
    
    <div className="space-y-4 mt-6">
      <div className="flex border-b border-gray-100 pb-2">
        <span className="w-1/3 text-gray-500 text-sm">Age</span>
        <span className="w-2/3 font-medium">{child.age} years</span>
      </div>
      <div className="flex border-b border-gray-100 pb-2">
        <span className="w-1/3 text-gray-500 text-sm">Disability</span>
        <span className="w-2/3 font-medium">{child.disability}</span>
      </div>
      <div className="flex border-b border-gray-100 pb-2">
        <span className="w-1/3 text-gray-500 text-sm">Address</span>
        <span className="w-2/3 font-medium">{child.address}</span>
      </div>
      <div className="flex pb-2">
        <span className="w-1/3 text-gray-500 text-sm">Coordinates</span>
        <span className="w-2/3 font-medium text-gray-700">
          {child.lat.toFixed(4)}, {child.lng.toFixed(4)}
        </span>
      </div>
    </div>
    
    <div className="mt-6 flex space-x-3">
      <Link 
        href={`/children/${child.id}`}
        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-center text-sm font-medium hover:bg-blue-700 transition duration-300"
      >
        View Full Profile
      </Link>
      <button 
        className="bg-gray-100 text-gray-700 p-2 rounded-md hover:bg-gray-200 transition duration-300"
        onClick={onClose}
        aria-label="Close profile"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
);

export default ChildProfileCard;