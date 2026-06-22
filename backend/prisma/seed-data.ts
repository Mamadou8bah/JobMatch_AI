import {
  ApplicationStatus,
  ChatThreadStatus,
  CoachMessageRole,
  JobStatus,
  NotificationType,
  PrismaClient,
  TrainingCourseStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export const SEED_PASSWORD_DEMO = '11111111';

export const SEED_IDS = {
  users: {
    admin: 'a0000000-0000-4000-8000-000000000001',
    bah: 'a0000000-0000-4000-8000-000000000011',
    fatou: 'a0000000-0000-4000-8000-000000000012',
    laminSeeker: 'a0000000-0000-4000-8000-000000000013',
    mariama: 'a0000000-0000-4000-8000-000000000014',
    omar: 'a0000000-0000-4000-8000-000000000015',
    aisha: 'a0000000-0000-4000-8000-000000000016',
    ibrahim: 'a0000000-0000-4000-8000-000000000017',
    kaddy: 'a0000000-0000-4000-8000-000000000018',
    samba: 'a0000000-0000-4000-8000-000000000019',
    neneh: 'a0000000-0000-4000-8000-00000000001a',
    modou: 'a0000000-0000-4000-8000-00000000001b',
    haddy: 'a0000000-0000-4000-8000-00000000001c',
    yusupha: 'a0000000-0000-4000-8000-00000000001d',
    binta: 'a0000000-0000-4000-8000-00000000001e',
    employerAtlantic: 'a0000000-0000-4000-8000-000000000021',
    employerRiver: 'a0000000-0000-4000-8000-000000000022',
    employerTourism: 'a0000000-0000-4000-8000-000000000023',
    employerFinance: 'a0000000-0000-4000-8000-000000000024',
    employerKotu: 'a0000000-0000-4000-8000-000000000025',
    employerRetail: 'a0000000-0000-4000-8000-000000000026',
    employerSkills: 'a0000000-0000-4000-8000-000000000027',
    employerAgro: 'a0000000-0000-4000-8000-000000000028',
  },
  jobs: {
    frontend: 'b0000000-0000-4000-8000-000000000001',
    dataAnalyst: 'b0000000-0000-4000-8000-000000000002',
    customerSupport: 'b0000000-0000-4000-8000-000000000003',
    marketing: 'b0000000-0000-4000-8000-000000000004',
    warehouse: 'b0000000-0000-4000-8000-000000000005',
    backendDev: 'b0000000-0000-4000-8000-000000000006',
    uxDesigner: 'b0000000-0000-4000-8000-000000000007',
    hrAssistant: 'b0000000-0000-4000-8000-000000000008',
    salesRep: 'b0000000-0000-4000-8000-000000000009',
    tourGuide: 'b0000000-0000-4000-8000-00000000000a',
    accountant: 'b0000000-0000-4000-8000-00000000000b',
    nurse: 'b0000000-0000-4000-8000-00000000000c',
    electrician: 'b0000000-0000-4000-8000-00000000000d',
    teacher: 'b0000000-0000-4000-8000-00000000000e',
    driver: 'b0000000-0000-4000-8000-00000000000f',
    chef: 'b0000000-0000-4000-8000-000000000010',
    socialMedia: 'b0000000-0000-4000-8000-000000000011',
    projectManager: 'b0000000-0000-4000-8000-000000000012',
    dataEntry: 'b0000000-0000-4000-8000-000000000013',
    security: 'b0000000-0000-4000-8000-000000000014',
    mobileDev: 'b0000000-0000-4000-8000-000000000015',
    contentWriter: 'b0000000-0000-4000-8000-000000000016',
    logistics: 'b0000000-0000-4000-8000-000000000017',
    farmSupervisor: 'b0000000-0000-4000-8000-000000000018',
    callCenter: 'b0000000-0000-4000-8000-000000000019',
  },
  threads: {
    bahFrontend: 'c0000000-0000-4000-8000-000000000001',
    fatouFrontend: 'c0000000-0000-4000-8000-000000000002',
    bahData: 'c0000000-0000-4000-8000-000000000003',
    modouBackend: 'c0000000-0000-4000-8000-000000000004',
    omarSales: 'c0000000-0000-4000-8000-000000000005',
    mariamaAccountant: 'c0000000-0000-4000-8000-000000000006',
    fatouMobile: 'c0000000-0000-4000-8000-000000000007',
  },
};

const GAMBIAN_LOCATIONS = ['Banjul', 'Serrekunda', 'Brikama', 'Bakau', 'Farafenni', 'Soma', 'Basse'];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function upsertUser(
  prisma: PrismaClient,
  id: string,
  data: {
    email: string;
    passwordHash: string;
    role: UserRole;
    fullName: string;
    phone?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    experienceYears?: number;
    companyName?: string;
    companyDescription?: string;
    approved?: boolean;
    emailVerified?: boolean;
    blocked?: boolean;
  },
): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: data.email.toLowerCase() },
    update: {
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      location: data.location,
      bio: data.bio,
      skills: data.skills ?? [],
      experienceYears: data.experienceYears,
      companyName: data.companyName,
      companyDescription: data.companyDescription,
      approved: data.approved ?? true,
      emailVerified: data.emailVerified ?? true,
      blocked: data.blocked ?? false,
    },
    create: {
      id,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role,
      fullName: data.fullName,
      phone: data.phone,
      location: data.location,
      bio: data.bio,
      skills: data.skills ?? [],
      experienceYears: data.experienceYears,
      companyName: data.companyName,
      companyDescription: data.companyDescription,
      approved: data.approved ?? true,
      emailVerified: data.emailVerified ?? true,
      blocked: data.blocked ?? false,
    },
  });
  return user.id;
}

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    return null;
  }
  return { email, password };
}

export async function runDatabaseSeed(prisma: PrismaClient) {
  const demoHash = await bcrypt.hash(SEED_PASSWORD_DEMO, 10);

  const u = SEED_IDS.users;
  const userIds: Record<string, string> = {};

  const adminCredentials = getAdminCredentials();
  if (adminCredentials) {
    const adminHash = await bcrypt.hash(adminCredentials.password, 10);
    userIds.admin = await upsertUser(prisma, u.admin, {
      email: adminCredentials.email,
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      fullName: 'System Admin',
      approved: true,
      emailVerified: true,
    });
  } else {
    console.warn(
      'Admin seed skipped: set ADMIN_EMAIL and ADMIN_PASSWORD to create the admin account.',
    );
  }

  const seekers: Array<{
    key: string;
    id: string;
    email: string;
    fullName: string;
    skills: string[];
    experienceYears: number;
    location: string;
    bio?: string;
  }> = [
    {
      key: 'bah',
      id: u.bah,
      email: 'bah@gmail.com',
      fullName: 'Bah User',
      skills: ['JavaScript', 'Communication', 'HTML'],
      experienceYears: 2,
      location: 'Banjul',
      bio: 'Junior developer looking for frontend and support roles.',
    },
    {
      key: 'fatou',
      id: u.fatou,
      email: 'fatou@gmail.com',
      fullName: 'Fatou A.',
      skills: ['React', 'TypeScript', 'Communication', 'CSS'],
      experienceYears: 3,
      location: 'Serrekunda',
      bio: 'Frontend developer with experience in React and UI design.',
    },
    {
      key: 'laminSeeker',
      id: u.laminSeeker,
      email: 'lamin.seeker@gmail.com',
      fullName: 'Lamin Ceesay',
      skills: ['Python', 'SQL', 'Excel', 'Communication'],
      experienceYears: 1,
      location: 'Brikama',
    },
    {
      key: 'mariama',
      id: u.mariama,
      email: 'mariama@gmail.com',
      fullName: 'Mariama Sowe',
      skills: ['Accounting', 'Excel', 'QuickBooks', 'Communication'],
      experienceYears: 4,
      location: 'Banjul',
    },
    {
      key: 'omar',
      id: u.omar,
      email: 'omar@gmail.com',
      fullName: 'Omar Jallow',
      skills: ['Sales', 'Communication', 'CRM', 'Marketing'],
      experienceYears: 5,
      location: 'Bakau',
    },
    {
      key: 'aisha',
      id: u.aisha,
      email: 'aisha@gmail.com',
      fullName: 'Aisha Bah',
      skills: ['Nursing', 'First Aid', 'Communication', 'Patient Care'],
      experienceYears: 6,
      location: 'Serrekunda',
    },
    {
      key: 'ibrahim',
      id: u.ibrahim,
      email: 'ibrahim@gmail.com',
      fullName: 'Ibrahim Touray',
      skills: ['Electrical Wiring', 'Safety', 'Maintenance'],
      experienceYears: 8,
      location: 'Brikama',
    },
    {
      key: 'kaddy',
      id: u.kaddy,
      email: 'kaddy@gmail.com',
      fullName: 'Kaddy Njie',
      skills: ['Teaching', 'Communication', 'English', 'Mathematics'],
      experienceYears: 7,
      location: 'Farafenni',
    },
    {
      key: 'samba',
      id: u.samba,
      email: 'samba@gmail.com',
      fullName: 'Samba Faye',
      skills: ['Driving', 'Logistics', 'Communication', 'GPS'],
      experienceYears: 10,
      location: 'Soma',
    },
    {
      key: 'neneh',
      id: u.neneh,
      email: 'neneh@gmail.com',
      fullName: 'Neneh Camara',
      skills: ['Hospitality', 'Customer Service', 'Communication', 'French'],
      experienceYears: 3,
      location: 'Banjul',
    },
    {
      key: 'modou',
      id: u.modou,
      email: 'modou@gmail.com',
      fullName: 'Modou Sarr',
      skills: ['Java', 'Spring', 'SQL', 'Git'],
      experienceYears: 4,
      location: 'Serrekunda',
    },
    {
      key: 'haddy',
      id: u.haddy,
      email: 'haddy@gmail.com',
      fullName: 'Haddy Jagne',
      skills: ['Graphic Design', 'Canva', 'Social Media', 'Marketing'],
      experienceYears: 2,
      location: 'Bakau',
    },
    {
      key: 'yusupha',
      id: u.yusupha,
      email: 'yusupha@gmail.com',
      fullName: 'Yusupha Barry',
      skills: ['Data Entry', 'Microsoft Office', 'Communication'],
      experienceYears: 1,
      location: 'Basse',
    },
    {
      key: 'binta',
      id: u.binta,
      email: 'binta@gmail.com',
      fullName: 'Binta Manneh',
      skills: ['Project Management', 'Communication', 'Agile', 'Excel'],
      experienceYears: 6,
      location: 'Banjul',
    },
  ];

  for (const seeker of seekers) {
    userIds[seeker.key] = await upsertUser(prisma, seeker.id, {
      email: seeker.email,
      passwordHash: demoHash,
      role: UserRole.JOB_SEEKER,
      fullName: seeker.fullName,
      skills: seeker.skills,
      experienceYears: seeker.experienceYears,
      location: seeker.location,
      bio: seeker.bio,
      phone: '+220 300 0000',
      approved: true,
      emailVerified: true,
    });
  }

  const employers: Array<{
    key: string;
    id: string;
    email: string;
    fullName: string;
    companyName: string;
    companyDescription: string;
    location: string;
    approved?: boolean;
  }> = [
    {
      key: 'employerAtlantic',
      id: u.employerAtlantic,
      email: 'employer@gmail.com',
      fullName: 'Awa Jallow',
      companyName: 'Atlantic Tech',
      companyDescription: 'Technology company building digital products in The Gambia.',
      location: 'Banjul',
    },
    {
      key: 'employerRiver',
      id: u.employerRiver,
      email: 'pending@company.gm',
      fullName: 'Lamin Ceesay',
      companyName: 'River Logistics',
      companyDescription: 'Distribution and warehousing across the Greater Banjul Area.',
      location: 'Banjul',
      approved: false,
    },
    {
      key: 'employerTourism',
      id: u.employerTourism,
      email: 'tourism@gambia.gm',
      fullName: 'Sainey Camara',
      companyName: 'Gambia Tourism Board',
      companyDescription: 'Promoting sustainable tourism and hospitality jobs.',
      location: 'Banjul',
    },
    {
      key: 'employerFinance',
      id: u.employerFinance,
      email: 'hr@banjulfinance.gm',
      fullName: 'Amadou Sillah',
      companyName: 'Banjul Finance Group',
      companyDescription: 'Financial services and accounting for SMEs.',
      location: 'Banjul',
    },
    {
      key: 'employerKotu',
      id: u.employerKotu,
      email: 'careers@kotudigital.gm',
      fullName: 'Isatou Ndow',
      companyName: 'Kotu Digital',
      companyDescription: 'Web and mobile solutions for West African businesses.',
      location: 'Serrekunda',
    },
    {
      key: 'employerRetail',
      id: u.employerRetail,
      email: 'jobs@serrekundaretail.gm',
      fullName: 'Ebrima Jobe',
      companyName: 'Serrekunda Retail Co',
      companyDescription: 'Retail operations and customer experience teams.',
      location: 'Serrekunda',
    },
    {
      key: 'employerSkills',
      id: u.employerSkills,
      email: 'info@skillshub.gm',
      fullName: 'Fatou Bojang',
      companyName: 'Skills Hub Gambia',
      companyDescription: 'TVET and employability training partnerships.',
      location: 'Brikama',
    },
    {
      key: 'employerAgro',
      id: u.employerAgro,
      email: 'hr@westcoastagro.gm',
      fullName: 'Demba Colley',
      companyName: 'West Coast Agro',
      companyDescription: 'Agricultural production and rural employment.',
      location: 'Brikama',
    },
  ];

  for (const employer of employers) {
    userIds[employer.key] = await upsertUser(prisma, employer.id, {
      email: employer.email,
      passwordHash: demoHash,
      role: UserRole.EMPLOYER,
      fullName: employer.fullName,
      companyName: employer.companyName,
      companyDescription: employer.companyDescription,
      location: employer.location,
      phone: '+220 400 0000',
      approved: employer.approved ?? true,
      emailVerified: true,
    });
  }

  const j = SEED_IDS.jobs;

  const jobs = [
    {
      id: j.frontend,
      employerId: userIds.employerAtlantic,
      title: 'Frontend Developer',
      description: 'Build responsive web interfaces for JobMatch AI and partner platforms across The Gambia.',
      location: 'Banjul',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      requiredSkills: ['typescript', 'react', 'communication'],
      salaryMin: 25000,
      salaryMax: 45000,
      status: JobStatus.PUBLISHED,
      views: 142,
    },
    {
      id: j.dataAnalyst,
      employerId: userIds.employerAtlantic,
      title: 'Data Analyst',
      description: 'Analyze hiring trends and produce insights for training providers and employers.',
      location: 'Serrekunda',
      employmentType: 'full-time',
      experienceLevel: 'junior',
      requiredSkills: ['sql', 'python', 'communication', 'excel'],
      salaryMin: 20000,
      salaryMax: 35000,
      status: JobStatus.PUBLISHED,
      views: 89,
    },
    {
      id: j.customerSupport,
      employerId: userIds.employerAtlantic,
      title: 'Customer Support Specialist',
      description: 'Help job seekers and employers get the most from the JobMatch AI platform.',
      location: 'Brikama',
      employmentType: 'part-time',
      experienceLevel: 'entry',
      requiredSkills: ['communication', 'customer service'],
      salaryMin: 12000,
      salaryMax: 18000,
      status: JobStatus.PUBLISHED,
      views: 201,
    },
    {
      id: j.marketing,
      employerId: userIds.employerAtlantic,
      title: 'Marketing Coordinator',
      description: 'Support outreach campaigns for training providers and employers.',
      location: 'Banjul',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      requiredSkills: ['communication', 'marketing', 'social media'],
      status: JobStatus.DRAFT,
      views: 12,
    },
    {
      id: j.warehouse,
      employerId: userIds.employerRiver,
      title: 'Warehouse Assistant',
      description: 'Assist with inventory and logistics for a Banjul distribution center.',
      location: 'Banjul',
      employmentType: 'full-time',
      experienceLevel: 'entry',
      requiredSkills: ['communication', 'teamwork', 'logistics'],
      status: JobStatus.PENDING_REVIEW,
      views: 34,
    },
    {
      id: j.backendDev,
      employerId: userIds.employerKotu,
      title: 'Backend Developer',
      description: 'Develop REST APIs with Node.js and PostgreSQL for client projects.',
      location: 'Serrekunda',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      requiredSkills: ['nodejs', 'postgresql', 'typescript', 'git'],
      salaryMin: 30000,
      salaryMax: 50000,
      status: JobStatus.PUBLISHED,
      views: 76,
    },
    {
      id: j.uxDesigner,
      employerId: userIds.employerKotu,
      title: 'UX Designer',
      description: 'Design user flows and prototypes for mobile-first products.',
      location: 'Serrekunda',
      employmentType: 'contract',
      experienceLevel: 'mid',
      requiredSkills: ['figma', 'ux', 'communication', 'research'],
      status: JobStatus.PUBLISHED,
      views: 55,
    },
    {
      id: j.hrAssistant,
      employerId: userIds.employerFinance,
      title: 'HR Assistant',
      description: 'Support recruitment, onboarding, and employee records.',
      location: 'Banjul',
      employmentType: 'full-time',
      experienceLevel: 'junior',
      requiredSkills: ['communication', 'excel', 'hr'],
      status: JobStatus.PUBLISHED,
      views: 67,
    },
    {
      id: j.salesRep,
      employerId: userIds.employerRetail,
      title: 'Sales Representative',
      description: 'Drive in-store and field sales across Greater Banjul.',
      location: 'Serrekunda',
      employmentType: 'full-time',
      experienceLevel: 'entry',
      requiredSkills: ['sales', 'communication', 'crm'],
      status: JobStatus.PUBLISHED,
      views: 118,
    },
    {
      id: j.tourGuide,
      employerId: userIds.employerTourism,
      title: 'Tour Guide',
      description: 'Lead cultural and eco-tourism experiences for international visitors.',
      location: 'Banjul',
      employmentType: 'seasonal',
      experienceLevel: 'entry',
      requiredSkills: ['communication', 'hospitality', 'english', 'french'],
      status: JobStatus.PUBLISHED,
      views: 93,
    },
    {
      id: j.accountant,
      employerId: userIds.employerFinance,
      title: 'Junior Accountant',
      description: 'Prepare financial statements and support audit preparation.',
      location: 'Banjul',
      employmentType: 'full-time',
      experienceLevel: 'junior',
      requiredSkills: ['accounting', 'excel', 'quickbooks'],
      salaryMin: 22000,
      salaryMax: 32000,
      status: JobStatus.PUBLISHED,
      views: 44,
    },
    {
      id: j.nurse,
      employerId: userIds.employerRetail,
      title: 'Community Health Nurse',
      description: 'Provide primary care and health education in clinic settings.',
      location: 'Brikama',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      requiredSkills: ['nursing', 'patient care', 'communication'],
      status: JobStatus.PUBLISHED,
      views: 61,
    },
    {
      id: j.electrician,
      employerId: userIds.employerAgro,
      title: 'Electrician',
      description: 'Install and maintain electrical systems at agricultural facilities.',
      location: 'Brikama',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      requiredSkills: ['electrical wiring', 'safety', 'maintenance'],
      status: JobStatus.PUBLISHED,
      views: 38,
    },
    {
      id: j.teacher,
      employerId: userIds.employerSkills,
      title: 'Vocational Trainer',
      description: 'Deliver employability and digital skills workshops for youth.',
      location: 'Brikama',
      employmentType: 'part-time',
      experienceLevel: 'mid',
      requiredSkills: ['teaching', 'communication', 'training'],
      status: JobStatus.PUBLISHED,
      views: 52,
    },
    {
      id: j.driver,
      employerId: userIds.employerRiver,
      title: 'Delivery Driver',
      description: 'Operate light vehicles for last-mile logistics routes.',
      location: 'Banjul',
      employmentType: 'full-time',
      experienceLevel: 'entry',
      requiredSkills: ['driving', 'logistics', 'communication'],
      status: JobStatus.PUBLISHED,
      views: 87,
    },
    {
      id: j.chef,
      employerId: userIds.employerTourism,
      title: 'Hotel Chef',
      description: 'Prepare local and international cuisine for hotel guests.',
      location: 'Bakau',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      requiredSkills: ['cooking', 'food safety', 'teamwork'],
      status: JobStatus.CLOSED,
      views: 29,
    },
    {
      id: j.socialMedia,
      employerId: userIds.employerKotu,
      title: 'Social Media Manager',
      description: 'Manage brand presence across Facebook, Instagram, and LinkedIn.',
      location: 'Serrekunda',
      employmentType: 'full-time',
      experienceLevel: 'junior',
      requiredSkills: ['social media', 'marketing', 'content writing'],
      status: JobStatus.PUBLISHED,
      views: 71,
    },
    {
      id: j.projectManager,
      employerId: userIds.employerAtlantic,
      title: 'IT Project Manager',
      description: 'Coordinate software delivery with local and remote teams.',
      location: 'Banjul',
      employmentType: 'full-time',
      experienceLevel: 'senior',
      requiredSkills: ['project management', 'agile', 'communication'],
      salaryMin: 45000,
      salaryMax: 65000,
      status: JobStatus.PUBLISHED,
      views: 40,
    },
    {
      id: j.dataEntry,
      employerId: userIds.employerFinance,
      title: 'Data Entry Clerk',
      description: 'Digitize records and maintain accurate client databases.',
      location: 'Banjul',
      employmentType: 'part-time',
      experienceLevel: 'entry',
      requiredSkills: ['data entry', 'microsoft office', 'communication'],
      status: JobStatus.PUBLISHED,
      views: 156,
    },
    {
      id: j.security,
      employerId: userIds.employerRetail,
      title: 'Security Officer',
      description: 'Monitor premises and support customer safety at retail locations.',
      location: 'Serrekunda',
      employmentType: 'full-time',
      experienceLevel: 'entry',
      requiredSkills: ['security', 'communication', 'teamwork'],
      status: JobStatus.PUBLISHED,
      views: 63,
    },
    {
      id: j.mobileDev,
      employerId: userIds.employerKotu,
      title: 'Mobile Developer',
      description: 'Build React Native apps for employment and training platforms.',
      location: 'Serrekunda',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      requiredSkills: ['react native', 'javascript', 'typescript', 'git'],
      salaryMin: 28000,
      salaryMax: 48000,
      status: JobStatus.PUBLISHED,
      views: 84,
    },
    {
      id: j.contentWriter,
      employerId: userIds.employerTourism,
      title: 'Content Writer',
      description: 'Create blog posts and guides promoting Gambian tourism.',
      location: 'Banjul',
      employmentType: 'contract',
      experienceLevel: 'junior',
      requiredSkills: ['content writing', 'communication', 'seo'],
      status: JobStatus.PUBLISHED,
      views: 47,
    },
    {
      id: j.logistics,
      employerId: userIds.employerRiver,
      title: 'Logistics Coordinator',
      description: 'Plan routes, track shipments, and liaise with warehouse teams.',
      location: 'Banjul',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      requiredSkills: ['logistics', 'excel', 'communication'],
      status: JobStatus.REJECTED,
      views: 18,
    },
    {
      id: j.farmSupervisor,
      employerId: userIds.employerAgro,
      title: 'Farm Supervisor',
      description: 'Supervise crop production teams and equipment usage.',
      location: 'Brikama',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      requiredSkills: ['agriculture', 'teamwork', 'communication'],
      status: JobStatus.PUBLISHED,
      views: 33,
    },
    {
      id: j.callCenter,
      employerId: userIds.employerRetail,
      title: 'Call Center Agent',
      description: 'Handle inbound customer inquiries via phone and chat.',
      location: 'Serrekunda',
      employmentType: 'full-time',
      experienceLevel: 'entry',
      requiredSkills: ['customer service', 'communication', 'crm'],
      status: JobStatus.PENDING_REVIEW,
      views: 22,
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { id: job.id },
      update: {
        title: job.title,
        description: job.description,
        location: job.location,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        requiredSkills: job.requiredSkills,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        status: job.status,
        views: job.views,
        employerId: job.employerId,
      },
      create: job,
    });
  }

  const applications: Array<{
    jobId: string;
    applicantId: string;
    employerId: string;
    status: ApplicationStatus;
    matchScore: number;
    coverLetter?: string;
  }> = [
    { jobId: j.frontend, applicantId: userIds.bah, employerId: userIds.employerAtlantic, status: ApplicationStatus.SHORTLISTED, matchScore: 88, coverLetter: 'I am excited to contribute to Atlantic Tech.' },
    { jobId: j.frontend, applicantId: userIds.fatou, employerId: userIds.employerAtlantic, status: ApplicationStatus.INTERVIEW, matchScore: 94, coverLetter: 'React and TypeScript are my core strengths.' },
    { jobId: j.frontend, applicantId: userIds.modou, employerId: userIds.employerAtlantic, status: ApplicationStatus.PENDING, matchScore: 71 },
    { jobId: j.dataAnalyst, applicantId: userIds.bah, employerId: userIds.employerAtlantic, status: ApplicationStatus.PENDING, matchScore: 72 },
    { jobId: j.dataAnalyst, applicantId: userIds.laminSeeker, employerId: userIds.employerAtlantic, status: ApplicationStatus.SHORTLISTED, matchScore: 85 },
    { jobId: j.customerSupport, applicantId: userIds.bah, employerId: userIds.employerAtlantic, status: ApplicationStatus.HIRED, matchScore: 91 },
    { jobId: j.customerSupport, applicantId: userIds.neneh, employerId: userIds.employerAtlantic, status: ApplicationStatus.SHORTLISTED, matchScore: 89 },
    { jobId: j.backendDev, applicantId: userIds.modou, employerId: userIds.employerKotu, status: ApplicationStatus.INTERVIEW, matchScore: 82 },
    { jobId: j.backendDev, applicantId: userIds.fatou, employerId: userIds.employerKotu, status: ApplicationStatus.REJECTED, matchScore: 58 },
    { jobId: j.mobileDev, applicantId: userIds.fatou, employerId: userIds.employerKotu, status: ApplicationStatus.PENDING, matchScore: 86 },
    { jobId: j.uxDesigner, applicantId: userIds.haddy, employerId: userIds.employerKotu, status: ApplicationStatus.SHORTLISTED, matchScore: 79 },
    { jobId: j.salesRep, applicantId: userIds.omar, employerId: userIds.employerRetail, status: ApplicationStatus.INTERVIEW, matchScore: 92 },
    { jobId: j.salesRep, applicantId: userIds.yusupha, employerId: userIds.employerRetail, status: ApplicationStatus.PENDING, matchScore: 64 },
    { jobId: j.tourGuide, applicantId: userIds.neneh, employerId: userIds.employerTourism, status: ApplicationStatus.SHORTLISTED, matchScore: 88 },
    { jobId: j.accountant, applicantId: userIds.mariama, employerId: userIds.employerFinance, status: ApplicationStatus.INTERVIEW, matchScore: 90 },
    { jobId: j.accountant, applicantId: userIds.yusupha, employerId: userIds.employerFinance, status: ApplicationStatus.REJECTED, matchScore: 45 },
    { jobId: j.nurse, applicantId: userIds.aisha, employerId: userIds.employerRetail, status: ApplicationStatus.HIRED, matchScore: 95 },
    { jobId: j.electrician, applicantId: userIds.ibrahim, employerId: userIds.employerAgro, status: ApplicationStatus.SHORTLISTED, matchScore: 93 },
    { jobId: j.teacher, applicantId: userIds.kaddy, employerId: userIds.employerSkills, status: ApplicationStatus.PENDING, matchScore: 87 },
    { jobId: j.driver, applicantId: userIds.samba, employerId: userIds.employerRiver, status: ApplicationStatus.INTERVIEW, matchScore: 96 },
    { jobId: j.dataEntry, applicantId: userIds.yusupha, employerId: userIds.employerFinance, status: ApplicationStatus.SHORTLISTED, matchScore: 83 },
    { jobId: j.dataEntry, applicantId: userIds.bah, employerId: userIds.employerFinance, status: ApplicationStatus.PENDING, matchScore: 68 },
    { jobId: j.projectManager, applicantId: userIds.binta, employerId: userIds.employerAtlantic, status: ApplicationStatus.PENDING, matchScore: 88 },
    { jobId: j.socialMedia, applicantId: userIds.haddy, employerId: userIds.employerKotu, status: ApplicationStatus.PENDING, matchScore: 91 },
    { jobId: j.farmSupervisor, applicantId: userIds.ibrahim, employerId: userIds.employerAgro, status: ApplicationStatus.PENDING, matchScore: 74 },
    { jobId: j.security, applicantId: userIds.samba, employerId: userIds.employerRetail, status: ApplicationStatus.REJECTED, matchScore: 52 },
    { jobId: j.contentWriter, applicantId: userIds.haddy, employerId: userIds.employerTourism, status: ApplicationStatus.SHORTLISTED, matchScore: 80 },
    { jobId: j.hrAssistant, applicantId: userIds.binta, employerId: userIds.employerFinance, status: ApplicationStatus.PENDING, matchScore: 77 },
  ];

  for (const app of applications) {
    await prisma.application.upsert({
      where: { jobId_applicantId: { jobId: app.jobId, applicantId: app.applicantId } },
      update: {
        status: app.status,
        matchScore: app.matchScore,
        coverLetter: app.coverLetter,
        employerId: app.employerId,
      },
      create: app,
    });
  }

  const courses = [
    { id: 'd0000000-0000-4000-8000-000000000001', title: 'Intro to CV Writing', provider: 'JobMatch Academy', description: 'Write a strong CV tailored to Gambian employers.', skills: ['communication'], url: 'https://example.com/cv-writing' },
    { id: 'd0000000-0000-4000-8000-000000000002', title: 'SQL Basics', provider: 'JobMatch Academy', description: 'Database queries and relational data fundamentals.', skills: ['database', 'sql'], url: 'https://example.com/sql' },
    { id: 'd0000000-0000-4000-8000-000000000003', title: 'React for Beginners', provider: 'freeCodeCamp', description: 'Build modern interfaces with React.', skills: ['react', 'javascript'], url: 'https://www.freecodecamp.org' },
    { id: 'd0000000-0000-4000-8000-000000000004', title: 'TypeScript Fundamentals', provider: 'Microsoft Learn', description: 'Typed JavaScript for scalable apps.', skills: ['typescript', 'javascript'], url: 'https://learn.microsoft.com' },
    { id: 'd0000000-0000-4000-8000-000000000005', title: 'Python for Data Analysis', provider: 'Coursera', description: 'Analyze data with pandas and NumPy.', skills: ['python', 'data analysis'], url: 'https://coursera.org' },
    { id: 'd0000000-0000-4000-8000-000000000006', title: 'Customer Service Excellence', provider: 'Skills Hub Gambia', description: 'Professional communication for support roles.', skills: ['customer service', 'communication'], url: 'https://example.com/cs' },
    { id: 'd0000000-0000-4000-8000-000000000007', title: 'Digital Marketing Basics', provider: 'Google Digital Garage', description: 'SEO, social media, and online campaigns.', skills: ['marketing', 'social media', 'seo'], url: 'https://learndigital.withgoogle.com' },
    { id: 'd0000000-0000-4000-8000-000000000008', title: 'Project Management Essentials', provider: 'PMI', description: 'Agile and waterfall project delivery.', skills: ['project management', 'agile'], url: 'https://pmi.org' },
    { id: 'd0000000-0000-4000-8000-000000000009', title: 'Electrical Safety', provider: 'TVET Gambia', description: 'Safe wiring practices for technicians.', skills: ['electrical wiring', 'safety'], url: 'https://example.com/electrical' },
    { id: 'd0000000-0000-4000-8000-00000000000a', title: 'Hospitality & Tourism', provider: 'Gambia Tourism Board', description: 'Guest relations and tour operations.', skills: ['hospitality', 'communication'], url: 'https://example.com/tourism' },
    { id: 'd0000000-0000-4000-8000-00000000000b', title: 'QuickBooks for SMEs', provider: 'Banjul Finance Group', description: 'Bookkeeping for small businesses.', skills: ['quickbooks', 'accounting'], url: 'https://example.com/quickbooks' },
    { id: 'd0000000-0000-4000-8000-00000000000c', title: 'Node.js Backend Development', provider: 'JobMatch Academy', description: 'REST APIs with Express and PostgreSQL.', skills: ['nodejs', 'postgresql'], url: 'https://example.com/nodejs' },
    { id: 'd0000000-0000-4000-8000-00000000000d', title: 'Figma UI Design', provider: 'Udemy', description: 'Prototyping and design systems.', skills: ['figma', 'ux'], url: 'https://udemy.com' },
    { id: 'd0000000-0000-4000-8000-00000000000e', title: 'Excel for Business', provider: 'JobMatch Academy', description: 'Spreadsheets for finance and operations.', skills: ['excel', 'microsoft office'], url: 'https://example.com/excel' },
    { id: 'd0000000-0000-4000-8000-00000000000f', title: 'Git & GitHub', provider: 'GitHub Skills', description: 'Version control for development teams.', skills: ['git'], url: 'https://skills.github.com' },
    { id: 'd0000000-0000-4000-8000-000000000010', title: 'First Aid Certification', provider: 'Red Cross Gambia', description: 'Emergency response for healthcare workers.', skills: ['first aid', 'patient care'], url: 'https://example.com/firstaid' },
    { id: 'd0000000-0000-4000-8000-000000000011', title: 'Sales & CRM', provider: 'HubSpot Academy', description: 'Pipeline management and client outreach.', skills: ['sales', 'crm'], url: 'https://academy.hubspot.com' },
    { id: 'd0000000-0000-4000-8000-000000000012', title: 'Content Writing', provider: 'JobMatch Academy', description: 'Clear writing for web and social media.', skills: ['content writing', 'communication'], url: 'https://example.com/writing' },
    { id: 'd0000000-0000-4000-8000-000000000013', title: 'Logistics Operations', provider: 'River Logistics', description: 'Warehouse and delivery coordination.', skills: ['logistics', 'teamwork'], url: 'https://example.com/logistics' },
    { id: 'd0000000-0000-4000-8000-000000000014', title: 'Teaching Methods', provider: 'Ministry of Education', description: 'Classroom management and lesson planning.', skills: ['teaching', 'communication'], url: 'https://example.com/teaching' },
    { id: 'd0000000-0000-4000-8000-000000000015', title: 'React Native Mobile Apps', provider: 'JobMatch Academy', description: 'Cross-platform mobile development.', skills: ['react native', 'javascript'], url: 'https://example.com/rn' },
  ];

  for (const course of courses) {
    await prisma.trainingCourse.upsert({
      where: { id: course.id },
      update: {
        title: course.title,
        provider: course.provider,
        description: course.description,
        skills: course.skills,
        url: course.url,
        status: TrainingCourseStatus.ACTIVE,
      },
      create: { ...course, status: TrainingCourseStatus.ACTIVE },
    });
  }

  const notifications = [
    { userId: userIds.bah, title: 'Application shortlisted', message: 'Your application for Frontend Developer was shortlisted.', type: NotificationType.APPLICATION, read: false },
    { userId: userIds.bah, title: 'New job match', message: 'Customer Support Specialist is a 91% match for your profile.', type: NotificationType.JOB, read: false },
    { userId: userIds.bah, title: 'Training recommendation', message: 'SQL Basics may help close your skills gap.', type: NotificationType.INFO, read: true },
    { userId: userIds.fatou, title: 'Interview scheduled', message: 'Atlantic Tech invited you to interview for Frontend Developer.', type: NotificationType.APPLICATION, read: false },
    { userId: userIds.fatou, title: 'New message', message: 'You have a new message from Kotu Digital.', type: NotificationType.CHAT, read: false },
    { userId: userIds.employerAtlantic, title: 'New application', message: 'Fatou A. applied for Frontend Developer (94% match).', type: NotificationType.APPLICATION, read: false },
    { userId: userIds.employerAtlantic, title: 'Job published', message: 'Data Analyst is now live on JobMatch AI.', type: NotificationType.JOB, read: true },
    { userId: userIds.employerRiver, title: 'Account pending', message: 'Your employer account is awaiting admin approval.', type: NotificationType.WARNING, read: false },
    { userId: userIds.mariama, title: 'Interview reminder', message: 'Junior Accountant interview tomorrow at 10:00.', type: NotificationType.APPLICATION, read: false },
    { userId: userIds.aisha, title: 'Congratulations!', message: 'You were hired for Community Health Nurse.', type: NotificationType.SUCCESS, read: false },
    ...(userIds.admin
      ? [{ userId: userIds.admin, title: 'Jobs pending review', message: '3 job postings await moderation.', type: NotificationType.SYSTEM, read: false }]
      : []),
    { userId: userIds.omar, title: 'Application update', message: 'Your Sales Representative application moved to interview.', type: NotificationType.APPLICATION, read: true },
    { userId: userIds.haddy, title: 'Skills gap insight', message: 'Complete Figma UI Design to improve UX Designer matches.', type: NotificationType.INFO, read: false },
    { userId: userIds.samba, title: 'New job match', message: 'Delivery Driver is a 96% match for your profile.', type: NotificationType.JOB, read: false },
    { userId: userIds.kaddy, title: 'Training path', message: 'Teaching Methods course recommended for Vocational Trainer.', type: NotificationType.INFO, read: true },
    { userId: userIds.modou, title: 'Interview invite', message: 'Kotu Digital wants to interview you for Backend Developer.', type: NotificationType.APPLICATION, read: false },
    { userId: userIds.laminSeeker, title: 'Application shortlisted', message: 'Your Data Analyst application was shortlisted.', type: NotificationType.APPLICATION, read: false },
    { userId: userIds.ibrahim, title: 'Skills match', message: 'Electrician role at West Coast Agro is a 93% match.', type: NotificationType.JOB, read: false },
    { userId: userIds.employerKotu, title: 'New applicant', message: 'Modou Sarr applied for Backend Developer (82% match).', type: NotificationType.APPLICATION, read: false },
    { userId: userIds.employerFinance, title: 'Interview scheduled', message: 'Mariama Sowe confirmed Junior Accountant interview.', type: NotificationType.APPLICATION, read: true },
    { userId: userIds.binta, title: 'Career insight', message: 'Your profile aligns well with IT Project Manager roles.', type: NotificationType.INFO, read: false },
  ];

  for (const [index, notif] of notifications.entries()) {
    const id = `e0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
    await prisma.notification.upsert({
      where: { id },
      update: notif,
      create: { id, ...notif, createdAt: daysAgo(index + 1) },
    });
  }

  const t = SEED_IDS.threads;

  const threadDefs = [
    { id: t.bahFrontend, employerId: userIds.employerAtlantic, applicantId: userIds.bah, jobId: j.frontend, status: ChatThreadStatus.OPEN, lastMessageAt: daysAgo(1) },
    { id: t.fatouFrontend, employerId: userIds.employerAtlantic, applicantId: userIds.fatou, jobId: j.frontend, status: ChatThreadStatus.OPEN, lastMessageAt: daysAgo(2) },
    { id: t.bahData, employerId: userIds.employerAtlantic, applicantId: userIds.bah, jobId: j.dataAnalyst, status: ChatThreadStatus.CLOSED, lastMessageAt: daysAgo(5) },
    { id: t.modouBackend, employerId: userIds.employerKotu, applicantId: userIds.modou, jobId: j.backendDev, status: ChatThreadStatus.OPEN, lastMessageAt: daysAgo(1) },
    { id: t.omarSales, employerId: userIds.employerRetail, applicantId: userIds.omar, jobId: j.salesRep, status: ChatThreadStatus.OPEN, lastMessageAt: daysAgo(3) },
    { id: t.mariamaAccountant, employerId: userIds.employerFinance, applicantId: userIds.mariama, jobId: j.accountant, status: ChatThreadStatus.OPEN, lastMessageAt: daysAgo(2) },
    { id: t.fatouMobile, employerId: userIds.employerKotu, applicantId: userIds.fatou, jobId: j.mobileDev, status: ChatThreadStatus.OPEN, lastMessageAt: daysAgo(4) },
  ];

  for (const thread of threadDefs) {
    await prisma.chatThread.upsert({
      where: { id: thread.id },
      update: { lastMessageAt: thread.lastMessageAt, status: thread.status },
      create: thread,
    });
  }

  const messages = [
    { id: 'f0000000-0000-4000-8000-000000000001', threadId: t.bahFrontend, senderId: userIds.employerAtlantic, content: 'Hi Bah, thanks for applying. Can you share your React experience?', createdAt: daysAgo(2) },
    { id: 'f0000000-0000-4000-8000-000000000002', threadId: t.bahFrontend, senderId: userIds.bah, content: 'Hello! I have been building web apps with JavaScript for 2 years.', createdAt: daysAgo(2) },
    { id: 'f0000000-0000-4000-8000-000000000003', threadId: t.bahFrontend, senderId: userIds.employerAtlantic, content: 'Great — we would like to schedule a short video call this week.', createdAt: daysAgo(1) },
    { id: 'f0000000-0000-4000-8000-000000000004', threadId: t.fatouFrontend, senderId: userIds.employerAtlantic, content: 'Fatou, your portfolio looks strong. Are you available for an onsite interview?', createdAt: daysAgo(3) },
    { id: 'f0000000-0000-4000-8000-000000000005', threadId: t.fatouFrontend, senderId: userIds.fatou, content: 'Yes, I am available Thursday or Friday morning.', createdAt: daysAgo(2) },
    { id: 'f0000000-0000-4000-8000-000000000006', threadId: t.bahData, senderId: userIds.employerAtlantic, content: 'We are reviewing your data analyst application.', createdAt: daysAgo(6) },
    { id: 'f0000000-0000-4000-8000-000000000007', threadId: t.bahData, senderId: userIds.bah, content: 'Thank you — happy to complete a skills assessment if needed.', createdAt: daysAgo(5) },
    { id: 'f0000000-0000-4000-8000-000000000008', threadId: t.modouBackend, senderId: userIds.employerKotu, content: 'Modou, we liked your Java background. Can you walk us through a recent API project?', createdAt: daysAgo(2) },
    { id: 'f0000000-0000-4000-8000-000000000009', threadId: t.modouBackend, senderId: userIds.modou, content: 'Sure — I built a REST API with Spring Boot and PostgreSQL for an inventory system.', createdAt: daysAgo(1) },
    { id: 'f0000000-0000-4000-8000-00000000000a', threadId: t.modouBackend, senderId: userIds.employerKotu, content: 'Perfect. Let us schedule a technical interview for next Tuesday.', createdAt: daysAgo(1) },
    { id: 'f0000000-0000-4000-8000-00000000000b', threadId: t.omarSales, senderId: userIds.employerRetail, content: 'Omar, your sales experience stands out. Are you comfortable with field visits in Serrekunda?', createdAt: daysAgo(4) },
    { id: 'f0000000-0000-4000-8000-00000000000c', threadId: t.omarSales, senderId: userIds.omar, content: 'Absolutely — I have covered Greater Banjul routes for 3 years.', createdAt: daysAgo(3) },
    { id: 'f0000000-0000-4000-8000-00000000000d', threadId: t.mariamaAccountant, senderId: userIds.employerFinance, content: 'Mariama, please bring your QuickBooks certification to the interview.', createdAt: daysAgo(3) },
    { id: 'f0000000-0000-4000-8000-00000000000e', threadId: t.mariamaAccountant, senderId: userIds.mariama, content: 'Will do. I also have Excel modelling samples to share.', createdAt: daysAgo(2) },
    { id: 'f0000000-0000-4000-8000-00000000000f', threadId: t.fatouMobile, senderId: userIds.employerKotu, content: 'Fatou, your React skills are a great fit for our mobile team too.', createdAt: daysAgo(5) },
    { id: 'f0000000-0000-4000-8000-000000000010', threadId: t.fatouMobile, senderId: userIds.fatou, content: 'I have been learning React Native — happy to discuss my side projects.', createdAt: daysAgo(4) },
  ];

  for (const msg of messages) {
    await prisma.chatMessage.upsert({
      where: { id: msg.id },
      update: { content: msg.content },
      create: msg,
    });
  }

  const messageReads = [
    { id: 'f1000000-0000-4000-8000-000000000001', messageId: 'f0000000-0000-4000-8000-000000000001', userId: userIds.bah, readAt: daysAgo(2) },
    { id: 'f1000000-0000-4000-8000-000000000002', messageId: 'f0000000-0000-4000-8000-000000000003', userId: userIds.bah, readAt: daysAgo(1) },
    { id: 'f1000000-0000-4000-8000-000000000003', messageId: 'f0000000-0000-4000-8000-000000000004', userId: userIds.fatou, readAt: daysAgo(3) },
    { id: 'f1000000-0000-4000-8000-000000000004', messageId: 'f0000000-0000-4000-8000-000000000008', userId: userIds.modou, readAt: daysAgo(2) },
    { id: 'f1000000-0000-4000-8000-000000000005', messageId: 'f0000000-0000-4000-8000-00000000000a', userId: userIds.employerKotu, readAt: daysAgo(1) },
  ];

  for (const read of messageReads) {
    await prisma.chatMessageRead.upsert({
      where: { messageId_userId: { messageId: read.messageId, userId: read.userId } },
      update: { readAt: read.readAt },
      create: read,
    });
  }

  const coachMessages = [
    { id: 'h0000000-0000-4000-8000-000000000001', userId: userIds.bah, role: CoachMessageRole.USER, content: 'I want to become a frontend developer in Banjul. What should I focus on?', createdAt: daysAgo(7) },
    { id: 'h0000000-0000-4000-8000-000000000002', userId: userIds.bah, role: CoachMessageRole.ASSISTANT, content: 'Based on your skills (JavaScript, HTML), prioritize React and TypeScript. Atlantic Tech and Kotu Digital often hire juniors — tailor your CV to those stacks and apply to their published frontend roles.', createdAt: daysAgo(7) },
    { id: 'h0000000-0000-4000-8000-000000000003', userId: userIds.bah, role: CoachMessageRole.USER, content: 'Should I take any training courses first?', createdAt: daysAgo(6) },
    { id: 'h0000000-0000-4000-8000-000000000004', userId: userIds.bah, role: CoachMessageRole.ASSISTANT, content: 'Yes — React for Beginners and TypeScript Fundamentals will close your biggest gaps. SQL Basics is optional but useful if you target data-adjacent roles too.', createdAt: daysAgo(6) },
    { id: 'h0000000-0000-4000-8000-000000000005', userId: userIds.fatou, role: CoachMessageRole.USER, content: 'I have 3 years of React experience. How can I stand out for senior roles?', createdAt: daysAgo(5) },
    { id: 'h0000000-0000-4000-8000-000000000006', userId: userIds.fatou, role: CoachMessageRole.ASSISTANT, content: 'Highlight measurable impact on past projects, contribute to open source, and consider React Native — Kotu Digital has a mobile developer opening that matches your profile well.', createdAt: daysAgo(5) },
    { id: 'h0000000-0000-4000-8000-000000000007', userId: userIds.laminSeeker, role: CoachMessageRole.USER, content: 'I am interested in data analyst jobs but only have 1 year of experience.', createdAt: daysAgo(4) },
    { id: 'h0000000-0000-4000-8000-000000000008', userId: userIds.laminSeeker, role: CoachMessageRole.ASSISTANT, content: 'Your Python and SQL skills are a solid foundation. Complete Python for Data Analysis, build a small portfolio project with Gambian labour-market data, and apply to the Data Analyst role at Atlantic Tech — you are already shortlisted.', createdAt: daysAgo(4) },
    { id: 'h0000000-0000-4000-8000-000000000009', userId: userIds.mariama, role: CoachMessageRole.USER, content: 'What salary range should I expect for accountant roles in Banjul?', createdAt: daysAgo(3) },
    { id: 'h0000000-0000-4000-8000-00000000000a', userId: userIds.mariama, role: CoachMessageRole.ASSISTANT, content: 'Junior accountant roles at Banjul Finance Group list GMD 22,000–32,000. With 4 years of experience and QuickBooks skills, you are well positioned — prepare for behavioural and technical questions.', createdAt: daysAgo(3) },
  ];

  for (const coach of coachMessages) {
    await prisma.coachMessage.upsert({
      where: { id: coach.id },
      update: { content: coach.content, role: coach.role },
      create: coach,
    });
  }

  const auditLogs = userIds.admin
    ? [
        { id: 'g0000000-0000-4000-8000-000000000001', actorId: userIds.admin, action: 'JOB_MODERATED', entityType: 'job', entityId: j.frontend, metadata: { decision: 'approved' } },
        { id: 'g0000000-0000-4000-8000-000000000002', actorId: userIds.admin, action: 'USER_APPROVED', entityType: 'user', entityId: userIds.employerAtlantic, metadata: { company: 'Atlantic Tech' } },
        { id: 'g0000000-0000-4000-8000-000000000003', actorId: userIds.admin, action: 'JOB_MODERATED', entityType: 'job', entityId: j.warehouse, metadata: { decision: 'pending' } },
        { id: 'g0000000-0000-4000-8000-000000000004', actorId: userIds.admin, action: 'SETTINGS_UPDATED', entityType: 'platform', metadata: { aiEnabled: true } },
        { id: 'g0000000-0000-4000-8000-000000000005', actorId: userIds.admin, action: 'JOB_MODERATED', entityType: 'job', entityId: j.logistics, metadata: { decision: 'rejected' } },
        { id: 'g0000000-0000-4000-8000-000000000006', actorId: userIds.admin, action: 'USER_BLOCKED', entityType: 'user', entityId: userIds.yusupha, metadata: { blocked: false, note: 'review cleared' } },
        { id: 'g0000000-0000-4000-8000-000000000007', actorId: userIds.admin, action: 'JOB_MODERATED', entityType: 'job', entityId: j.callCenter, metadata: { decision: 'pending' } },
        { id: 'g0000000-0000-4000-8000-000000000008', actorId: userIds.admin, action: 'USER_APPROVED', entityType: 'user', entityId: userIds.employerKotu, metadata: { company: 'Kotu Digital' } },
        { id: 'g0000000-0000-4000-8000-000000000009', actorId: userIds.admin, action: 'APPLICATION_REVIEWED', entityType: 'application', entityId: j.nurse, metadata: { status: 'hired', applicant: 'aisha@gmail.com' } },
      ]
    : [];

  for (const [index, log] of auditLogs.entries()) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: log,
      create: { ...log, createdAt: daysAgo(index + 2) },
    });
  }

  await prisma.platformSetting.upsert({
    where: { id: 'global' },
    update: {
      aiEngineUrl: process.env.AI_ENGINE_URL ?? 'http://localhost:8000',
      aiMatchThreshold: 70,
      aiEnabled: true,
      careerChatEnabled: true,
      resumeParsingEnabled: true,
    },
    create: {
      id: 'global',
      aiEngineUrl: process.env.AI_ENGINE_URL ?? 'http://localhost:8000',
      aiMatchThreshold: 70,
      aiEnabled: true,
      careerChatEnabled: true,
      resumeParsingEnabled: true,
    },
  });

  await prisma.user.updateMany({
    where: { emailVerified: false },
    data: { emailVerified: true, emailVerificationToken: null },
  });

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.job.count(),
    prisma.application.count(),
    prisma.trainingCourse.count(),
    prisma.notification.count(),
    prisma.chatThread.count(),
    prisma.chatMessage.count(),
    prisma.coachMessage.count(),
    prisma.auditLog.count(),
  ]);

  return {
    users: counts[0],
    jobs: counts[1],
    applications: counts[2],
    trainingCourses: counts[3],
    notifications: counts[4],
    chatThreads: counts[5],
    chatMessages: counts[6],
    coachMessages: counts[7],
    auditLogs: counts[8],
    locations: GAMBIAN_LOCATIONS.length,
  };
}
