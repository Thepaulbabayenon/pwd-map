// File: src/app/api/children/[id]/route.ts
import { NextResponse } from 'next/server';
import {db} from '@/app/db/db';
import { person } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const child = await db.select().from(person).where(eq(person.id, id));
    
    if (child.length === 0) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }
    
    return NextResponse.json(child[0]);
  } catch (error) {
    console.error('Error fetching child:', error);
    return NextResponse.json({ error: 'Failed to fetch child' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    const updatedChild = await db
      .update(person)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(person.id, id))
      .returning();
    
    if (updatedChild.length === 0) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedChild[0]);
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json({ error: 'Failed to update child' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const deletedChild = await db
      .delete(person)
      .where(eq(person.id, id))
      .returning();
    
    if (deletedChild.length === 0) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Child deleted successfully' });
  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json({ error: 'Failed to delete child' }, { status: 500 });
  }
}