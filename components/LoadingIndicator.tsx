// components/ui/LoadingIndicator.jsx
export const LoadingIndicator = () => (
  <div className="flex justify-center items-center h-64">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-sm text-gray-500">Loading data...</p>
    </div>
  </div>
);

export default LoadingIndicator;