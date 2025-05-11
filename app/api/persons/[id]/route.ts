import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/app/db/db";
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
  imageUrl: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const personId = await params.id;
    
    // Fetch the person by ID
    const personRecord = await db.query.person.findFirst({
      where: eq(person.id, parseInt(personId)),
    });
    
    if (!personRecord) {
      return NextResponse.json(
        { error: "Person not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(personRecord);
  } catch (error) {
    console.error("Error fetching person:", error);
    return NextResponse.json(
      { error: "Failed to fetch person" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const personId = params.id;
    
    // Parse request body
    const body = await req.json();
    
    // Validate the incoming data
    const validatedData = personSchema.parse(body);
    
    // Check if person exists
    const existingPerson = await db.query.person.findFirst({
      where: eq(person.id, parseInt(personId)),
    });
    
    if (!existingPerson) {
      return NextResponse.json(
        { error: "Person not found" },
        { status: 404 }
      );
    }
    
    // Check if updated ID number conflicts with another person
    if (validatedData.idNumber !== existingPerson.idNumber) {
      const conflictingPerson = await db.query.person.findFirst({
        where: eq(person.idNumber, validatedData.idNumber),
      });
      
      if (conflictingPerson && conflictingPerson.id !== parseInt(personId)) {
        return NextResponse.json(
          { error: "Another person with this ID number already exists" },
          { status: 409 }
        );
      }
    }
    
    // Prepare data for update
    // Convert string dates to Date objects where necessary
    const personData = {
      ...validatedData,
      doi: validatedData.doi ? new Date(validatedData.doi).toISOString() : null,
      dob: new Date(validatedData.dob).toISOString(),
      // Update the updated timestamp
      updatedAt: new Date(),
    };
    
    // Update the person record
    const [updatedPerson] = await db
      .update(person)
      .set(personData)
      .where(eq(person.id, parseInt(personId)))
      .returning();
    
    // Return the updated person data
    return NextResponse.json(updatedPerson);
    
  } catch (error) {
    console.error("Error updating person:", error);
    
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: "Failed to update person record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const personId = params.id;
    
    // Check if person exists
    const existingPerson = await db.query.person.findFirst({
      where: eq(person.id, parseInt(personId)),
    });
    
    if (!existingPerson) {
      return NextResponse.json(
        { error: "Person not found" },
        { status: 404 }
      );
    }
    
    // Delete the person record
    await db
      .delete(person)
      .where(eq(person.id, parseInt(personId)));
    
    // Return success response
    return NextResponse.json(
      { message: "Person deleted successfully" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error deleting person:", error);
    return NextResponse.json(
      { error: "Failed to delete person record" },
      { status: 500 }
    );
  }
}