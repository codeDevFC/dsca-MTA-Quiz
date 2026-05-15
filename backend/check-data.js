import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  const modules = await prisma.module.findMany();
  
  console.log(`\n📊 Database Summary:`);
  console.log(`👥 Users: ${users.length}`);
  users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
  
  console.log(`\n📚 Modules: ${modules.length}`);
  modules.slice(0, 5).forEach(m => console.log(`   - Module ${m.id}: ${m.name}`));
  console.log(`   ... and ${modules.length - 5} more modules`);
  
  process.exit(0);
}

check();
