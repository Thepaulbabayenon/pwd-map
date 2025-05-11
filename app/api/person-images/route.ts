import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db/db";
import { personImage } from "@/app/db/schema";
import { v4 as uuidv4 } from "uuid";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // Parse form data which includes files
    const formData = await req.formData();
    const personIdStr = formData.get("personId") as string;
    
    if (!personIdStr) {
      return NextResponse.json(
        { error: "Person ID is required" },
        { status: 400 }
      );
    }
    const personId = Number(personIdStr);
    if (isNaN(personId)) {
      return NextResponse.json(
        { error: "Person ID must be a valid number" },
        { status: 400 }
      );
    }
    
    // Get all image files from form data
    const files = formData.getAll("images") as File[];
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }
    
    // Process and save each image
    const savedImages = [];
    
    for (const file of files) {
      // Generate unique filename
      const fileExt = path.extname(file.name);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = `/uploads/persons/${fileName}`;
      
      // Ensure directory exists (you'd need to set this up in your project)
      const uploadDir = path.join(process.cwd(), "public/uploads/persons");
      
      // Save file to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(path.join(uploadDir, fileName), buffer);
      
      // Save image metadata to database
      const [savedImage] = await db.insert(personImage).values({
        personId,
        imageUrl: filePath,
        createdAt: new Date(),
      }).returning();
      
      savedImages.push(savedImage);
    }
    
    return NextResponse.json(
      { message: "Images uploaded successfully", images: savedImages },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const personId = url.searchParams.get("personId");
    
    if (!personId) {
      return NextResponse.json(
        { error: "Person ID is required" },
        { status: 400 }
      );
    }
    
    // Fetch images for the specified person
    const images = await db.query.personImage.findMany({
      where: (personImage, { eq }) => eq(personImage.personId, Number(personId)),
      orderBy: (personImage, { desc }) => [desc(personImage.createdAt)],
    });
    
    return NextResponse.json(images);
    
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}