// Updated schema.ts to include video support
import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
  doublePrecision,
  serial,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';



// Define the "person" table with integer primary key
export const person = pgTable('person', {
  id: serial('id').primaryKey(),
  idNumber: varchar('id_number', { length: 50 }).unique(),
  doi: varchar('doi'),

  name: varchar('name', { length: 255 }),
  firstName: varchar('first_name', { length: 100 }),
  middleName: varchar('middle_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),

  address: varchar('address', { length: 255 }),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  dob: varchar('dob'),
  age: varchar('age'),
  gender: varchar('gender', { length: 20 }),

  disabilityType: varchar('disability_type', { length: 100 }),
  specificDisability: varchar('specific_disability', { length: 150 }),
  idStatus: varchar('id_status', { length: 50 }),
  employment: varchar('employment', { length: 100 }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define media types enum
export const mediaTypes = ["image", "video"] as const;
export type MediaType = (typeof mediaTypes)[number];
export const mediaTypeEnum = pgEnum("media_types", mediaTypes);

// Replace the personImage table with a more generic personMedia table
export const personMedia = pgTable('person_media', {
  id: serial('id').primaryKey(),
  personId: integer('person_id')
    .notNull()
    .references(() => person.id, { onDelete: 'cascade' }),
  mediaUrl: varchar('media_url', { length: 255 }).notNull(),
  mediaType: mediaTypeEnum('media_type').notNull().default('image'),
  description: text('description'),
  fileId: varchar('file_id', { length: 255 }), // ImageKit file ID
  fileName: varchar('file_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Keep the personImage table for backward compatibility
export const personImage = personMedia;

// Define relations between "person" and "person_media"
export const personRelations = relations(person, ({ many }) => ({
  media: many(personMedia),
}));

export const personMediaRelations = relations(personMedia, ({ one }) => ({
  person: one(person, {
    fields: [personMedia.personId],
    references: [person.id],
  }),
}));
