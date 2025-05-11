// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { v4 as uuidv4 } from 'uuid';
import db from '@/app/db/db';
import { personImage } from '@/app/db/schema';
import { sql } from 'drizzle-orm'; // Import sql properly at the top

export async function POST(req: NextRequest) {
  try {
    console.log('Upload API endpoint called');

    // Check if ImageKit credentials are configured
    if (!process.env.IMAGEKIT_PRIVATE_KEY || 
        !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 
        !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
      console.error('ImageKit credentials not found in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error - missing ImageKit credentials' },
        { status: 500 }
      );
    }

    // Initialize ImageKit inside the function to ensure fresh initialization
    const imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    });

    // Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const description = formData.get('description') as string || 'No description provided';
    const personId = formData.get('personId') as string | null;

    console.log('Form data received:', {
      fileExists: !!file,
      description,
      personId,
    });

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // personId is optional - only validate if it's provided
    if (personId) {
      if (isNaN(parseInt(personId))) {
        return NextResponse.json(
          { error: 'Invalid personId format. Must be a number.' },
          { status: 400 }
        );
      }
    } else {
      console.log('No personId provided - file will be uploaded without DB association');
    }

    // Generate a unique filename
    const originalFilename = file.name.replace(/\s/g, '_');
    const filename = `${uuidv4()}_${originalFilename}`;
    
    // Convert File to Buffer for ImageKit upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Attempting to upload file: ${originalFilename}`);
    
    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: filename,
      useUniqueFileName: true,
    });

    console.log('Upload successful:', {
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    });

    // Save image URL to database (if personId is provided)
    let insertResult = null;
    if (personId) {
      try {
        const personIdInt = parseInt(personId);
        
        console.log('Inserting into database with:', {
          personId: personIdInt,
          imageUrl: uploadResponse.url,
          description,
        });
        
        // Insert into database
        insertResult = await db.insert(personImage).values({
          personId: personIdInt,
          imageUrl: uploadResponse.url,
          description: description,
          // createdAt will be set by default
        }).returning();
        
        console.log('Database insert result:', insertResult);
        
        // Handle the return value based on database structure
        let imageId;
        if (insertResult && Array.isArray(insertResult) && insertResult.length > 0) {
          // Access the ID field based on your database structure
          imageId = insertResult[0]?.id;
          console.log('Got imageId from insert result:', imageId);
        } 
        
        // If we couldn't get the ID from the insert result, try to find it
        if (!imageId) {
          // Try to find the recently inserted record
          const recentImage = await db.select()
            .from(personImage)
            .where(
              sql`${personImage.personId} = ${personIdInt} AND ${personImage.imageUrl} = ${uploadResponse.url}`
            )
            .orderBy(sql`${personImage.createdAt} DESC`)
            .limit(1);
            
          if (recentImage && Array.isArray(recentImage) && recentImage.length > 0) {
            imageId = recentImage[0]?.id;
            console.log('Got imageId from query:', imageId);
          }
        }
        
        console.log('Image record saved to database with ID:', imageId);
        
        return NextResponse.json({
          url: uploadResponse.url,
          fileId: uploadResponse.fileId,
          imageId: imageId,
          message: 'File uploaded and saved to database with person reference'
        });
      } catch (dbError: unknown) {
        console.error('Database error details:', dbError);
        
        // Even though DB save failed, the image was uploaded, so we return partial success
        return NextResponse.json({
          url: uploadResponse.url,
          fileId: uploadResponse.fileId,
          error: 'Image uploaded but failed to save to database',
          dbError: dbError instanceof Error ? dbError.message : 'Unknown database error',
          dbErrorObj: JSON.stringify(dbError)
        }, { status: 207 }); // 207 Multi-Status to indicate partial success
      }
    }

    // If no personId was provided or handling it resulted in error
    return NextResponse.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      message: 'File uploaded successfully without person reference'
    });

  } catch (error: unknown) {
    // More detailed error logging
    console.error('Error in upload API route:', error);
    
    // Check if it's an ImageKit specific error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error && 'help' in error ? 
      (error as { help?: string }).help || (error as { details?: string }).details || '' : '';
    
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        message: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}