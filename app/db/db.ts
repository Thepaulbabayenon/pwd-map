import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";


const sql = neon(process.env.DATABASE_URL! || "postgresql://neondb_owner:npg_OXiy3hD1sTBm@ep-solitary-frost-a1z8j20i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require", {
  fetchOptions: {
    keepAlive: true,  
    idleTimeoutMillis: 10000, 
    connectionTimeoutMillis: 10000, 
  }
});

export const db = drizzle(sql, { schema });