'use server'

import { revalidatePath } from 'next/cache';
import db from "@/app/db/db";
import { person, personImage } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function deletePerson(id: number) {
  try {
    // First delete related records in personImage
    await db.delete(personImage)
      .where(eq(personImage.personId, id))
      .execute();
    
    // Then delete the person record
    await db.delete(person)
      .where(eq(person.id, id))
      .execute();
    
    // Revalidate the persons list path to update the UI
    revalidatePath('/home/persons');
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete person:", error);
    return { success: false, error };
  }
}