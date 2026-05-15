const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json());

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateEmail(surname, firstName) {
  const initial = firstName.charAt(0).toUpperCase();
  const formattedSurname = surname.charAt(0).toUpperCase() + surname.slice(1).toLowerCase();
  return `${formattedSurname}.${initial}@dsca.co.uk`;
}

// ============ ADMIN LOGIN ============
app.post('/api/auth/admin-login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (user.role === 'TRAINEE') return res.status(401).json({ error: 'Please use code login' });
    
    const validPasswords = {
      'admin@careworks.com': 'Admin@2025',
      'director@careworks.com': 'Director@2025',
      'supervisor@careworks.com': 'Supervisor@2025'
    };
    
    if (validPasswords[email] !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const { password: _, ...userWithoutSensitive } = user;
    res.json(userWithoutSensitive);
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============ BATCH CODE GENERATION ============
app.post('/api/admin/batch-generate-codes', async (req, res) => {
  const { students } = req.body;
  
  if (!students || students.length === 0) {
    return res.status(400).json({ error: 'No students provided' });
  }
  
  if (students.length > 20) {
    return res.status(400).json({ error: 'Maximum 20 students per batch' });
  }
  
  const results = [];
  
  for (const student of students) {
    try {
      const email = generateEmail(student.surname, student.firstName);
      const name = `${student.firstName} ${student.surname}`;
      
      let user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            role: 'TRAINEE',
            trainingRoute: 'FULL_22'
          }
        });
      }
      
      const code = generateCode();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      await prisma.loginCode.create({
        data: {
          email,
          code,
          expiresAt
        }
      });
      
      results.push({
        surname: student.surname,
        firstName: student.firstName,
        email,
        name,
        code,
        expiresAt
      });
      
      console.log(`✅ Generated code for ${email}: ${code}`);
    } catch (error) {
      results.push({
        surname: student.surname,
        firstName: student.firstName,
        error: error.message
      });
    }
  }
  
  res.json({ 
    success: true, 
    count: results.length,
    codes: results 
  });
});

// ============ GET ALL STUDENTS ============
app.get('/api/admin/students', async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'TRAINEE' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        moduleAttempts: {
          select: {
            id: true,
            score: true,
            passed: true,
            completedAt: true,
            module: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Ensure we always return an array
    res.json(students || []);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students', students: [] });
  }
});

// ============ TRAINEE CODE VERIFICATION ============
app.post('/api/auth/verify-code', async (req, res) => {
  const { email, code } = req.body;
  
  try {
    const loginCode = await prisma.loginCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!loginCode) {
      return res.status(401).json({ error: 'Invalid or expired code' });
    }
    
    await prisma.loginCode.update({
      where: { id: loginCode.id },
      data: { used: true }
    });
    
    const user = await prisma.user.findUnique({ where: { email } });
    res.json(user);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ============ GET ALL MODULES ============
app.get('/api/modules', async (req, res) => {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, name: true, passMark: true }
    });
    res.json(modules || []);
  } catch (error) {
    console.error('Modules error:', error);
    res.status(500).json({ error: 'Failed to fetch modules', modules: [] });
  }
});

// ============ GET USER PROGRESS ============
app.get('/api/user/:userId/progress', async (req, res) => {
  try {
    const progress = await prisma.moduleProgress.findMany({
      where: { userId: req.params.userId }
    });
    const attempts = await prisma.moduleAttempt.findMany({
      where: { userId: req.params.userId },
      orderBy: { completedAt: 'desc' },
      include: { module: true }
    });
    res.json({ progress: progress || [], attempts: attempts || [] });
  } catch (error) {
    console.error('Progress error:', error);
    res.json({ progress: [], attempts: [] });
  }
});

// ============ GET MODULE BY ID ============
app.get('/api/modules/:id', async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id);
    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) return res.status(404).json({ error: 'Module not found' });
    res.json(module);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// ============ SUBMIT ASSESSMENT ============
app.post('/api/modules/:id/submit', async (req, res) => {
  const { userId, answers, timeSpent } = req.body;
  const moduleId = parseInt(req.params.id);
  
  try {
    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) return res.status(404).json({ error: 'Module not found' });
    
    const questions = module.questions || [];
    let score = 0;
    const errors = [];
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (userAnswer === question.correct) {
        score++;
      } else {
        errors.push({
          questionIndex: index,
          questionText: question.text,
          userAnswer: userAnswer,
          correctAnswer: question.correct
        });
      }
    });
    
    const passed = score >= module.passMark;
    const existingAttempts = await prisma.moduleAttempt.count({ where: { userId, moduleId } });
    
    await prisma.moduleAttempt.create({
      data: {
        userId,
        moduleId,
        score,
        passed,
        answers,
        errors,
        timeSpent: timeSpent || 0,
        attemptNumber: existingAttempts + 1,
        completedAt: new Date()
      }
    });
    
    await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      update: {
        status: passed ? 'passed' : 'failed',
        score,
        attempts: { increment: 1 },
        passedAt: passed ? new Date() : undefined
      },
      create: {
        userId,
        moduleId,
        status: passed ? 'passed' : 'failed',
        score,
        attempts: 1,
        passedAt: passed ? new Date() : undefined
      }
    });
    
    await prisma.quizResult.create({
      data: { score, moduleId, userId, passed }
    });
    
    res.json({ 
      score, 
      passed, 
      total: questions.length || 20, 
      passMark: module.passMark,
      errors: errors.slice(0, 5),
      attemptNumber: existingAttempts + 1
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
});

// ============ EXPORT USER REPORT ============
app.get('/api/user/:userId/export', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      include: {
        moduleAttempts: {
          include: { module: true },
          orderBy: { completedAt: 'desc' }
        }
      }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const summary = {
      user: { name: user.name, email: user.email, role: user.role, joinedAt: user.createdAt },
      totalAttempts: user.moduleAttempts.length,
      passedModules: user.moduleAttempts.filter(a => a.passed).length,
      failedModules: user.moduleAttempts.filter(a => !a.passed).length,
      averageScore: user.moduleAttempts.reduce((acc, a) => acc + a.score, 0) / (user.moduleAttempts.length || 1),
      totalTimeSpent: user.moduleAttempts.reduce((acc, a) => acc + a.timeSpent, 0),
      attempts: user.moduleAttempts
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📧 Batch code generator ready - Email domain: @dsca.co.uk`);
});
