"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Define the person type based on your schema
type Person = {
  id: number;
  idNumber: string | null;
  name: string | null;
  address: string | null;
  dob: string | null;
  gender: string | null;
  disabilityType: string | null;
  employment: string | null;
  age: string | null;
  createdAt: string;
};

// Disability type to color mapping - copied from map component for consistency
const DISABILITY_COLORS: Record<string, string> = {
  'PHYSICAL DISABILITY': '#3B82F6', // Blue
  'PSYCHOSOCIAL DISABILITY': '#EC4899', // Pink
  'ORTHOPEDIC DISABILITY': '#10B981', // Green
  'VISUAL DISABILITY': '#F59E0B', // Yellow
  'SPEECH AND LANGUAGE IMPAIRMENT': '#8B5CF6', // Purple
  'DEAF OR HARD OF HEARING': '#6366F1', // Indigo
  'VISUAL IMPAIRMENT': '#F43F5E', // Rose
  'LEARNING DISABILITY': '#6B7280', // Gray
  'INTELLECTUAL DISABILITY': '#F97316', // Orange
  'MENTAL DISABILITY': '#14B8A6', // Teal
  'CANCER (RA 11215)': '#A855F7', // Violet
  'RARE DISEASE': '#EF4444', // Red
  'PHYSICAL DISABILITY (B)': '#3B82F6', // Blue (same as Physical Disability)
  'Unknown': '#94A3B8', // Slate
};

export default function PersonPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    async function fetchPersons() {
      try {
        setLoading(true);
        const response = await fetch("/api/persons");
        
        if (!response.ok) {
          throw new Error("Failed to fetch person data");
        }
        
        const data = await response.json();
        setPersons(data);
        setFilteredPersons(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching persons:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPersons();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPersons(persons);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const results = persons.filter(person => 
        (person.name && person.name.toLowerCase().includes(lowercasedSearch)) ||
        (person.idNumber && person.idNumber.toLowerCase().includes(lowercasedSearch)) ||
        (person.address && person.address.toLowerCase().includes(lowercasedSearch)) ||
        (person.disabilityType && person.disabilityType.toLowerCase().includes(lowercasedSearch)) ||
        (person.employment && person.employment.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredPersons(results);
    }
    setCurrentPage(1); // Reset to first page on new search
  }, [searchTerm, persons]);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get color for disability type
  const getDisabilityColor = (disabilityType: string | null) => {
    if (!disabilityType) return DISABILITY_COLORS['Unknown'];
    return DISABILITY_COLORS[disabilityType] || DISABILITY_COLORS['Unknown'];
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPersons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPersons.length / itemsPerPage);

  // Generate page numbers for pagination
  const generatePaginationItems = () => {
    const items = [];
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          onClick={() => setCurrentPage(1)} 
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if current page is more than 3
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i > 1 && i < totalPages) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              onClick={() => setCurrentPage(i)} 
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    // Show ellipsis if there are more pages after current + 1
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            onClick={() => setCurrentPage(totalPages)} 
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Registered Persons</h1>
          <Link href="/home/persons/new">
            <Button>Register New Person</Button>
          </Link>
        </div>

        {/* Search bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="search"
            placeholder="Search by name, ID, address..."
            className="pl-10 pr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableCaption>
                  {filteredPersons.length > 0 
                    ? `Showing ${indexOfFirstItem + 1} - ${Math.min(indexOfLastItem, filteredPersons.length)} of ${filteredPersons.length} persons`
                    : "No person records found"
                  }
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Disability</TableHead>
                    <TableHead>Employment</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell>{person.idNumber || "-"}</TableCell>
                        <TableCell className="font-medium">{person.name || "-"}</TableCell>
                        <TableCell>{person.gender || "-"}</TableCell>
                        <TableCell>{person.age || "-"}</TableCell>
                        <TableCell className="max-w-xs truncate" title={person.address || ""}>
                          {person.address || "-"}
                        </TableCell>
                        <TableCell>
                          {person.disabilityType ? (
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: getDisabilityColor(person.disabilityType) }}
                              />
                              <span>{person.disabilityType}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: DISABILITY_COLORS['Unknown'] }}
                              />
                              <span>None</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{person.employment || "Not specified"}</TableCell>
                        <TableCell>{formatDate(person.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/home/persons/${person.id}`}>
                            <Button variant="outline" size="sm" className="mr-2">
                              View
                            </Button>
                          </Link>
                          <Link href={`/home/persons/${person.id}/edit`}>
                            <Button variant="outline" size="sm" className="mr-2">
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/home/persons/${person.id}/delete`}>
                            <Button variant="outline" size="sm">
                              Delete
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        {searchTerm ? "No results matching your search" : "No person records found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Disability Color Legend */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium mb-3">Disability Type Legend</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(DISABILITY_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {filteredPersons.length > 0 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {generatePaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </div>
  );
}