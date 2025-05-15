import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { db }from "@/app/db/db";
import { personImage } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(req: NextRequest) {
  // Initialize ImageKit
  const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''
  });

  // Get the image ID from query parameters
  const url = new URL(req.url);
  const imageId = url.searchParams.get('imageId');

  if (!imageId) {
    return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
  }

  try {
    // Find the image in the database
    const image = await db.query.personImage.findFirst({
      where: eq(personImage.id, parseInt(imageId)),
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Extract the file ID from the URL (assuming URL contains the file ID)
    // This depends on your imagekit setup, you might need to adjust this logic
    // For proper implementation, you should store the ImageKit fileId in your database
    const url = new URL(image.mediaUrl);
    const pathParts = url.pathname.split('/');
    const fileId = pathParts[pathParts.length - 1];

    try {
      // Try to delete the image from ImageKit
      await imagekit.deleteFile(fileId);
    } catch (deleteError) {
      console.error('Failed to delete image from ImageKit:', deleteError);
      // Continue with database deletion even if ImageKit deletion fails
    }

    // Delete the image from the database
    await db.delete(personImage).where(eq(personImage.id, parseInt(imageId)));

    return NextResponse.json({ 
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
    console.error('Delete error:', errorMessage);
    return NextResponse.json({ error: errorMessage || 'Failed to delete image' }, { status: 500 });
  }
}