// app/api/imagekit/route.ts
import { NextResponse } from 'next/server';
import { getImageKitAuthParams } from '@/lib/imageKit';

export async function GET() {
  try {
    console.log('ImageKit auth endpoint called');
    const authParams = await getImageKitAuthParams();
    console.log('Auth parameters generated:', authParams);
    
    // Important: Some ImageKit responses might be formatted differently than expected
    // Make sure the response matches what the client expects
    return NextResponse.json(authParams);
  } catch (error) {
    console.error('Error generating ImageKit auth params:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth parameters' },
      { status: 500 }
    );
  }
}