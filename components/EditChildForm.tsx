// File: src/components/EditChildForm.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImage } from '@/lib/cloudinary';
import { Child } from '@/lib/types';

interface EditChildFormProps {
  child: Child;
  onCancel: () => void;
  onUpdate: (updatedChild: Child) => Promise<void>;
}

const EditChildForm: React.FC<EditChildFormProps> = ({ child, onCancel, onUpdate }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(child.imageUrl || null);
  const [formData, setFormData] = useState({
    name: child.name,
    age: child.age.toString(),
    disability: child.disability,
    lat: child.lat.toString(),
    lng: child.lng.toString(),
    address: child.address,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview of the image
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Upload new image if available
      let imageUrl = child.imageUrl || '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      // Create updated child object
      const updatedChild: Child = {
        id: child.id,
        name: formData.name,
        age: parseInt(formData.age),
        disability: formData.disability,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        address: formData.address,
        imageUrl: imageUrl,
      };
      
      // Call the onUpdate prop function to handle the submission
      await onUpdate(updatedChild);
      
      // Close form
      onCancel();
    } catch (error) {
      console.error('Error updating child:', error);
      alert('Failed to update child. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Edit Child</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            name="age"
            min="0"
            max="18"
            value={formData.age}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Disability</label>
          <select
            name="disability"
            value={formData.disability}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Disability Type</option>
            <option value="Visual Impairment">Visual Impairment</option>
            <option value="Hearing Impairment">Hearing Impairment</option>
            <option value="Physical Disability">Physical Disability</option>
            <option value="Cognitive Disability">Cognitive Disability</option>
            <option value="Learning Disability">Learning Disability</option>
            <option value="Multiple Disabilities">Multiple Disabilities</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="text"
              name="lat"
              value={formData.lat}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="text"
              name="lng"
              value={formData.lng}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          ></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {previewImage && (
            <div className="mt-2">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded-md"
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditChildForm;