import { NextRequest, NextResponse } from 'next/server';
import { db }from "@/app/db/db";
import { person, personImage } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  // Get the ID number from query parameters
  const url = new URL(req.url);
  const idNumber = url.searchParams.get('idNumber');

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

    // Fetch all images for this person
    const images = await db.select().from(personImage).where(eq(personImage.personId, personRecord.id));

    return NextResponse.json({ 
      success: true,
      personId: personRecord.id,
      idNumber: personRecord.idNumber,
      name: personRecord.name,
      imageCount: images.length,
      images: images.map(img => ({
        id: img.id,
        url: img.imageUrl,
        description: img.description,
        createdAt: img.createdAt
      }))
    });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
    console.error('Fetch error:', errorMessage);
    return NextResponse.json({ error: errorMessage || 'Failed to fetch images' }, { status: 500 });
  }
}