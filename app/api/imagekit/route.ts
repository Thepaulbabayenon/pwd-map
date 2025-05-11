// app/api/imagekit/route.js
import { NextResponse } from 'next/server';
import { getImageKitAuthParams } from '@/lib/imageKit';

export async function GET() {
  try {
    const authParams = await getImageKitAuthParams();
    return NextResponse.json(authParams);
  } catch (error) {
    console.error('Error generating ImageKit auth params:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth parameters' },
      { status: 500 }
    );
  }
}