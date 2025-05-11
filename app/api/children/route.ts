// File: src/app/api/children/route.ts
import { NextResponse } from 'next/server';
import db from '@/app/db/db';
import { person } from '@/app/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const childrenData = await db.select().from(person).orderBy(desc(person.createdAt));
    return NextResponse.json(childrenData);
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ error: 'Failed to fetch children' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newChild = await db.insert(person).values(data).returning();
    return NextResponse.json(newChild[0]);
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json({ error: 'Failed to create child' }, { status: 500 });
  }
}
