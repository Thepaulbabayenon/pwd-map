// components/layout/Hero.jsx
import Link from 'next/link';
import { MapPinIcon, ChevronRightIcon, ArrowRightIcon } from 'lucide-react';

interface HeroProps {
  onViewMapClick: () => void;
}

export const Hero = ({ onViewMapClick }: HeroProps) => {
  return (
    <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-24 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: "url('/api/placeholder/1600/800')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(1px)'
          }}
          aria-hidden="true"
        ></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Disability Mapping <span className="text-blue-200">Initiative</span>
          </h1>
          <p className="text-xl mb-8 leading-relaxed text-blue-100">
            Discover and understand the distribution of persons with disabilities in our community.
            This platform aims to enhance awareness and support for inclusivity.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onViewMapClick}
              className="bg-white text-blue-800 font-medium py-3 px-8 rounded-md shadow-lg hover:bg-blue-50 transition duration-300 flex items-center group"
              aria-label="View interactive map"
            >
              <MapPinIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              <span>View Interactive Map</span>
              <ChevronRightIcon className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </button>
            <Link
              href="/about"
              className="bg-transparent border-2 border-white text-white font-medium py-3 px-8 rounded-md hover:bg-white hover:bg-opacity-10 transition duration-300 flex items-center"
              aria-label="Learn more about the initiative"
            >
              <span>Learn More</span>
              <ArrowRightIcon className="h-5 w-5 ml-2" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
    </section>
  );
};

export default Hero;