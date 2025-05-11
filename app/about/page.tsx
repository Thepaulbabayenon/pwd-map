'use client';
import Link from 'next/link';

export function AboutPage() {
  return (
    <div className="py-16 px-4 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-blue-700 text-center">
        About the Disability Mapping Initiative
      </h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Vision</h2>
        <p className="text-lg text-gray-600 mb-4">
          We envision a world where accessibility and inclusion are fundamental rights for all persons with disabilities. 
          By mapping the distribution and needs of the disability community, we aim to create a foundation for targeted 
          support, informed policy decisions, and community awareness.
        </p>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">What We Do</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2 text-blue-600">Data Collection</h3>
            <p className="text-gray-600">
              We gather anonymized demographic information about persons with disabilities through partnerships 
              with community organizations, government agencies, and voluntary participation.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2 text-blue-600">Visualization</h3>
            <p className="text-gray-600">
              Our interactive map transforms complex data into accessible visual information, allowing users 
              to understand disability demographics across different regions and categories.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2 text-blue-600">Resource Allocation</h3>
            <p className="text-gray-600">
              We help organizations and policymakers identify areas with high needs for specific services, 
              infrastructure improvements, and community support programs.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2 text-blue-600">Advocacy</h3>
            <p className="text-gray-600">
              Our data supports evidence-based advocacy efforts to improve accessibility, services, 
              and inclusion across communities.
            </p>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Approach</h2>
        <p className="text-lg text-gray-600 mb-4">
          We believe in the power of data to drive change, but we also recognize the importance of respecting privacy 
          and individuality. Our approach balances:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li><span className="font-medium">Privacy:</span> All personal information is anonymized and aggregated to protect individuals.</li>
          <li><span className="font-medium">Accuracy:</span> We work with experts in disability studies and data science to ensure our methodology is sound.</li>
          <li><span className="font-medium">Inclusivity:</span> Our platform aims to represent all types of disabilities, visible and invisible.</li>
          <li><span className="font-medium">Accessibility:</span> Our tools are designed to be accessible to users with various disabilities.</li>
        </ul>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Join Our Efforts</h2>
        <p className="text-lg text-gray-600 mb-6">
          There are many ways to contribute to the Disability Mapping Initiative:
        </p>
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <div className="h-6 w-6 text-blue-600 mr-2">•</div>
              <span>Share your experiences and demographic information (always optional and anonymous)</span>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 text-blue-600 mr-2">•</div>
              <span>Partner with us as a community organization or service provider</span>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 text-blue-600 mr-2">•</div>
              <span>Volunteer your skills in data analysis, web development, or community outreach</span>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 text-blue-600 mr-2">•</div>
              <span>Share our resources with policymakers and community leaders</span>
            </li>
          </ul>
        </div>
      </section>
      
      <div className="text-center mt-12">
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md transition duration-300 mr-4"
        >
          Return to Home
        </Link>
        <Link
          href="/home/map"
          className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg text-lg shadow-md transition duration-300"
        >
          Explore the Map
        </Link>
      </div>
    </div>
  );
}

export default AboutPage;