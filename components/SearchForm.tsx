"use client";

import { Search, Filter, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

// Define search params interface
interface SearchParams {
  search?: string;
  sort?: string;
  filter?: string;
  page?: string;
}

export function SearchForm({ searchParams }: { searchParams: SearchParams }) {
  const { search, sort, filter } = searchParams;
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const searchValue = formData.get("search") as string;
    const sortValue = formData.get("sort") as string;
    const filterValue = formData.get("filter") as string;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (searchValue) params.set("search", searchValue);
    if (sortValue) params.set("sort", sortValue);
    if (filterValue) params.set("filter", filterValue);
    
    // Navigate to the new URL
    const queryString = params.toString();
    router.push(`/home/persons${queryString ? `?${queryString}` : ""}`);
    
    setTimeout(() => setIsSearching(false), 500);
  };

  const clearSearch = () => {
    if (formRef.current) {
      const searchInput = formRef.current.querySelector('input[name="search"]') as HTMLInputElement;
      if (searchInput) searchInput.value = '';
      
      // Reset select fields to default values
      const sortSelect = formRef.current.querySelector('select[name="sort"]') as HTMLSelectElement;
      if (sortSelect) sortSelect.value = 'newest';
      
      const filterSelect = formRef.current.querySelector('select[name="filter"]') as HTMLSelectElement;
      if (filterSelect) filterSelect.value = '';
      
      // Navigate to the base URL
      router.push('/home/persons');
    }
  };

  // Check if any filters are active
  const hasActiveFilters = Boolean(search || filter || (sort && sort !== "newest"));

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            name="search"
            placeholder="Search by name, ID number or address..."
            defaultValue={search || ""}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                const searchInput = formRef.current?.querySelector('input[name="search"]') as HTMLInputElement;
                if (searchInput) {
                  searchInput.value = '';
                  searchInput.focus();
                }
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap gap-2">
          <select
            name="filter"
            defaultValue={filter || ""}
            className="border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
          
          <select
            name="sort"
            defaultValue={sort || "newest"}
            className="border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white min-w-[140px]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>
          
          <button
            type="submit"
            disabled={isSearching}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md transition-colors duration-200 min-w-[100px]"
          >
            {isSearching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearSearch}
              className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-md transition-colors duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}