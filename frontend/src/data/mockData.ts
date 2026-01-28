// Mock data for HiringBazaar Admin Dashboard

export interface HRAccount {
  id: string;
  name: string;
  email: string;
  company: string;
  jobsPosted: number;
  status: 'Active' | 'Pending' | 'Inactive';
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  hrCompany: string;
  status: 'Shortlisted' | 'Engaged' | 'Pending Review' | 'Taken';
  appliedAt: string;
}

export interface JobPosting {
  id: string;
  position: string;
  hrCompany: string;
  plan: 'Basic' | 'Premium';
  salaryRange?: string;
  candidatesCount: number;
  status: 'Active' | 'Closed' | 'Draft';
  createdAt: string;
  description?: string;
  requirements?: string[];
  skills?: string[];
}

export interface PlatformSettings {
  platformName: string;
  commissionRate: number;
  supportEmail: string;
}

export const hrAccounts: HRAccount[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@techcorp.com', company: 'TechCorp Inc.', jobsPosted: 12, status: 'Active', createdAt: '2025-10-15' },
  { id: '2', name: 'Michael Chen', email: 'michael@innovate.io', company: 'Innovate.io', jobsPosted: 8, status: 'Active', createdAt: '2025-11-02' },
  { id: '3', name: 'Emily Davis', email: 'emily@startupxyz.com', company: 'StartupXYZ', jobsPosted: 5, status: 'Pending', createdAt: '2025-11-20' },
  { id: '4', name: 'James Wilson', email: 'james@globalhr.com', company: 'Global HR Solutions', jobsPosted: 23, status: 'Active', createdAt: '2025-09-01' },
  { id: '5', name: 'Lisa Anderson', email: 'lisa@fintech.co', company: 'FinTech Co', jobsPosted: 3, status: 'Inactive', createdAt: '2025-08-15' },
];

export const candidates: Candidate[] = [
  { id: '1', name: 'Alex Thompson', email: 'alex.t@email.com', jobTitle: 'Senior Developer', hrCompany: 'TechCorp Inc.', status: 'Shortlisted', appliedAt: '2025-12-01' },
  { id: '2', name: 'Maria Garcia', email: 'maria.g@email.com', jobTitle: 'Product Manager', hrCompany: 'Innovate.io', status: 'Engaged', appliedAt: '2025-12-03' },
  { id: '3', name: 'David Kim', email: 'david.k@email.com', jobTitle: 'UX Designer', hrCompany: 'StartupXYZ', status: 'Pending Review', appliedAt: '2025-12-05' },
  { id: '4', name: 'Sophie Brown', email: 'sophie.b@email.com', jobTitle: 'Data Analyst', hrCompany: 'TechCorp Inc.', status: 'Taken', appliedAt: '2025-11-28' },
  { id: '5', name: 'Ryan Martinez', email: 'ryan.m@email.com', jobTitle: 'DevOps Engineer', hrCompany: 'Global HR Solutions', status: 'Shortlisted', appliedAt: '2025-12-10' },
  { id: '6', name: 'Emma Wilson', email: 'emma.w@email.com', jobTitle: 'Frontend Developer', hrCompany: 'FinTech Co', status: 'Pending Review', appliedAt: '2025-12-12' },
];

export const jobPostings: JobPosting[] = [
  { id: '1', position: 'Senior Developer', hrCompany: 'TechCorp Inc.', plan: 'Premium', salaryRange: '12-18 LPA', candidatesCount: 24, status: 'Active', createdAt: '2025-11-15', description: 'We are looking for an experienced Senior Developer to lead our development team. You will be responsible for designing and implementing scalable solutions.', requirements: ['5+ years of experience', 'Strong knowledge of system design', 'Experience with distributed systems', 'Team leadership experience'], skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'] },
  { id: '2', position: 'Product Manager', hrCompany: 'Innovate.io', plan: 'Basic', salaryRange: '10-14 LPA', candidatesCount: 18, status: 'Active', createdAt: '2025-11-20', description: 'Seeking a Product Manager to drive product strategy and vision. You will work with cross-functional teams to deliver innovative solutions.', requirements: ['3+ years of PM experience', 'Data-driven mindset', 'Excellent communication skills'], skills: ['Product Strategy', 'Analytics', 'SQL', 'User Research', 'Figma'] },
  { id: '3', position: 'UX Designer', hrCompany: 'StartupXYZ', plan: 'Premium', salaryRange: '8-12 LPA', candidatesCount: 12, status: 'Active', createdAt: '2025-11-25', description: 'Join our design team to create beautiful and intuitive user experiences. You will collaborate with product and engineering teams.', requirements: ['3+ years UX design experience', 'Portfolio showcasing design work', 'User research experience'], skills: ['Figma', 'User Research', 'Prototyping', 'CSS', 'Adobe XD'] },
  { id: '4', position: 'Data Analyst', hrCompany: 'TechCorp Inc.', plan: 'Basic', salaryRange: '6-10 LPA', candidatesCount: 31, status: 'Closed', createdAt: '2025-10-01', description: 'Looking for a Data Analyst to support our analytics team. You will work with large datasets and provide insights for business decisions.', requirements: ['2+ years analytics experience', 'SQL proficiency', 'Strong Excel skills'], skills: ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics'] },
  { id: '5', position: 'DevOps Engineer', hrCompany: 'Global HR Solutions', plan: 'Premium', salaryRange: '11-16 LPA', candidatesCount: 9, status: 'Active', createdAt: '2025-12-01', description: 'We need a DevOps Engineer to manage our infrastructure and deployment pipelines. Experience with cloud platforms is essential.', requirements: ['4+ years DevOps experience', 'Cloud platform experience', 'CI/CD pipeline knowledge'], skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Linux'] },
  { id: '6', position: 'Frontend Developer', hrCompany: 'FinTech Co', plan: 'Basic', salaryRange: '7-11 LPA', candidatesCount: 15, status: 'Draft', createdAt: '2025-12-10', description: 'Seeking a Frontend Developer to build responsive web applications. You will work with React and modern JavaScript tools.', requirements: ['2+ years frontend experience', 'React knowledge', 'CSS proficiency'], skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML5'] },
];

export const platformSettings: PlatformSettings = {
  platformName: 'HiringBazaar',
  commissionRate: 15,
  supportEmail: 'support@HiringBazaar.com',
};

export const dashboardStats = {
  totalHRs: hrAccounts.length,
  activeJobPostings: jobPostings.filter(j => j.status === 'Active').length,
  totalCandidates: candidates.length,
};