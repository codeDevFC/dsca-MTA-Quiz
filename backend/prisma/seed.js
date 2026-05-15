import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
  { email: 'admin@careworks.com', name: 'System Administrator', role: 'ADMIN', trainingRoute: 'FULL_22' },
  { email: 'director@careworks.com', name: 'Derick Bamiebu', role: 'DIRECTOR', trainingRoute: 'FULL_22' },
  { email: 'supervisor@careworks.com', name: 'Training Supervisor', role: 'SUPERVISOR', trainingRoute: 'FULL_22' }
];

const moduleNames = [
  "COSHH Awareness", "Dementia Awareness", "Effective Communication",
  "End of Life Care", "Epilepsy Awareness", "Equality & Diversity",
  "Fire Safety", "First Aid Basic Life Support", "Food Hygiene Level 1",
  "Food Hygiene Level 2", "Health & Safety", "Infection Control",
  "Medication Awareness Level 1", "Medication Awareness Level 2",
  "Mental Capacity Act & DOLS", "Nutrition & Fluids",
  "People Movers Moving & Handling", "Person Centred Care",
  "Personal & Pressure Care", "Safeguarding Adults at Risk Level 1",
  "Safeguarding Adults at Risk Level 2", "Safeguarding Children",
  "Understanding Your Role & Duty of Care"
];

async function main() {
  console.log('🌱 Seeding database...\n');

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });
    console.log(`✅ Created user: ${user.name} (${user.role})`);
  }

  for (let i = 0; i < moduleNames.length; i++) {
    const id = i + 1;
    await prisma.module.upsert({
      where: { id: id },
      update: {},
      create: {
        id: id,
        name: `${moduleNames[i]} (Level ${id <= 10 ? '1' : '2'})`,
        passMark: 15,
        questions: []
      }
    });
    console.log(`✅ Created module ${id}: ${moduleNames[i]}`);
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`\n🔐 Admin Login (Fixed Passwords):`);
  console.log(`   Admin: admin@careworks.com / Admin@2025`);
  console.log(`   Director: director@careworks.com / Director@2025`);
  console.log(`   Supervisor: supervisor@careworks.com / Supervisor@2025`);
  console.log(`\n📧 Trainees: Use email + magic code login`);
}

main()
  .catch(e => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
