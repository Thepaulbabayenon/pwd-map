// src/components/layout/Footer.tsx
export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
        <p>© {new Date().getFullYear()} Disability Map Project. All rights reserved.</p>
      </footer>
    );
  }