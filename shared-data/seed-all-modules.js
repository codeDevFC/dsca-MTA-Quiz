const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with modules...');
  
  // Module data from your PDFs (I'll populate these based on your content)
  const modules = [
    {
      id: 1,
      name: "COSHH Awareness (Level 1)",
      passMark: 15,
      questions: [
        { text: "The main H&S legislation is the Health & Safety at Work (etc.) Act 1974.", correct: true },
        { text: "Great care needs to be taken when handling hazardous substances.", correct: true },
        { text: "You do not need to know details about chemicals you handle.", correct: false },
        { text: "There are many ways chemicals and substances can enter the body.", correct: true },
        { text: "Control of Substances Hazardous to Health covers many products.", correct: true },
        { text: "Bleach is not a hazardous substance.", correct: false },
        { text: "You can get contaminated through dust in the air.", correct: true },
        { text: "Blood is not considered a hazardous substance.", correct: false },
        { text: "You need to read the data sheets before using chemicals.", correct: true },
        { text: "Everyday products are always safe to use.", correct: false },
        { text: "Employers do not have to provide training about COSHH.", correct: false },
        { text: "Employees do have to wear protective equipment provided.", correct: true },
        { text: "Even some plants and bulbs are considered as hazardous.", correct: true },
        { text: "A needle stick injury can cause infection.", correct: true },
        { text: "You should report all spills of chemicals, no matter how small.", correct: true },
        { text: "Employers face fines if they do not comply with COSHH Regulations.", correct: true },
        { text: "All COSHH hazards can be seen.", correct: false },
        { text: "Personal Protective Equipment must be worn where required.", correct: true },
        { text: "Home chemicals are always safe to use.", correct: false },
        { text: "I have a duty of care to myself and others with regard to COSHH.", correct: true }
      ]
    },
    {
      id: 2,
      name: "Dementia Awareness (Level 1)",
      passMark: 15,
      questions: [
        { text: "Dementia affects people from all walks of life.", correct: true },
        { text: "A person with dementia may display a variety of symptoms.", correct: true },
        { text: "If a person with dementia shouts at you, then you should shout back.", correct: false },
        { text: "We should support the relationships of a person with dementia.", correct: true },
        { text: "A person with dementia has a life history that is important.", correct: true },
        { text: "There is no need for service user's information to be kept confidential.", correct: false },
        { text: "It is acceptable to patronise people with dementia.", correct: false },
        { text: "A person with dementia may be repetitive in actions and speech.", correct: true },
        { text: "You should take insults from a person with dementia personally.", correct: false },
        { text: "Dementia is not an inevitable consequence of getting older.", correct: true }
      ]
    }
    // Continue with all modules...
  ];
  
  for (const module of modules) {
    // Format questions for JSON storage
    const formattedQuestions = module.questions.map((q, idx) => ({
      id: `mod${module.id}_q${idx + 1}`,
      text: q.text,
      options: ["True", "False"],
      correct: q.correct ? 0 : 1
    }));
    
    await prisma.module.upsert({
      where: { id: module.id },
      update: {
        name: module.name,
        passMark: module.passMark,
        questions: formattedQuestions
      },
      create: {
        id: module.id,
        name: module.name,
        passMark: module.passMark,
        questions: formattedQuestions
      }
    });
    
    console.log(`✅ Imported module ${module.id}: ${module.name}`);
  }
  
  console.log('🎉 Database seeding complete!');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
