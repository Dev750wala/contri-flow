import { PrismaClient } from '@prisma/client';

// Configure Prisma with increased connection pool to handle concurrent workers
// Workers: commentParserQueue (5), ownerEmailQueue (3), claimRewardQueue (5) = 13 potential concurrent operations
// Plus API routes and other operations, so we need at least 15-20 connections

// Helper function to ensure DATABASE_URL has connection pool parameters
const getDatabaseUrlWithPool = (): string => {
  const dbUrl = process.env.DATABASE_URL || '';

  // If URL already has query parameters, check if connection_limit exists
  if (dbUrl.includes('?')) {
    // If connection_limit is already set, return as-is
    if (dbUrl.includes('connection_limit=')) {
      return dbUrl;
    }
    // Add connection_limit to existing query params
    return `${dbUrl}&connection_limit=20&pool_timeout=20`;
  }

  // Add connection_limit as new query params
  return `${dbUrl}?connection_limit=20&pool_timeout=20`;
};

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrlWithPool(),
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export default prisma;
