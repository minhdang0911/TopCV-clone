import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });
const models = Object.getOwnPropertyNames(p).filter(k => !k.startsWith('_') && !k.startsWith('$'));
console.log('Models:', models.join(', '));
await p.$disconnect();
