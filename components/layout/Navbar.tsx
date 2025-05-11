// src/components/layout/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/home" className="text-2xl font-bold">
          DisabilityMap
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link href="/home" className="hover:text-blue-200">
              Home
            </Link>
          </li>
          <li>
            <Link href="/home/map" className="hover:text-blue-200">
              Map View
            </Link>
          </li>
          {/* Add more links as needed, e.g., Admin, Add PWD */}
        </ul>
      </div>
    </nav>
  );
}