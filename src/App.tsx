import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  User
} from './firebase';
import { UserProfile, ResumeData, TailoredResume } from './types';
import { tailorResume } from './services/geminiService';
import { ResumePDF } from './components/ResumePDF';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { 
  Plus, 
  LogOut, 
  FileText, 
  Trash2, 
  Download, 
  Loader2, 
  ChevronRight, 
  LayoutDashboard, 
  Sparkles,
  History,
  User as UserIcon,
  Search,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  isLoading, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  isLoading?: boolean;
}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    outline: 'bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-50',
  };

  return (
    <button 
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none gap-2',
        variants[variant],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden', className)}>
    {children}
  </div>
);

const Input = ({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <input 
      className={cn(
        'w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400',
        error && 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500',
        props.className
      )}
      {...props}
    />
    {error && <p className="text-xs text-rose-500">{error}</p>}
  </div>
);

const TextArea = ({ label, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <textarea 
      className={cn(
        'w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 min-h-[120px]',
        error && 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500',
        props.className
      )}
      {...props}
    />
    {error && <p className="text-xs text-rose-500">{error}</p>}
  </div>
);

// --- Pages ---

const LoginPage = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ResumeTailor AI</h1>
            <p className="text-slate-500">Professional resume tailoring powered by Gemini AI. Get your dream job with high-impact, ATS-optimized resumes.</p>
          </div>
          <Button onClick={handleLogin} className="w-full py-3 text-lg" variant="primary">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" className="w-5 h-5 mr-2" alt="Google" />
            Sign in with Google
          </Button>
          <p className="text-xs text-slate-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmLabel = 'Confirm', variant = 'primary' }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; onConfirm?: () => void; confirmLabel?: string; variant?: 'primary' | 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
        <div className="p-6 bg-slate-50 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {onConfirm && (
            <Button 
              variant={variant === 'danger' ? 'outline' : 'primary'} 
              onClick={() => { onConfirm(); onClose(); }}
              className={variant === 'danger' ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : ''}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user, onNewResume, onSelectResume }: { user: User; onNewResume: () => void; onSelectResume: (resume: ResumeData) => void }) => {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'resumes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResumeData));
      setResumes(data);
      setIsLoading(false);
    }, (error) => {
      console.error('Firestore error:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'resumes', deleteId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Your Resumes</h1>
          <p className="text-sm text-slate-500">Manage and create tailored resumes for your job applications.</p>
        </div>
        <Button onClick={onNewResume} className="w-full sm:w-auto px-6">
          <Plus className="w-5 h-5" />
          New Resume
        </Button>
      </header>

      <Modal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        title="Delete Resume"
        onConfirm={handleDelete}
        confirmLabel="Delete"
        variant="danger"
      >
        <p className="text-slate-600">Are you sure you want to delete this resume? This action cannot be undone.</p>
      </Modal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <motion.div 
              key={resume.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              onClick={() => onSelectResume(resume)}
              className="cursor-pointer"
            >
              <Card className="p-6 h-full flex flex-col hover:border-indigo-200 transition-colors">
                <div className="flex-1 space-y-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{resume.title}</h3>
                    <p className="text-xs text-slate-400">Created on {new Date(resume.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      className="p-2 h-auto" 
                      onClick={(e) => { e.stopPropagation(); setDeleteId(resume.id!); }}
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </Button>
                  </div>
                  <div className="flex items-center text-indigo-600 text-sm font-medium">
                    View <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No resumes yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">Create your first tailored resume using our AI engine.</p>
          <Button onClick={onNewResume} className="mt-6" variant="outline">
            Get Started
          </Button>
        </div>
      )}
    </div>
  );
};

const TailorResumePage = ({ user, resume, onBack }: { user: User; resume?: ResumeData; onBack: () => void }) => {
  const [step, setStep] = useState<1 | 2>(resume ? 2 : 1);
  const [activeSection, setActiveSection] = useState<'personal' | 'experience' | 'education' | 'skills' | 'tailor'>('personal');
  
  const [title, setTitle] = useState(resume?.title || '');
  const [personalInfo, setPersonalInfo] = useState<TailoredResume['personalInfo']>(resume?.tailoredData.personalInfo || {
    fullName: user.displayName || '',
    email: user.email || '',
    phone: '',
    location: '',
    linkedin: '',
    website: ''
  });

  const [experience, setExperience] = useState<TailoredResume['experience']>(resume?.tailoredData.experience || [
    { company: '', position: '', duration: '', location: '', bulletPoints: [''] }
  ]);

  const [education, setEducation] = useState<TailoredResume['education']>(resume?.tailoredData.education || [
    { school: '', degree: '', duration: '', location: '' }
  ]);

  const [skills, setSkills] = useState<TailoredResume['skills']>(resume?.tailoredData.skills || {
    technical: [''],
    soft: ['']
  });

  const [projects, setProjects] = useState<TailoredResume['projects']>(resume?.tailoredData.projects || [
    { name: '', description: '', technologies: [''], link: '' }
  ]);

  const [jd, setJd] = useState(resume?.jobDescription || '');
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredData, setTailoredData] = useState<TailoredResume | null>(resume?.tailoredData || null);
  const [error, setError] = useState<string | null>(null);

  const handleTailor = async () => {
    if (!title || !jd) {
      setError('Application Title and Job Description are required for tailoring.');
      return;
    }

    setIsTailoring(true);
    setError(null);

    try {
      const data = await tailorResume(jd, personalInfo, experience, education, skills, projects);
      setTailoredData(data);
      setStep(2);
      
      // Save to Firestore
      if (!resume) {
        await addDoc(collection(db, 'resumes'), {
          userId: user.uid,
          title,
          jobDescription: jd,
          rawExperience: 'Structured input used',
          tailoredData: data,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Tailoring failed:', err);
      setError('Failed to tailor resume. Please try again.');
    } finally {
      setIsTailoring(false);
    }
  };

  const addExperience = () => setExperience([...experience, { company: '', position: '', duration: '', location: '', bulletPoints: [''] }]);
  const removeExperience = (index: number) => setExperience(experience.filter((_, i) => i !== index));
  
  const addEducation = () => setEducation([...education, { school: '', degree: '', duration: '', location: '' }]);
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));

  const addProject = () => setProjects([...(projects || []), { name: '', description: '', technologies: [''], link: '' }]);
  const removeProject = (index: number) => setProjects((projects || []).filter((_, i) => i !== index));

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <LayoutDashboard className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {resume ? 'View Resume' : 'Tailor New Resume'}
            </h1>
          </div>
        </div>
        {tailoredData && (
          <div className="w-full sm:w-auto">
            <PDFDownloadLink 
              document={<ResumePDF data={tailoredData} />} 
              fileName={`${title.replace(/\s+/g, '_')}_Resume.pdf`}
            >
              {({ loading }) => (
                <Button variant="secondary" isLoading={loading} className="w-full sm:w-auto">
                  <Download className="w-5 h-5" />
                  Download PDF
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        )}
      </header>

      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col lg:flex-row gap-8"
            >
              {/* Form Navigation */}
              <div className="lg:w-64 shrink-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide">
                {[
                  { id: 'personal', label: 'Personal', icon: UserIcon },
                  { id: 'experience', label: 'Experience', icon: FileText },
                  { id: 'education', label: 'Education', icon: History },
                  { id: 'skills', label: 'Skills', icon: Sparkles },
                  { id: 'tailor', label: 'Tailor', icon: Search },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id as any)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap lg:w-full",
                      activeSection === s.id 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                    )}
                  >
                    <s.icon className="w-4 h-4" />
                    {s.label}
                  </button>
                ))}
                
                <div className="hidden lg:block pt-4">
                  <Button 
                    onClick={handleTailor} 
                    className="w-full py-4 shadow-xl shadow-indigo-100" 
                    isLoading={isTailoring}
                  >
                    <Sparkles className="w-5 h-5" />
                    Tailor with AI
                  </Button>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 min-w-0">
                <Card className="p-4 md:p-8">
                  {activeSection === 'personal' && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                        <p className="text-sm text-slate-500">Your contact details for the resume header.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <Input label="Full Name" value={personalInfo.fullName} onChange={e => setPersonalInfo({...personalInfo, fullName: e.target.value})} />
                        <Input label="Email" value={personalInfo.email} onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})} />
                        <Input label="Phone" value={personalInfo.phone} onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} />
                        <Input label="Location" value={personalInfo.location} onChange={e => setPersonalInfo({...personalInfo, location: e.target.value})} />
                        <Input label="LinkedIn (Optional)" value={personalInfo.linkedin} onChange={e => setPersonalInfo({...personalInfo, linkedin: e.target.value})} />
                        <Input label="Website (Optional)" value={personalInfo.website} onChange={e => setPersonalInfo({...personalInfo, website: e.target.value})} />
                      </div>
                    </div>
                  )}

                  {activeSection === 'experience' && (
                    <div className="space-y-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-slate-900">Work Experience</h3>
                          <p className="text-sm text-slate-500">Add your professional history.</p>
                        </div>
                        <Button variant="outline" onClick={addExperience} className="px-3 py-1.5 text-xs w-full sm:w-auto">
                          <Plus className="w-4 h-4" /> Add Work
                        </Button>
                      </div>
                      {experience.map((exp, i) => (
                        <div key={i} className="p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                          <button onClick={() => removeExperience(i)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Company" value={exp.company} onChange={e => {
                              const newExp = [...experience];
                              newExp[i].company = e.target.value;
                              setExperience(newExp);
                            }} />
                            <Input label="Position" value={exp.position} onChange={e => {
                              const newExp = [...experience];
                              newExp[i].position = e.target.value;
                              setExperience(newExp);
                            }} />
                            <Input label="Duration" placeholder="e.g. Jan 2020 - Present" value={exp.duration} onChange={e => {
                              const newExp = [...experience];
                              newExp[i].duration = e.target.value;
                              setExperience(newExp);
                            }} />
                            <Input label="Location" value={exp.location} onChange={e => {
                              const newExp = [...experience];
                              newExp[i].location = e.target.value;
                              setExperience(newExp);
                            }} />
                          </div>
                          <TextArea 
                            label="Responsibilities / Achievements" 
                            placeholder="Enter bullet points (one per line)..."
                            value={exp.bulletPoints.join('\n')}
                            onChange={e => {
                              const newExp = [...experience];
                              newExp[i].bulletPoints = e.target.value.split('\n');
                              setExperience(newExp);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {activeSection === 'education' && (
                    <div className="space-y-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-slate-900">Education</h3>
                          <p className="text-sm text-slate-500">Your academic background.</p>
                        </div>
                        <Button variant="outline" onClick={addEducation} className="px-3 py-1.5 text-xs w-full sm:w-auto">
                          <Plus className="w-4 h-4" /> Add Education
                        </Button>
                      </div>
                      {education.map((edu, i) => (
                        <div key={i} className="p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                          <button onClick={() => removeEducation(i)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="School / University" value={edu.school} onChange={e => {
                              const newEdu = [...education];
                              newEdu[i].school = e.target.value;
                              setEducation(newEdu);
                            }} />
                            <Input label="Degree" value={edu.degree} onChange={e => {
                              const newEdu = [...education];
                              newEdu[i].degree = e.target.value;
                              setEducation(newEdu);
                            }} />
                            <Input label="Duration" value={edu.duration} onChange={e => {
                              const newEdu = [...education];
                              newEdu[i].duration = e.target.value;
                              setEducation(newEdu);
                            }} />
                            <Input label="Location" value={edu.location} onChange={e => {
                              const newEdu = [...education];
                              newEdu[i].location = e.target.value;
                              setEducation(newEdu);
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeSection === 'skills' && (
                    <div className="space-y-10">
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-900">Skills</h3>
                        <TextArea 
                          label="Technical Skills" 
                          placeholder="React, TypeScript, Node.js, etc. (comma separated)"
                          value={skills.technical.join(', ')}
                          onChange={e => setSkills({...skills, technical: e.target.value.split(',').map(s => s.trim())})}
                        />
                        <TextArea 
                          label="Soft Skills" 
                          placeholder="Leadership, Communication, etc. (comma separated)"
                          value={skills.soft.join(', ')}
                          onChange={e => setSkills({...skills, soft: e.target.value.split(',').map(s => s.trim())})}
                        />
                      </div>

                      <div className="pt-8 border-t border-slate-100 space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <h3 className="text-xl font-bold text-slate-900">Projects</h3>
                          <Button variant="outline" onClick={addProject} className="px-3 py-1.5 text-xs w-full sm:w-auto">
                            <Plus className="w-4 h-4" /> Add Project
                          </Button>
                        </div>
                        {projects?.map((proj, i) => (
                          <div key={i} className="p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                            <button onClick={() => removeProject(i)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <Input label="Project Name" value={proj.name} onChange={e => {
                              const newProj = [...(projects || [])];
                              newProj[i].name = e.target.value;
                              setProjects(newProj);
                            }} />
                            <TextArea label="Description" value={proj.description} onChange={e => {
                              const newProj = [...(projects || [])];
                              newProj[i].description = e.target.value;
                              setProjects(newProj);
                            }} />
                            <Input label="Technologies" placeholder="Comma separated..." value={proj.technologies.join(', ')} onChange={e => {
                              const newProj = [...(projects || [])];
                              newProj[i].technologies = e.target.value.split(',').map(s => s.trim());
                              setProjects(newProj);
                            }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSection === 'tailor' && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900">Tailoring Options</h3>
                        <p className="text-sm text-slate-500">Final step: Provide the job details to optimize your resume.</p>
                      </div>
                      <Input 
                        label="Application Title" 
                        placeholder="e.g. Senior Software Engineer at Google"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                      <TextArea 
                        label="Job Description" 
                        placeholder="Paste the job description here..."
                        value={jd}
                        onChange={(e) => setJd(e.target.value)}
                      />
                      {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-medium">{error}</span>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
                
                <div className="lg:hidden pt-6">
                  <Button 
                    onClick={handleTailor} 
                    className="w-full py-4 shadow-xl shadow-indigo-100" 
                    isLoading={isTailoring}
                  >
                    <Sparkles className="w-5 h-5" />
                    Tailor with AI
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Resume Generated!</h3>
                    <p className="text-xs text-slate-500">Your ATS-optimized resume is ready.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {!resume && (
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 sm:flex-none">
                      Edit
                    </Button>
                  )}
                  {tailoredData && (
                    <PDFDownloadLink 
                      document={<ResumePDF data={tailoredData} />} 
                      fileName={`${title.replace(/\s+/g, '_')}_Resume.pdf`}
                      className="flex-1 sm:flex-none"
                    >
                      {({ loading }) => (
                        <Button variant="secondary" isLoading={loading} className="w-full">
                          <Download className="w-5 h-5" />
                          Download
                        </Button>
                      )}
                    </PDFDownloadLink>
                  )}
                </div>
              </div>

              <Card className="p-0 h-[500px] md:h-[800px] overflow-hidden bg-white">
                {tailoredData ? (
                  <PDFViewer width="100%" height="100%" className="border-none">
                    <ResumePDF data={tailoredData} />
                  </PDFViewer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<'dashboard' | 'tailor'>('dashboard');
  const [selectedResume, setSelectedResume] = useState<ResumeData | undefined>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900">ResumeTailor</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setView('dashboard'); setSelectedResume(undefined); }}
            className={cn("p-2 rounded-lg", view === 'dashboard' ? "bg-indigo-50 text-indigo-600" : "text-slate-400")}
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>
          <button 
            onClick={() => { setView('tailor'); setSelectedResume(undefined); }}
            className={cn("p-2 rounded-lg", view === 'tailor' && !selectedResume ? "bg-indigo-50 text-indigo-600" : "text-slate-400")}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={() => signOut(auth)} className="p-2 text-slate-400 hover:text-rose-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">ResumeTailor</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setView('dashboard'); setSelectedResume(undefined); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              view === 'dashboard' ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => { setView('tailor'); setSelectedResume(undefined); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              view === 'tailor' && !selectedResume ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Plus className="w-4 h-4" />
            New Resume
          </button>
          <div className="pt-4 pb-2 px-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent</span>
          </div>
          <div className="px-4 py-2 text-xs text-slate-400 italic">
            Resumes appear here...
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
            <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-slate-200" alt={user.displayName || ''} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{user.displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
            <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-rose-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {view === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Dashboard 
                  user={user} 
                  onNewResume={() => setView('tailor')} 
                  onSelectResume={(r) => { setSelectedResume(r); setView('tailor'); }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="tailor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <TailorResumePage 
                  user={user} 
                  resume={selectedResume}
                  onBack={() => { setView('dashboard'); setSelectedResume(undefined); }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
