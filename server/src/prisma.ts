import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// Dev DB path resolution
const dbFile = path.resolve(__dirname, '../../server/prisma/dev.db');
const fallbackDbFile = path.resolve(__dirname, '../prisma/dev.db');
const finalDbPath = fs.existsSync(fallbackDbFile) ? fallbackDbFile : dbFile;

console.log(`[RiskLens Prisma] SQLite DB Path: ${finalDbPath}`);

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${finalDbPath}`,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
