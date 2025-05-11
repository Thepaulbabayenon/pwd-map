import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { SearchForm } from "@/components/SearchForm";
import { PersonsTable } from "@/components/PersonsTable";
import { PersonsTableSkeleton } from "@/components/PersonsTableSkeleton";

interface SearchParams {
  search?: string;
  sort?: string;
  filter?: string;
  page?: string;
}

export default async function PersonsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Persons Registry</h1>
        <Link 
          href="/home/persons/new" 
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Link>
      </div>
      
      <div className="mb-8">
        <SearchForm searchParams={searchParams} />
      </div>
      
      <Suspense fallback={<PersonsTableSkeleton />}>
        <PersonsTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}