import path from 'node:path'
import type { PrismaConfig } from 'prisma'

export default {
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    adapter: async () => {
      const { PrismaNeon } = await import('@prisma/adapter-neon')
      const { Pool } = await import('@neondatabase/serverless')
      const pool = new Pool({ connectionString: process.env.DATABASE_URL })
      return new PrismaNeon(pool)
    }
  }
} satisfies PrismaConfig