import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool as any);
const prisma = new PrismaClient({ adapter } as any);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function main() {
  const industries = [
    'Sản xuất',
    'Bán lẻ - Hàng tiêu dùng - FMCG',
    'IT - Phần mềm',
    'Xây dựng',
    'Giáo dục/Đào tạo',
  ];

  for (const name of industries) {
    await prisma.industry.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  console.log(`✅ Seeded ${industries.length} industries`);

  const jobPositions = [
    'Nhân viên kinh doanh',
    'Kế toán',
    'Marketing',
    'Hành chính nhân sự',
    'Chăm sóc khách hàng',
    'Ngân hàng',
    'IT',
    'Lao động phổ thông',
    'Senior',
    'Kỹ sư xây dựng',
    'Thiết kế đồ họa',
    'Bất động sản',
    'Giáo dục',
    'Telesales',
  ];

  for (const name of jobPositions) {
    await prisma.jobPosition.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  console.log(`✅ Seeded ${jobPositions.length} job positions`);
  console.log('🎉 Seed completed successfully');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
