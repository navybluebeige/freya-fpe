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
      const pool = new Pool({ connectionString: envVars.DATABASE_URL })
      return new PrismaPg(pool)
    },
  },
})
