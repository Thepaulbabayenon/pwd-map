import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import  db  from "@/app/db/db";
import { person } from "@/app/db/schema";
import { eq } from "drizzle-orm";

// Define the form validation schema
const personSchema = z.object({
  idNumber: z.string().min(1, "ID Number is required"),
  doi: z.string().optional(),
  name: z.string().min(1, "Full name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  dob: z.string().min(1, "Date of birth is required"),
  age: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  disabilityType: z.string().optional(),
  specificDisability: z.string().optional(),
  idStatus: z.string().optional(),
  employment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate the incoming data
    const validatedData = personSchema.parse(body);
    
    // Check if person with the same ID number already exists
    const existingPerson = await db.query.person.findFirst({
      where: eq(person.idNumber, validatedData.idNumber),
    });
    
    if (existingPerson) {
      return NextResponse.json(
        { error: "Person with this ID number already exists" },
        { status: 409 }
      );
    }
    
    // Prepare data for insertion
    // Convert string dates to Date objects where necessary
    const personData = {
      ...validatedData,
      doi: validatedData.doi ? new Date(validatedData.doi).toISOString() : null,
      dob: new Date(validatedData.dob).toISOString(),
      // Add created and updated timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Insert the new person record
    const [createdPerson] = await db.insert(person).values(personData).returning();
    
    // Return the created person data
    return NextResponse.json(createdPerson, { status: 201 });
    
  } catch (error) {
    console.error("Error creating person:", error);
    
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: "Failed to create person record" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const idNumber = url.searchParams.get("idNumber");
    
    // If ID number is provided, fetch specific person
    if (idNumber) {
      const personRecord = await db.query.person.findFirst({
        where: eq(person.idNumber, idNumber),
      });
      
      if (!personRecord) {
        return NextResponse.json(
          { error: "Person not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(personRecord);
    }
    
    // Otherwise, fetch all person
    const allPerson = await db.query.person.findMany({
      orderBy: (person, { desc }) => [desc(person.createdAt)],
    });
    
    return NextResponse.json(allPerson);
    
  } catch (error) {
    console.error("Error fetching persons:", error);
    return NextResponse.json(
      { error: "Failed to fetch persons" },
      { status: 500 }
    );
  }
}