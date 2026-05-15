const fs = require('fs');
const path = require('path');

// Module list from your PDFs (Level 1 and Level 2)
const modules = [
  { id: 1, name: "COSHH Awareness", level: 1 },
  { id: 2, name: "Dementia Awareness", level: 1 },
  { id: 3, name: "Effective Communication", level: 1 },
  { id: 4, name: "End of Life Care", level: 1 },
  { id: 5, name: "Epilepsy Awareness", level: 2 },
  { id: 6, name: "Equality & Diversity", level: 1 },
  { id: 7, name: "Fire Safety", level: 1 },
  { id: 8, name: "First Aid Basic Life Support", level: 1 },
  { id: 9, name: "Food Hygiene", level: 1 },
  { id: 10, name: "Food Hygiene", level: 2 },
  { id: 11, name: "Health & Safety", level: 1 },
  { id: 12, name: "Infection Control", level: 2 },
  { id: 13, name: "Medication Awareness", level: 1 },
  { id: 14, name: "Medication Awareness", level: 2 },
  { id: 15, name: "Mental Capacity Act & DOLS", level: 1 },
  { id: 16, name: "Nutrition & Fluids", level: 1 },
  { id: 17, name: "People Movers Moving & Handling", level: 1 },
  { id: 18, name: "Person Centred Care", level: 1 },
  { id: 19, name: "Personal & Pressure Care", level: 1 },
  { id: 20, name: "Safeguarding Adults at Risk", level: 1 },
  { id: 21, name: "Safeguarding Adults at Risk", level: 2 },
  { id: 22, name: "Safeguarding Children", level: 1 },
  { id: 23, name: "Understanding your Role & Duty of Care", level: 1 }
];

// Questions extracted from PDFs (I'll populate this based on your content)
const questionsData = {};

// For now, create template structure
modules.forEach(module => {
  questionsData[module.id] = {
    name: `${module.name} (Level ${module.level})`,
    passMark: 15,
    questions: []
  };
});

// Save the structure
fs.writeFileSync('modules-template.json', JSON.stringify(questionsData, null, 2));
console.log('✅ Created modules-template.json');

// Also create a seed script for the database
const seedScript = `-- Seed script for CareWorks Assessment Database

-- Insert Modules
INSERT INTO "Module" (id, name, passMark, questions) VALUES
${modules.map(m => `(${m.id}, '${m.name} (Level ${m.level})', 15, '[]'::json)`).join(',\n')};

-- Create admin user (password: Admin123!)
INSERT INTO "User" (id, email, name, role) VALUES 
('admin_001', 'admin@careworks.com', 'System Admin', 'admin');

-- Create sample trainee
INSERT INTO "User" (id, email, name, role, "assignedType") VALUES 
('trainee_001', 'trainee@example.com', 'Sample Trainee', 'trainee', 'full_22');
`;

fs.writeFileSync('seed-database.sql', seedScript);
console.log('✅ Created seed-database.sql');

console.log('\n📋 Next steps:');
console.log('1. Copy your PDF question text into a JSON format');
console.log('2. Run: npx prisma db seed');
