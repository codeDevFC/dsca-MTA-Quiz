import React, { useState, useEffect } from 'react';
import { 
  Lock, CheckCircle, PlayCircle, LogOut, Award, BookOpen, 
  FileText, TrendingUp, Users, Mail, Key, Zap, Shield, 
  GraduationCap, UserPlus, Eye, EyeOff, Copy, Check,
  Trash2, Plus, Printer, AlertCircle, User, Building, Calendar,
  Save, Edit2, Home, BarChart3, Clock, Target, Star
} from 'lucide-react';

const API_URL = 'http://localhost:3002';

function App() {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loginType, setLoginType] = useState('admin');
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // App state
  const [modules, setModules] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [userProgress, setUserProgress] = useState({ progress: [], attempts: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [startTime, setStartTime] = useState(null);
  
  // Learner profile state
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [learnerProfile, setLearnerProfile] = useState({
    fullName: '',
    organisation: '',
    courseDate: '',
    jobRole: '',
    phoneNumber: '',
    address: ''
  });
  
  // Batch code generator state
  const [studentBatch, setStudentBatch] = useState([{ surname: '', firstName: '' }]);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [showCodes, setShowCodes] = useState(false);
  const [selectedUserReport, setSelectedUserReport] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Load learner profile from localStorage
  useEffect(() => {
    if (user && user.role === 'TRAINEE') {
      const savedProfile = localStorage.getItem(`learner_profile_${user.id}`);
      if (savedProfile) {
        setLearnerProfile(JSON.parse(savedProfile));
        setShowProfileForm(false);
      } else {
        setShowProfileForm(true);
      }
    }
  }, [user]);

  // Save learner profile
  const saveLearnerProfile = () => {
    if (!learnerProfile.fullName || !learnerProfile.organisation) {
      setError('Please fill in your full name and organisation');
      return;
    }
    localStorage.setItem(`learner_profile_${user.id}`, JSON.stringify(learnerProfile));
    setShowProfileForm(false);
    setSuccess('Profile saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data);
        fetchModules();
        fetchAllStudents();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Trainee login with code
  const handleTraineeLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data);
        fetchModules();
        fetchUserProgress(data.id);
      } else {
        setError(data.error || 'Invalid or expired code');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Batch generate codes
  const batchGenerateCodes = async () => {
    const validStudents = studentBatch.filter(s => s.surname.trim() && s.firstName.trim());
    
    if (validStudents.length === 0) {
      setError('Please add at least one student');
      return;
    }
    
    if (validStudents.length > 20) {
      setError('Maximum 20 students per batch');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/admin/batch-generate-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: validStudents })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setGeneratedCodes(data.codes);
        setShowCodes(true);
        setSuccess(`Successfully generated ${data.count} login codes!`);
        fetchAllStudents();
        setStudentBatch([{ surname: '', firstName: '' }]);
      } else {
        setError(data.error || 'Failed to generate codes');
      }
    } catch (err) {
      setError('Failed to generate codes');
    } finally {
      setLoading(false);
    }
  };

  const addStudentField = () => {
    if (studentBatch.length < 20) {
      setStudentBatch([...studentBatch, { surname: '', firstName: '' }]);
    }
  };

  const removeStudentField = (index) => {
    const newBatch = studentBatch.filter((_, i) => i !== index);
    setStudentBatch(newBatch.length ? newBatch : [{ surname: '', firstName: '' }]);
  };

  const updateStudent = (index, field, value) => {
    const newBatch = [...studentBatch];
    newBatch[index][field] = value;
    setStudentBatch(newBatch);
  };

  const copyAllCodes = () => {
    const codesText = generatedCodes.map(c => `${c.name}: ${c.code}`).join('\n');
    navigator.clipboard.writeText(codesText);
    setSuccess('All codes copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const printCodes = () => {
    const printContent = generatedCodes.map((c, idx) => {
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${c.name}</td>
          <td>${c.email}</td>
          <td style="font-family: monospace; font-size: 18px; letter-spacing: 2px;">${c.code}</td>
        </tr>
      `;
    }).join('');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Student Login Codes - DSCA Training</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4F46E5; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #4F46E5; color: white; }
            .header { text-align: center; margin-bottom: 30px; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DSCA Training - Student Login Credentials</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead><tr><th>#</th><th>Student Name</th><th>Email Address</th><th>Login Code</th></tr></thead>
            <tbody>${printContent}</tbody>
          </table>
          <div class="footer">
            <p>Login at: http://localhost:5173</p>
            <p>Instructions: Go to "Trainee" tab, enter email and 6-digit code</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`${API_URL}/api/modules`);
      const data = await response.json();
      setModules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch modules:', err);
      setModules([]);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/students`);
      const data = await response.json();
      setAllStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setAllStudents([]);
    }
  };

  const fetchUserProgress = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/user/${userId}/progress`);
      const data = await response.json();
      setUserProgress({
        progress: Array.isArray(data.progress) ? data.progress : [],
        attempts: Array.isArray(data.attempts) ? data.attempts : []
      });
    } catch (err) {
      console.error('Failed to fetch progress:', err);
      setUserProgress({ progress: [], attempts: [] });
    }
  };

  const fetchUserReport = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/user/${userId}/export`);
      const data = await response.json();
      setReportData(data);
      setSelectedUserReport(userId);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  const startModule = async (module) => {
    try {
      const response = await fetch(`${API_URL}/api/modules/${module.id}`);
      const data = await response.json();
      setSelectedModule(data);
      setAnswers({});
      setCurrentQuestion(0);
      setShowResults(false);
      setResult(null);
      setStartTime(Date.now());
    } catch (err) {
      console.error('Failed to load module:', err);
    }
  };

  const submitAssessment = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/modules/${selectedModule.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, answers, timeSpent })
      });
      
      const data = await response.json();
      setResult(data);
      setShowResults(true);
      
      if (user.role === 'TRAINEE') {
        fetchUserProgress(user.id);
      } else {
        fetchAllStudents();
      }
    } catch (err) {
      setError('Failed to submit assessment');
    } finally {
      setLoading(false);
    }
  };

  const getModuleStatus = (moduleId) => {
    if (user.role !== 'TRAINEE') return 'available';
    const progress = userProgress.progress.find(p => p.moduleId === moduleId);
    if (progress?.status === 'passed') return 'completed';
    if (moduleId === 1) return 'available';
    const prevModule = userProgress.progress.find(p => p.moduleId === moduleId - 1);
    if (prevModule?.status === 'passed') return 'available';
    return 'locked';
  };

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              DSCA Training
            </h1>
            <p className="text-gray-500 mt-2">Mandatory Training Assessment Platform</p>
          </div>
          
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setLoginType('admin'); setError(''); setCode(''); setEmail(''); setPassword(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${loginType === 'admin' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              Admin / Staff
            </button>
            <button
              onClick={() => { setLoginType('trainee'); setError(''); setCode(''); setEmail(''); setPassword(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${loginType === 'trainee' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              Trainee
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}
          
          {loginType === 'admin' ? (
            <form onSubmit={handleAdminLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@careworks.com"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login as Staff'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTraineeLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Smith.J@dsca.co.uk"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">6-Digit Code</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Enter the 6-digit code provided by your administrator</p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Login'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Assessment Screen
  if (selectedModule) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <button onClick={() => setSelectedModule(null)} className="text-gray-600 hover:text-gray-800">← Back</button>
            <div className="text-right">
              <p className="text-sm font-medium">{user.name || user.email}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{selectedModule.name}</h1>
            <p className="text-gray-500">Pass mark: {selectedModule.passMark}/20 (75%)</p>
          </div>
          
          {showResults ? (
            <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${result?.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                {result?.passed ? <CheckCircle className="w-12 h-12 text-green-600" /> : <Award className="w-12 h-12 text-red-600" />}
              </div>
              <h2 className="text-2xl font-bold mb-3">{result?.passed ? 'Congratulations!' : 'Not This Time'}</h2>
              <p className="text-gray-600 mb-4">Score: {result?.score}/{result?.total} ({Math.round((result?.score||0)/(result?.total||1)*100)}%)</p>
              <button onClick={() => setSelectedModule(null)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium">Return to Dashboard</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">⚠️ Copy/paste disabled. Screenshots monitored.</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
                <p className="text-gray-500">Questions will be loaded here</p>
              </div>
              <button onClick={submitAssessment} disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-xl font-medium disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Assessment'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (user.role !== 'TRAINEE') {
    const totalStudents = allStudents.length;
    const totalAttempts = allStudents.reduce((acc, s) => acc + (s.moduleAttempts?.length || 0), 0);
    const totalPassed = allStudents.reduce((acc, s) => acc + (s.moduleAttempts?.filter(a => a.passed).length || 0), 0);
    const passRate = totalAttempts > 0 ? Math.round(totalPassed / totalAttempts * 100) : 0;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl"><Shield className="w-6 h-6 text-white" /></div>
              <div><h1 className="text-xl font-bold">DSCA Training Admin</h1><p className="text-xs text-gray-500">{user.role}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">{user.name || user.email}</span>
              <button onClick={() => setUser(null)} className="flex items-center gap-2 text-red-600">Logout</button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <button onClick={() => { setActiveTab('dashboard'); setShowCodes(false); }} className={`px-4 py-2 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Dashboard</button>
            <button onClick={() => { setActiveTab('generate'); setShowCodes(false); }} className={`px-4 py-2 ${activeTab === 'generate' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Generate Codes</button>
            <button onClick={() => { setActiveTab('students'); setShowCodes(false); }} className={`px-4 py-2 ${activeTab === 'students' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>All Students</button>
          </div>
          
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">{success}</div>}
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6"><div className="flex justify-between mb-3"><div className="bg-blue-100 p-3 rounded-xl"><Users className="w-6 h-6 text-blue-600" /></div><span className="text-2xl font-bold">{totalStudents}</span></div><p>Total Students</p></div>
              <div className="bg-white rounded-xl shadow-sm border p-6"><div className="flex justify-between mb-3"><div className="bg-green-100 p-3 rounded-xl"><CheckCircle className="w-6 h-6 text-green-600" /></div><span className="text-2xl font-bold">{totalAttempts}</span></div><p>Total Attempts</p></div>
              <div className="bg-white rounded-xl shadow-sm border p-6"><div className="flex justify-between mb-3"><div className="bg-yellow-100 p-3 rounded-xl"><TrendingUp className="w-6 h-6 text-yellow-600" /></div><span className="text-2xl font-bold">{passRate}%</span></div><p>Pass Rate</p></div>
              <div className="bg-white rounded-xl shadow-sm border p-6"><div className="flex justify-between mb-3"><div className="bg-purple-100 p-3 rounded-xl"><BookOpen className="w-6 h-6 text-purple-600" /></div><span className="text-2xl font-bold">{modules.length}</span></div><p>Modules</p></div>
            </div>
          )}
          
          {/* Generate Codes Tab */}
          {activeTab === 'generate' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4">Batch Generate Login Codes</h2>
              <p className="text-sm text-gray-500 mb-4">
                Email format: <strong>Surname.Initial@dsca.co.uk</strong><br />
                Example: John Smith → Smith.J@dsca.co.uk
              </p>
              
              <div className="space-y-3 mb-4">
                {studentBatch.map((student, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Surname"
                      value={student.surname}
                      onChange={(e) => updateStudent(idx, 'surname', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="First Name"
                      value={student.firstName}
                      onChange={(e) => updateStudent(idx, 'firstName', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    {studentBatch.length > 1 && (
                      <button onClick={() => removeStudentField(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 mb-6">
                <button onClick={addStudentField} disabled={studentBatch.length >= 20} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  <Plus size={16} /> Add Student ({studentBatch.length}/20)
                </button>
                <button onClick={batchGenerateCodes} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Zap size={16} /> {loading ? 'Generating...' : 'Generate Codes'}
                </button>
              </div>
              
              {showCodes && generatedCodes.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Generated Login Credentials</h3>
                    <div className="flex gap-2">
                      <button onClick={copyAllCodes} className="flex items-center gap-2 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"><Copy size={14} /> Copy All</button>
                      <button onClick={printCodes} className="flex items-center gap-2 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"><Printer size={14} /> Print</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead><tr className="bg-gray-50"><th className="p-3 text-left">#</th><th className="p-3 text-left">Student Name</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Code</th><th className="p-3 text-left">Action</th></tr></thead>
                      <tbody>
                        {generatedCodes.map((student, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-3">{idx + 1}</td>
                            <td className="p-3 font-medium">{student.name}</td>
                            <td className="p-3 text-gray-600">{student.email}</td>
                            <td className="p-3"><code className="bg-gray-100 px-2 py-1 rounded font-mono text-lg">{student.code}</code></td>
                            <td className="p-3"><button onClick={() => navigator.clipboard.writeText(student.code)} className="text-blue-600"><Copy size={16} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr><th className="text-left p-4">Name</th><th className="text-left p-4">Email</th><th className="text-left p-4">Attempts</th><th className="text-left p-4">Passed</th><th className="text-left p-4">Actions</th></tr>
                </thead>
                <tbody>
                  {allStudents.map(student => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{student.name || '-'}</td>
                      <td className="p-4 text-sm">{student.email}</td>
                      <td className="p-4">{student.moduleAttempts?.length || 0}</td>
                      <td className="p-4">{student.moduleAttempts?.filter(a => a.passed).length || 0}</td>
                      <td className="p-4">
                        <button onClick={() => fetchUserReport(student.id)} className="text-blue-600 text-sm hover:underline">View Report</button>
                      </td>
                    </tr>
                  ))}
                  {allStudents.length === 0 && <tr><td colSpan="5" className="text-center p-8 text-gray-500">No students yet. Generate codes above!</td></tr>}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Report Modal */}
          {reportData && selectedUserReport && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setReportData(null); setSelectedUserReport(null); }}>
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h3 className="text-xl font-bold">Student Report</h3>
                  <button onClick={() => { setReportData(null); setSelectedUserReport(null); }} className="text-gray-500">✕</button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium">{reportData.user?.name}</p>
                    <p className="text-sm text-gray-600">{reportData.user?.email}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center"><p className="text-2xl font-bold">{reportData.totalAttempts || 0}</p><p className="text-xs text-gray-500">Attempts</p></div>
                    <div className="text-center"><p className="text-2xl font-bold text-green-600">{reportData.passedModules || 0}</p><p className="text-xs text-gray-500">Passed</p></div>
                    <div className="text-center"><p className="text-2xl font-bold text-red-600">{reportData.failedModules || 0}</p><p className="text-xs text-gray-500">Failed</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Trainee Dashboard with Profile Form
  const stats = { 
    total: modules.length, 
    completed: userProgress.progress.filter(p => p.status === 'passed').length, 
    inProgress: userProgress.progress.filter(p => p.status === 'failed').length, 
    locked: modules.length - userProgress.progress.length 
  };
  
  // Show profile form if needed
  if (showProfileForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Complete Your Profile</h2>
            <p className="text-gray-500 mt-1">Please fill in your details to continue</p>
          </div>
          
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={learnerProfile.fullName}
                  onChange={(e) => setLearnerProfile({...learnerProfile, fullName: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisation *</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={learnerProfile.organisation}
                  onChange={(e) => setLearnerProfile({...learnerProfile, organisation: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your organisation name"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={learnerProfile.courseDate}
                  onChange={(e) => setLearnerProfile({...learnerProfile, courseDate: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={learnerProfile.jobRole}
                  onChange={(e) => setLearnerProfile({...learnerProfile, jobRole: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Care Assistant, Support Worker"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={learnerProfile.phoneNumber}
                  onChange={(e) => setLearnerProfile({...learnerProfile, phoneNumber: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contact number"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={saveLearnerProfile}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition"
          >
            Save & Continue
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">DSCA Training</h1>
                <p className="text-xs text-gray-500">Trainee Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowProfileForm(true)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
              <button onClick={() => setUser(null)} className="flex items-center gap-2 text-red-600">Logout</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Banner with Profile Info */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome, {learnerProfile.fullName || user.name || 'Trainee'}!</h2>
              <p className="text-blue-100">{learnerProfile.organisation || 'Complete your profile'}</p>
              {learnerProfile.jobRole && <p className="text-blue-100 text-sm mt-1">{learnerProfile.jobRole}</p>}
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Star className="w-8 h-8" />
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between mb-3">
              <div className="bg-blue-100 p-3 rounded-xl"><BookOpen className="w-6 h-6 text-blue-600" /></div>
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-gray-600">Total Modules</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between mb-3">
              <div className="bg-green-100 p-3 rounded-xl"><CheckCircle className="w-6 h-6 text-green-600" /></div>
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
            <p className="text-gray-600">Completed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between mb-3">
              <div className="bg-yellow-100 p-3 rounded-xl"><PlayCircle className="w-6 h-6 text-yellow-600" /></div>
              <span className="text-2xl font-bold">{stats.inProgress}</span>
            </div>
            <p className="text-gray-600">In Progress</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between mb-3">
              <div className="bg-gray-100 p-3 rounded-xl"><Lock className="w-6 h-6 text-gray-600" /></div>
              <span className="text-2xl font-bold">{stats.locked}</span>
            </div>
            <p className="text-gray-600">Locked</p>
          </div>
        </div>
        
        {/* Modules Grid */}
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          Training Modules
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(module => {
            const status = getModuleStatus(module.id);
            return (
              <div key={module.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Module {module.id}</span>
                    <h3 className="font-semibold text-gray-800 mt-2">{module.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Pass mark: {module.passMark}/20</p>
                  </div>
                  {status === 'completed' && <CheckCircle className="text-green-500" />}
                  {status === 'available' && <PlayCircle className="text-blue-500" />}
                  {status === 'locked' && <Lock className="text-gray-400" />}
                </div>
                {status === 'available' && (
                  <button onClick={() => startModule(module)} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                    Start Module
                  </button>
                )}
                {status === 'locked' && (
                  <button disabled className="w-full mt-4 bg-gray-100 text-gray-400 py-2 rounded-lg cursor-not-allowed">
                    Complete Previous Module
                  </button>
                )}
                {status === 'completed' && (
                  <div className="w-full mt-4 bg-green-50 text-green-600 py-2 rounded-lg text-center flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
