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
import { Loader2 } from "lucide-react";
import Link from "next/link";

// Define the person type based on your schema
type Person = {
  id: number;
  idNumber: string;
  name: string;
  address: string;
  dob: string;
  gender: string;
  disabilityType: string | null;
  employment: string | null;
  age: string | null;
  createdAt: string;
};

export default function PersonTable() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching persons:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPersons();
  }, []);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registered Persons</h1>
        <Link href="/home/persons/new">
          <Button>Register New Person</Button>
        </Link>
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableCaption>List of all registered persons</TableCaption>
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
              {persons.length > 0 ? (
                persons.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>{person.idNumber}</TableCell>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.gender}</TableCell>
                    <TableCell>{person.age}</TableCell>
                    <TableCell className="max-w-xs truncate" title={person.address}>
                      {person.address}
                    </TableCell>
                    <TableCell>{person.disabilityType || "None"}</TableCell>
                    <TableCell>{person.employment || "Not specified"}</TableCell>
                    <TableCell>{formatDate(person.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/home/persons/${person.id}`}>
                        <Button variant="outline" size="sm" className="mr-2">
                          View
                        </Button>
                      </Link>
                      <Link href={`/home/persons/${person.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No person records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}