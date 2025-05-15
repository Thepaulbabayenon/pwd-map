'use client';
import Link from "next/link";
import { UserRound } from "lucide-react";
import { Plus } from "lucide-react";
import {db} from "@/app/db/db";
import { person as personTable, personImage } from "@/app/db/schema";
import { desc, asc, sql, and, like, or, eq } from "drizzle-orm";
import { useState, useEffect } from "react";

// Define search params interface
interface SearchParams {
  search?: string;
  sort?: string;
  filter?: string;
  page?: string;
}

// Define person type based on the query result
interface Person {
  id: number;
  idNumber: string | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  gender: string | null;
  idStatus: string | null;
  createdAt: Date | null;
  imageCount: number;
}

export async function PersonsTable({ searchParams }: { searchParams: SearchParams }) {
  const { search, sort, filter, page = "1" } = await searchParams;
  const pageNumber = await parseInt(page, 10) || 1;
  const itemsPerPage = 10;
  const offset = (pageNumber - 1) * itemsPerPage;
  
  // Prepare where conditions
  const whereConditions = [];
  
  // Add search condition if provided
  if (search) {
    const searchTerm = `%${search}%`;
    whereConditions.push(
      or(
        like(personTable.name || '', searchTerm),
        like(personTable.firstName || '', searchTerm),
        like(personTable.lastName || '', searchTerm),
        like(personTable.idNumber || '', searchTerm),
        like(personTable.address || '', searchTerm)
      )
    );
  }
  
  // Add status filter condition if provided
  if (filter) {
    whereConditions.push(like(personTable.idStatus || '', `%${filter}%`));
  }
  
  // Determine order by clause
  let orderByClause;
  switch (sort) {
    case "oldest":
      orderByClause = asc(personTable.createdAt);
      break;
    case "name":
      orderByClause = asc(personTable.firstName);
      break;
    case "name-desc":
      orderByClause = desc(personTable.firstName);
      break;
    case "newest":
    default:
      orderByClause = desc(personTable.createdAt);
      break;
  }

  // Execute count query first
  const countResult = await db.select({
    count: sql<number>`COUNT(DISTINCT ${personTable.id})::int`,
  })
  .from(personTable)
  .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
  .execute();
  
  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  // Execute main query with proper type for the result
  const persons = await db.select({
    id: personTable.id,
    idNumber: personTable.idNumber,
    name: personTable.name,
    firstName: personTable.firstName,
    lastName: personTable.lastName,
    address: personTable.address,
    gender: personTable.gender,
    idStatus: personTable.idStatus,
    createdAt: personTable.createdAt,
    imageCount: sql<number>`COUNT(${personImage.id})::int`,
  })
  .from(personTable)
  .leftJoin(personImage, eq(personImage.personId, personTable.id))
  .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
  .groupBy(personTable.id)
  .orderBy(orderByClause)
  .limit(itemsPerPage)
  .offset(offset)
  .execute();
  
  // Empty state
  if (persons.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="flex justify-center mb-4">
          <UserRound className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No persons found</h3>
        <p className="mt-2 text-gray-500">
          {search || filter
            ? "Try adjusting your search or filter parameters"
            : "Get started by adding a new person to the registry"}
        </p>
        <div className="mt-6">
          <Link
            href="/home/persons/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Person
          </Link>
        </div>
      </div>
    );
  }
  
  // Client-side formatter component to avoid hydration mismatch
  function ClientSideDateFormatter({ date }: { date: Date | null }) {
    const [formattedDate, setFormattedDate] = useState<string>("—");
    
    useEffect(() => {
      if (date) {
        setFormattedDate(new Date(date).toLocaleDateString());
      }
    }, [date]);
    
    // Initial server render shows a placeholder
    // Client will update it after hydration
    return <>{formattedDate}</>;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Person
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {persons.map((person: Person) => {
                // Format name - use full name if available, otherwise construct from parts
                const displayName = person.name || 
                  [person.firstName, person.lastName]
                    .filter(Boolean)
                    .join(" ") || 
                  "Unknown";
                
                return (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {person.imageCount > 0 ? (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              <UserRound className="h-6 w-6 text-gray-500" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserRound className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          {person.imageCount > 0 && (
                            <span className="absolute bottom-0 right-0 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-400 text-xs text-white">
                              {person.imageCount}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {displayName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {person.gender || "Not specified"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{person.idNumber || "—"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                      <div className="text-sm text-gray-900">{person.address || "—"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {person.idStatus ? (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          person.idStatus.toLowerCase().includes("active") 
                            ? "bg-green-100 text-green-800" 
                            : person.idStatus.toLowerCase().includes("pending")
                            ? "bg-yellow-100 text-yellow-800"
                            : person.idStatus.toLowerCase().includes("expired")
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {person.idStatus}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Not specified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <ClientSideDateFormatter date={person.createdAt} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/home/persons/${person.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        href={`/home/persons/${person.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/home/persons/${person.id}/delete`}
                        className="text-indigo-600 hover:text-red-600 ml-4"
                      >
                        Delete
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{Math.min(offset + 1, totalCount)}</span> to{" "}
            <span className="font-medium">{Math.min(offset + itemsPerPage, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> results
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              // Create query params while ensuring proper types
              const queryParams: Record<string, string> = {};
              if (search) queryParams.search = search;
              if (sort) queryParams.sort = sort;
              if (filter) queryParams.filter = filter;
              queryParams.page = pageNum.toString();
              
              const queryString = new URLSearchParams(queryParams).toString();
              
              return (
                <Link
                  key={pageNum}
                  href={`/home/persons?${queryString}`}
                  className={`px-3 py-1 rounded-md ${
                    pageNum === pageNumber
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}