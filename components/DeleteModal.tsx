'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  personName: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, personName }: DeleteConfirmModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // When modal opens, set visible after a small delay to allow animation
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsVisible(true), 10);
    } else {
      document.body.style.overflow = '';
      setIsVisible(false);
    }
    
    // Cleanup
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const handleModalClick = (e: React.MouseEvent) => {
    // Close only if clicking the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleModalClick}
    >
      <div className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-3 p-4 mb-4 bg-red-50 text-red-800 rounded-md">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <p className="text-sm font-medium">This action cannot be undone</p>
        </div>
        
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete <span className="font-semibold">{personName}</span>? All associated data including images will be permanently removed.
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}