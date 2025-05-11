import { neonConfig, neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Enable fetch-based connection (if needed)
neonConfig.fetchConnectionCache = true;

// Get typed client matching drizzle's expectation
const sql = neon<boolean, boolean>(process.env.DATABASE_URL!);

const db = drizzle(sql, { schema });

export default db;
