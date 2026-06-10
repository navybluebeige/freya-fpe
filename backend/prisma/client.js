require('dotenv').config();
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const isProd = process.env.NODE_ENV === 'production';

function buildPoolConfig() {
  const raw = process.env.DATABASE_URL;
  if (!isProd) return { connectionString: raw };
  // pg-connection-string treats sslmode=require as verify-full (rejects self-signed certs).
  // Strip it from the URL and supply ssl options directly so we control the behavior.
  const url = new URL(raw);
  url.searchParams.delete('sslmode');
  return { connectionString: url.toString(), ssl: { rejectUnauthorized: false } };
}

const pool    = new Pool(buildPoolConfig());
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: isProd ? ['error'] : ['error', 'warn'],
});

module.exports = prisma;
