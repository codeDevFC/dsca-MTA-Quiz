const fs = require('fs');

// This is where you will paste questions from each PDF
// Format example:
const sampleModule = {
  id: 1,
  name: "COSHH Awareness (Level 1)",
  passMark: 15,
  questions: [
    {
      id: "q1",
      text: "The main H&S legislation is the Health & Safety at Work (etc.) Act 1974.",
      options: ["True", "False"],
      correct: 0  // 0 = True, 1 = False
    },
    {
      id: "q2",
      text: "Great care needs to be taken when handling hazardous substances.",
      options: ["True", "False"],
      correct: 0
    },
    {
      id: "q3",
      text: "You do not need to know details about chemicals you handle.",
      options: ["True", "False"],
      correct: 1
    }
    // ... continue to 20 questions
  ]
};

// Function to convert to database format
function convertToDBFormat(moduleData) {
  return {
    id: moduleData.id,
    name: moduleData.name,
    passMark: moduleData.passMark,
    questions: moduleData.questions
  };
}

// Save to JSON
function saveModule(moduleData) {
  const filename = `module-${moduleData.id}.json`;
  fs.writeFileSync(filename, JSON.stringify(convertToDBFormat(moduleData), null, 2));
  console.log(`✅ Saved ${filename}`);
}

// Instructions
console.log(`
╔════════════════════════════════════════════════════════════╗
║  MANUAL QUESTION IMPORT GUIDE                              ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  For each module, create a file with this structure:      ║
║                                                            ║
║  {                                                         ║
║    "id": 1,                                                ║
║    "name": "Module Name (Level X)",                        ║
║    "passMark": 15,                                         ║
║    "questions": [                                          ║
║      {                                                     ║
║        "id": "mod1_q1",                                    ║
║        "text": "Question text here",                       ║
║        "options": ["True", "False"],                       ║
║        "correct": 0   // 0=True, 1=False                   ║
║      }                                                     ║
║    ]                                                       ║
║  }                                                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

// Export for use
module.exports = { saveModule, convertToDBFormat };
