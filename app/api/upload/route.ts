import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { db } from "@/app/db/db"; // Import your Drizzle database instance
import { personMedia, person } from '@/app/db/schema'; // Updated schema import
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
  const fileType = formData.get('fileType') as string || 'image'; // Default to image if not specified

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!idNumber) {
    return NextResponse.json({ error: 'ID number is required' }, { status: 400 });
  }

  // Validate file type
  const isVideo = file.type.includes('video/');
  const isImage = file.type.includes('image/');
  
  if (!isVideo && !isImage) {
    return NextResponse.json({ error: 'Only image or video files are allowed' }, { status: 400 });
  }

  try {
    // Find person by idNumber
    const personRecord = await db.query.person.findFirst({
      where: eq(person.idNumber, idNumber),
    });

    if (!personRecord) {
      return NextResponse.json({ error: 'Person with this ID number not found' }, { status: 404 });
    }

    // Check existing media count for this person
    const existingMedia = await db.select().from(personMedia).where(eq(personMedia.personId, personRecord.id));
    
    if (existingMedia.length >= 4) {
      return NextResponse.json({ error: 'Maximum of 4 media items allowed per ID' }, { status: 400 });
    }

    // Validate ImageKit configuration
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      throw new Error('ImageKit private key is missing');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert buffer to base64 string for ImageKit
    const base64File = buffer.toString('base64');
    
    // Upload to ImageKit with folder structure based on ID number
    const result = await imagekit.upload({
      file: base64File,
      fileName: file.name,
      useUniqueFileName: true,
      folder: `people/${idNumber}`
    });

    // Save media reference to database
    const newMedia = await db.insert(personMedia).values({
      personId: personRecord.id,
      mediaUrl: result.url,
      description: description,
      mediaType: isVideo ? 'video' : 'image',
      fileId: result.fileId,
      fileName: file.name
    }).returning();

    return NextResponse.json({ 
      success: true, 
      url: result.url,
      publicId: result.fileId,
      mediaId: newMedia[0].id,
      mediaType: isVideo ? 'video' : 'image',
      message: `${isVideo ? 'Video' : 'Image'} uploaded successfully for ID: ${idNumber}. (${existingMedia.length + 1} of 4)`
    });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
    console.error('Upload error:', errorMessage);
    return NextResponse.json({ error: errorMessage || 'Upload failed' }, { status: 500 });
  }
}