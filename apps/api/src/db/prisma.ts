import { PrismaClient } from '@prisma/client'

// One client for the whole process. Set PRISMA_LOG=query to see every query.
export const prisma = new PrismaClient({
  log: process.env.PRISMA_LOG === 'query' ? ['query', 'warn', 'error'] : ['warn', 'error'],
})
