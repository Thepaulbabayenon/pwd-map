import { notFound } from "next/navigation";
import React from "react";
import { db } from "@/app/db/db";
import { person } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import PersonPageClient from "@/components/PersonPageClient";
import { PersonMedia } from "@/lib/types";

// Define interfaces for type safety
interface PersonData {
  id: number;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  name?: string | null;
  idNumber?: string | null;
  idStatus?: string | null;
  gender?: string | null;
  dob?: string | null;
  age?: number | null;
  employment?: string | null;
  address?: string | null;
  doi?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  disabilityType?: string | null;
  specificDisability?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  media?: PersonMedia[];
}

interface PersonPageProps {
  params: {
    id: string;
  };
}

// Server component to fetch data
export default async function PersonPage({ params }: PersonPageProps) {
  let personId: number;
  let id: string;
  try {
    id = params.id;
    // Parse the ID directly
    personId = parseInt(id);
  } catch (error) {
    console.error("Error in PersonPage:", error);
    return <div>Error loading person data.</div>;
  }

  // Check if the ID is a valid number
  if (isNaN(personId)) {
    return notFound();
  }

  // Fetch the person details from the database
  const personDataRaw = await db.query.person.findFirst({
    where: eq(person.id, personId),
    with: {
      media: true,
    },
  });

  // If person not found, show 404 page
  if (!personDataRaw) {
    notFound();
  }

  // Convert age to number if necessary
  const personData: PersonData = {
    ...personDataRaw,
    age: personDataRaw.age !== null && personDataRaw.age !== undefined
      ? typeof personDataRaw.age === "string"
        ? Number(personDataRaw.age)
        : personDataRaw.age
      : null,
  };

  // Format the full name correctly
  const fullName = [
    personData.firstName || "",
    personData.middleName || "",
    personData.lastName || ""
  ].filter(Boolean).join(" ") || personData.name || "Unknown";

  return (
    <PersonPageClient
      personData={personData}
      fullName={fullName}
    />
  );
}
