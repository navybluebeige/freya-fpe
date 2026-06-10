require('dotenv').config();
const { Pool }         = require('pg');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const isProd = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : false,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: isProd ? ['error'] : ['error', 'warn'],
});

module.exports = prisma;
