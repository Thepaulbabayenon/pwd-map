CREATE TYPE "public"."media_types" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."oauth_providers" AS ENUM('discord', 'github', 'google');--> statement-breakpoint
CREATE TYPE "public"."user_roles" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "person" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_number" varchar(50),
	"doi" varchar,
	"name" varchar(255),
	"first_name" varchar(100),
	"middle_name" varchar(100),
	"last_name" varchar(100),
	"address" varchar(255),
	"latitude" double precision,
	"longitude" double precision,
	"dob" varchar,
	"age" varchar,
	"gender" varchar(20),
	"disability_type" varchar(100),
	"specific_disability" varchar(150),
	"id_status" varchar(50),
	"employment" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "person_id_number_unique" UNIQUE("id_number")
);
--> statement-breakpoint
CREATE TABLE "person_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" integer NOT NULL,
	"media_url" varchar(255) NOT NULL,
	"media_type" "media_types" DEFAULT 'image' NOT NULL,
	"description" text,
	"file_id" varchar(255),
	"file_name" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reset_tokens" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_token" text NOT NULL,
	"user_id" integer NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"username" text,
	"salt" text,
	"role" "user_roles" DEFAULT 'user' NOT NULL,
	"email_verified" timestamp with time zone,
	"image" text,
	"two_factor_secret" text,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_backup_codes" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "person_media" ADD CONSTRAINT "person_media_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;