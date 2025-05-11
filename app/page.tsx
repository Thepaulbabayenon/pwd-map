// src/app/page.tsx
'use client';
import Link from 'next/link';

export function LandingPage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-5xl font-bold mb-6 text-blue-700">
        Welcome to the Disability Mapping Initiative
      </h1>
      <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
        Discover and understand the distribution of persons with disabilities in our community.
        This platform aims to enhance awareness and support for inclusivity.
      </p>
      <div className="space-x-4">
        <Link
          href="/home/map"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md transition duration-300"
        >
          View Interactive Map
        </Link>
        <Link
          href="/about" // You can create an about page
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg text-lg shadow-md transition duration-300"
        >
          Learn More
        </Link>
      </div>
      <div className="mt-16">
        <h2 className="text-3xl font-semibold mb-4 text-gray-800">Our Mission</h2>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          To provide a clear, accessible, and data-driven visualization of disability demographics
          to foster better resource allocation, policy-making, and community support.
        </p>
      </div>
    </div>
  );
}

export default LandingPage;