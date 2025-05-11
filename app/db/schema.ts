import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
  doublePrecision, // For latitude and longitude
  serial,
  boolean,
  pgEnum, // For enumerations (like user roles)
  // foreignKey, // Not used directly in pgTable definitions
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Define user roles and OAuth providers
export const userRoles = ["admin", "user"] as const;
export type UserRole = (typeof userRoles)[number];
export const userRoleEnum = pgEnum("user_roles", userRoles);

export const oAuthProviders = ["discord", "github", "google"] as const;
export type OAuthProvider = (typeof oAuthProviders)[number];
export const oAuthProviderEnum = pgEnum("oauth_providers", oAuthProviders);

// Define the "users" table
export const users = pgTable("users", {
  id: serial("id").primaryKey(), // Using serial for auto-increment integer
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  username: text("username"),
  salt: text("salt"),
  role: userRoleEnum("role").notNull().default("user"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorBackupCodes: text("two_factor_backup_codes").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// Define the "sessions" table
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Define the "person" table with integer primary key
export const person = pgTable('person', {
  id: serial('id').primaryKey(), // Using serial for auto-increment integer
  idNumber: varchar('id_number', { length: 50 }).unique(),
  doi: varchar('doi'), // Date of Issue as a varchar (string)

  name: varchar('name', { length: 255 }),
  firstName: varchar('first_name', { length: 100 }),
  middleName: varchar('middle_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),

  address: varchar('address', { length: 255 }),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  dob: varchar('dob'), // Date of Birth as varchar
  age: varchar('age'),
  gender: varchar('gender', { length: 20 }),

  disabilityType: varchar('disability_type', { length: 100 }),
  specificDisability: varchar('specific_disability', { length: 150 }),
  idStatus: varchar('id_status', { length: 50 }),
  employment: varchar('employment', { length: 100 }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the "person_image" table with integer foreign key reference
export const personImage = pgTable('person_image', {
  id: serial('id').primaryKey(), // Auto-increment integer primary key
  personId: integer('person_id')
    .notNull()
    .references(() => person.id, { onDelete: 'cascade' }), // Foreign key reference using integer
  imageUrl: varchar('image_url', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relations between "person" and "person_image"
export const personRelations = relations(person, ({ many }) => ({
  images: many(personImage),
}));

export const personImageRelations = relations(personImage, ({ one }) => ({
  person: one(person, {
    fields: [personImage.personId],
    references: [person.id],
  }),
}));

// Define email schema for validation
const emailSchema = z.string().email("Invalid email format").regex(
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  "Invalid email address"
);

// Define sign-in and sign-up schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailSchema,
  username: z.string().min(1, "Username is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[@#$%^&*!]/, "Password must contain at least one special character (@#$%^&*!)"),
});

// Define reset token schema
export const resetTokens = pgTable("reset_tokens", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
