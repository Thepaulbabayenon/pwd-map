import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { db }from "@/app/db/db"; // Import your Drizzle database instance
import { personImage, person } from '@/app/db/schema'; // Import your schema
import { eq } from 'drizzle-orm'; // For database queries

export async function POST(req: NextRequest) {
  // Log environment variables (remove in production)
  console.log({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ? 'Set' : 'Missing',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY ? 'Set' : 'Missing',
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ? 'Set' : 'Missing'
  });
  
  // Initialize ImageKit
  const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''
  });

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const idNumber = formData.get('idNumber') as string;
  const description = formData.get('description') as string || 'No description provided';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!idNumber) {
    return NextResponse.json({ error: 'ID number is required' }, { status: 400 });
  }

  try {
    // Find person by idNumber
    const personRecord = await db.query.person.findFirst({
      where: eq(person.idNumber, idNumber),
    });

    if (!personRecord) {
      return NextResponse.json({ error: 'Person with this ID number not found' }, { status: 404 });
    }

    // Check existing images count for this person
    const existingImages = await db.select().from(personImage).where(eq(personImage.personId, personRecord.id));
    
    if (existingImages.length >= 4) {
      return NextResponse.json({ error: 'Maximum of 4 images allowed per ID' }, { status: 400 });
    }

    // Validate ImageKit configuration
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      throw new Error('ImageKit private key is missing');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert buffer to base64 string for ImageKit
    const base64Image = buffer.toString('base64');
    
    // Upload to ImageKit with folder structure based on ID number
    const result = await imagekit.upload({
      file: base64Image,
      fileName: file.name,
      useUniqueFileName: true,
      folder: `people/${idNumber}`
    });

    // Save image reference to database
    const newImage = await db.insert(personImage).values({
      personId: personRecord.id,
      imageUrl: result.url,
      description: description
    }).returning();

    return NextResponse.json({ 
      success: true, 
      url: result.url,
      publicId: result.fileId,
      imageId: newImage[0].id,
      message: `Image uploaded successfully for ID: ${idNumber}. (${existingImages.length + 1} of 4)`
    });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
    console.error('Upload error:', errorMessage);
    return NextResponse.json({ error: errorMessage || 'Upload failed' }, { status: 500 });
  }
}