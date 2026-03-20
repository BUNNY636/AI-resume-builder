export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  role?: 'user' | 'admin';
}

export interface ResumeData {
  id?: string;
  userId: string;
  title: string;
  jobDescription: string;
  rawExperience: string;
  tailoredData: TailoredResume;
  createdAt: string;
}

export interface TailoredResume {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    location: string;
    bulletPoints: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    duration: string;
    location: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}
