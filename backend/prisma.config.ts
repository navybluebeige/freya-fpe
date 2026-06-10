import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrate: {
    async adapter(envVars) {
      const raw = envVars.DATABASE_URL;
      const url = new URL(raw);
      url.searchParams.delete('sslmode');
      const pool = new Pool({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } });
      return new PrismaPg(pool)
    },
  },
})
