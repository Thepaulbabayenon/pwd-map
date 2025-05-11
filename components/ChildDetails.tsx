// File: src/components/ChildDetails.tsx
import React from 'react';
import { Child } from '@/lib/types';

interface ChildDetailsProps {
  child: Child;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ChildDetails: React.FC<ChildDetailsProps> = ({ child, onClose, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto mt-8 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Child Details</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {child.imageUrl && (
        <div className="flex justify-center mb-4">
          <img 
            src={child.imageUrl} 
            alt={child.name} 
            className="w-40 h-40 object-cover rounded-lg shadow"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <p className="text-lg">
          <strong>Name:</strong> {child.name}
        </p>
        <p className="text-lg">
          <strong>Age:</strong> {child.age}
        </p>
        <p className="text-lg">
          <strong>Disability:</strong> {child.disability}
        </p>
        <p className="text-lg">
          <strong>Address:</strong> {child.address}
        </p>
        <p className="text-lg">
          <strong>Coordinates:</strong> {child.lat}, {child.lng}
        </p>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ChildDetails;