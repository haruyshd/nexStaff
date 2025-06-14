// NexStaff Data Management System
// Centralized data storage and synchronization between client and admin

class NexStaffDataManager {
    constructor() {
        this.storageKeys = {
            jobs: 'nexstaff_jobs',
            candidates: 'nexstaff_candidates',
            employers: 'nexstaff_employers',
            applications: 'nexstaff_applications',
            employees: 'nexstaff_employees'
        };
        
        this.init();
    }

    init() {
        // Initialize with sample data if not exists
        this.initializeJobs();
        this.initializeCandidates();
        this.initializeEmployers();
        this.initializeApplications();
        this.initializeEmployees();
    }

    initializeJobs() {
        if (!localStorage.getItem(this.storageKeys.jobs)) {
            const jobs = [
                {
                    id: 'JOB001',
                    title: 'Senior Software Engineer',
                    company: 'NexTech Solutions',
                    employerId: 'EMP001',
                    department: 'Technology',
                    location: 'San Francisco, CA',
                    type: 'Full-time',
                    category: 'Technology',
                    salary: '$120,000 - $150,000',
                    description: 'Looking for an experienced software engineer to join our growing team. You will work on cutting-edge projects and mentor junior developers.',
                    requirements: [
                        '5+ years of software development experience',
                        'Strong proficiency in JavaScript, React, and Node.js',
                        'Experience with cloud platforms (AWS, Azure)',
                        'Strong problem-solving and communication skills'
                    ],
                    benefits: [
                        'Health, dental, and vision insurance',
                        'Flexible work hours and remote options',
                        'Professional development budget',
                        '401(k) with company matching'
                    ],
                    postedDate: '2025-06-01',
                    status: 'Active',
                    applicationsCount: 23,
                    urgency: 'High'
                },
                {
                    id: 'JOB002',
                    title: 'UI/UX Designer',
                    company: 'Creative Studios',
                    employerId: 'EMP002',
                    department: 'Design',
                    location: 'New York, NY',
                    type: 'Full-time',
                    category: 'Design',
                    salary: '$80,000 - $100,000',
                    description: 'Join our creative team as a UI/UX designer. You will be responsible for creating intuitive and beautiful user interfaces.',
                    requirements: [
                        '3+ years of UI/UX design experience',
                        'Proficiency in Figma, Sketch, and Adobe Creative Suite',
                        'Strong portfolio demonstrating design process',
                        'Understanding of user-centered design principles'
                    ],
                    benefits: [
                        'Creative work environment',
                        'Latest design tools and equipment',
                        'Flexible PTO policy',
                        'Design conference attendance'
                    ],
                    postedDate: '2025-05-28',
                    status: 'Active',
                    applicationsCount: 18,
                    urgency: 'Medium'
                },
                {
                    id: 'JOB003',
                    title: 'Marketing Manager',
                    company: 'Global Brands Inc',
                    employerId: 'EMP003',
                    department: 'Marketing',
                    location: 'Austin, TX',
                    type: 'Full-time',
                    category: 'Marketing',
                    salary: '$90,000 - $110,000',
                    description: 'Lead our marketing initiatives and drive brand awareness. Perfect opportunity for a strategic marketing professional.',
                    requirements: [
                        '4+ years of marketing experience',
                        'Digital marketing expertise (SEO, SEM, Social Media)',
                        'Team management experience',
                        'Analytics and data-driven decision making'
                    ],
                    benefits: [
                        'Competitive salary and bonuses',
                        'Marketing budget for campaigns',
                        'Travel opportunities',
                        'Stock options'
                    ],
                    postedDate: '2025-05-25',
                    status: 'On Hold',
                    applicationsCount: 31,
                    urgency: 'Low'
                },
                {
                    id: 'JOB004',
                    title: 'Data Analyst',
                    company: 'Analytics Pro',
                    employerId: 'EMP004',
                    department: 'Analytics',
                    location: 'Chicago, IL',
                    type: 'Full-time',
                    category: 'Data Science',
                    salary: '$75,000 - $95,000',
                    description: 'Analyze complex datasets to drive business insights and strategic decisions.',
                    requirements: [
                        '3+ years of data analysis experience',
                        'Proficiency in SQL, Python, and R',
                        'Experience with data visualization tools',
                        'Strong statistical analysis skills'
                    ],
                    benefits: [
                        'Remote work options',
                        'Learning and development budget',
                        'Health insurance',
                        'Flexible hours'
                    ],
                    postedDate: '2025-06-05',
                    status: 'Active',
                    applicationsCount: 15,
                    urgency: 'High'
                }
            ];
            
            localStorage.setItem(this.storageKeys.jobs, JSON.stringify(jobs));
        }
    }

    initializeCandidates() {
        if (!localStorage.getItem(this.storageKeys.candidates)) {
            const candidates = [
                {
                    id: 'CAN001',
                    name: 'Alice Johnson',
                    email: 'alice.johnson@email.com',
                    phone: '+1 (555) 123-4567',
                    location: 'San Francisco, CA',
                    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
                    experience: '5 years',
                    preferredRole: 'Senior Software Engineer',
                    currentRole: 'Software Engineer',
                    education: 'BS Computer Science - Stanford University',
                    status: 'Available',
                    resumeUrl: '/resumes/alice_johnson.pdf',
                    portfolioUrl: 'https://alicejohnson.dev',
                    linkedinUrl: 'https://linkedin.com/in/alicejohnson',
                    registeredDate: '2025-05-15',
                    lastActive: '2025-06-14',
                    appliedJobs: ['JOB001', 'JOB004'],
                    interviewsScheduled: 1,
                    salary_expectation: '$130,000',
                    availability: 'Immediate'
                },
                {
                    id: 'CAN002',
                    name: 'Bob Martinez',
                    email: 'bob.martinez@email.com',
                    phone: '+1 (555) 234-5678',
                    location: 'Austin, TX',
                    skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS'],
                    experience: '4 years',
                    preferredRole: 'Backend Developer',
                    currentRole: 'Full Stack Developer',
                    education: 'MS Software Engineering - UT Austin',
                    status: 'Interviewing',
                    resumeUrl: '/resumes/bob_martinez.pdf',
                    portfolioUrl: 'https://bobmartinez.tech',
                    linkedinUrl: 'https://linkedin.com/in/bobmartinez',
                    registeredDate: '2025-04-20',
                    lastActive: '2025-06-13',
                    appliedJobs: ['JOB003', 'JOB004'],
                    interviewsScheduled: 2,
                    salary_expectation: '$95,000',
                    availability: '2 weeks notice'
                },
                {
                    id: 'CAN003',
                    name: 'Carol Davis',
                    email: 'carol.davis@email.com',
                    phone: '+1 (555) 345-6789',
                    location: 'New York, NY',
                    skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
                    experience: '4 years',
                    preferredRole: 'Senior UI/UX Designer',
                    currentRole: 'UI/UX Designer',
                    education: 'BFA Graphic Design - Parsons School of Design',
                    status: 'Available',
                    resumeUrl: '/resumes/carol_davis.pdf',
                    portfolioUrl: 'https://caroldavis.design',
                    linkedinUrl: 'https://linkedin.com/in/caroldavis',
                    registeredDate: '2025-05-01',
                    lastActive: '2025-06-14',
                    appliedJobs: ['JOB002'],
                    interviewsScheduled: 0,
                    salary_expectation: '$85,000',
                    availability: 'Immediate'
                }
            ];
            
            localStorage.setItem(this.storageKeys.candidates, JSON.stringify(candidates));
        }
    }

    initializeEmployers() {
        if (!localStorage.getItem(this.storageKeys.employers)) {
            const employers = [
                {
                    id: 'EMP001',
                    companyName: 'NexTech Solutions',
                    industry: 'Technology',
                    location: 'San Francisco, CA',
                    website: 'https://nextechsolutions.com',
                    description: 'Leading technology company specializing in cloud solutions and software development.',
                    employeeCount: '50-200',
                    founded: '2018',
                    contactPerson: 'Michael Johnson',
                    contactEmail: 'm.johnson@nextechsolutions.com',
                    contactPhone: '+1 (555) 100-1001',
                    status: 'Active',
                    registeredDate: '2025-01-15',
                    lastActivity: '2025-06-14',
                    activeJobs: ['JOB001'],
                    totalApplications: 23,
                    hiredCandidates: 5,
                    averageTimeToHire: '21 days',
                    companySize: 'Medium',
                    benefits: ['Health Insurance', 'Flexible Hours', 'Remote Work', '401k']
                },
                {
                    id: 'EMP002',
                    companyName: 'Creative Studios',
                    industry: 'Design & Marketing',
                    location: 'New York, NY',
                    website: 'https://creativestudios.nyc',
                    description: 'Award-winning creative agency specializing in brand identity and digital experiences.',
                    employeeCount: '20-50',
                    founded: '2015',
                    contactPerson: 'Sarah Williams',
                    contactEmail: 's.williams@creativestudios.nyc',
                    contactPhone: '+1 (555) 200-2002',
                    status: 'Active',
                    registeredDate: '2025-02-10',
                    lastActivity: '2025-06-13',
                    activeJobs: ['JOB002'],
                    totalApplications: 18,
                    hiredCandidates: 3,
                    averageTimeToHire: '14 days',
                    companySize: 'Small',
                    benefits: ['Creative Environment', 'PTO', 'Design Tools', 'Conference Attendance']
                },
                {
                    id: 'EMP003',
                    companyName: 'Global Brands Inc',
                    industry: 'Marketing & Advertising',
                    location: 'Austin, TX',
                    website: 'https://globalbrands.com',
                    description: 'International marketing company with presence in 15+ countries.',
                    employeeCount: '200-500',
                    founded: '2010',
                    contactPerson: 'David Chen',
                    contactEmail: 'd.chen@globalbrands.com',
                    contactPhone: '+1 (555) 300-3003',
                    status: 'Active',
                    registeredDate: '2025-01-20',
                    lastActivity: '2025-06-12',
                    activeJobs: ['JOB003'],
                    totalApplications: 31,
                    hiredCandidates: 8,
                    averageTimeToHire: '28 days',
                    companySize: 'Large',
                    benefits: ['Competitive Salary', 'Stock Options', 'Travel Opportunities', 'Health Insurance']
                },
                {
                    id: 'EMP004',
                    companyName: 'Analytics Pro',
                    industry: 'Data & Analytics',
                    location: 'Chicago, IL',
                    website: 'https://analyticspro.com',
                    description: 'Data analytics consultancy helping businesses make data-driven decisions.',
                    employeeCount: '10-20',
                    founded: '2020',
                    contactPerson: 'Lisa Rodriguez',
                    contactEmail: 'l.rodriguez@analyticspro.com',
                    contactPhone: '+1 (555) 400-4004',
                    status: 'Active',
                    registeredDate: '2025-03-05',
                    lastActivity: '2025-06-14',
                    activeJobs: ['JOB004'],
                    totalApplications: 15,
                    hiredCandidates: 2,
                    averageTimeToHire: '18 days',
                    companySize: 'Startup',
                    benefits: ['Remote Work', 'Learning Budget', 'Flexible Hours', 'Health Insurance']
                }
            ];
            
            localStorage.setItem(this.storageKeys.employers, JSON.stringify(employers));
        }
    }

    initializeApplications() {
        if (!localStorage.getItem(this.storageKeys.applications)) {
            const applications = [
                {
                    id: 'APP001',
                    candidateId: 'CAN001',
                    candidateName: 'Alice Johnson',
                    jobId: 'JOB001',
                    jobTitle: 'Senior Software Engineer',
                    employerId: 'EMP001',
                    employerName: 'NexTech Solutions',
                    appliedDate: '2025-06-10',
                    status: 'Reviewing',
                    stage: 'Technical Review',
                    score: 85,
                    notes: 'Strong technical background, excellent portfolio',
                    interviewDate: '2025-06-15',
                    interviewTime: '10:00 AM',
                    interviewer: 'John Smith',
                    interviewType: 'Technical',
                    resumeUrl: '/resumes/alice_johnson.pdf',
                    coverLetter: 'I am excited to apply for the Senior Software Engineer position...',
                    expectedSalary: '$130,000',
                    availability: 'Immediate',
                    referenceContact: 'jane.doe@techcorp.com',
                    portfolioLinks: ['https://alicejohnson.dev', 'https://github.com/alicejohnson'],
                    lastUpdated: '2025-06-12'
                },
                {
                    id: 'APP002',
                    candidateId: 'CAN002',
                    candidateName: 'Bob Martinez',
                    jobId: 'JOB004',
                    jobTitle: 'Data Analyst',
                    employerId: 'EMP004',
                    employerName: 'Analytics Pro',
                    appliedDate: '2025-06-08',
                    status: 'Pending',
                    stage: 'Initial Review',
                    score: 92,
                    notes: 'Excellent analytical skills, strong Python background',
                    interviewDate: null,
                    interviewTime: null,
                    interviewer: null,
                    interviewType: null,
                    resumeUrl: '/resumes/bob_martinez.pdf',
                    coverLetter: 'With my strong background in data analysis and Python programming...',
                    expectedSalary: '$85,000',
                    availability: '2 weeks notice',
                    referenceContact: 'mike.johnson@datatech.com',
                    portfolioLinks: ['https://bobmartinez.tech', 'https://github.com/bobmartinez'],
                    lastUpdated: '2025-06-08'
                },
                {
                    id: 'APP003',
                    candidateId: 'CAN003',
                    candidateName: 'Carol Davis',
                    jobId: 'JOB002',
                    jobTitle: 'UI/UX Designer',
                    employerId: 'EMP002',
                    employerName: 'Creative Studios',
                    appliedDate: '2025-06-05',
                    status: 'Approved',
                    stage: 'Final Interview',
                    score: 88,
                    notes: 'Outstanding design portfolio, great cultural fit',
                    interviewDate: '2025-06-16',
                    interviewTime: '2:00 PM',
                    interviewer: 'Sarah Williams',
                    interviewType: 'Final',
                    resumeUrl: '/resumes/carol_davis.pdf',
                    coverLetter: 'I am passionate about creating user-centered designs...',
                    expectedSalary: '$85,000',
                    availability: 'Immediate',
                    referenceContact: 'design.lead@creativeco.com',
                    portfolioLinks: ['https://caroldavis.design', 'https://dribbble.com/caroldavis'],
                    lastUpdated: '2025-06-12'
                }
            ];
            
            localStorage.setItem(this.storageKeys.applications, JSON.stringify(applications));
        }
    }

    initializeEmployees() {
        // Initialize employees if they don't exist (for admin dashboard)
        if (!localStorage.getItem(this.storageKeys.employees)) {
            const employees = [
                {
                    id: 'EMP001',
                    name: 'John Smith',
                    email: 'john.smith@nexstaff.com',
                    phone: '+1 (555) 123-4567',
                    department: 'Technology',
                    position: 'Software Engineer',
                    hireDate: '2024-01-15',
                    salary: 75000,
                    status: 'Active',
                    manager: 'Tech Lead',
                    location: 'San Francisco Office'
                },
                {
                    id: 'EMP002',
                    name: 'Sarah Johnson',
                    email: 'sarah.johnson@nexstaff.com',
                    phone: '+1 (555) 234-5678',
                    department: 'Marketing',
                    position: 'Marketing Manager',
                    hireDate: '2024-02-20',
                    salary: 68000,
                    status: 'Active',
                    manager: 'Marketing Director',
                    location: 'New York Office'
                },
                {
                    id: 'EMP003',
                    name: 'Mike Chen',
                    email: 'mike.chen@nexstaff.com',
                    phone: '+1 (555) 345-6789',
                    department: 'Technology',
                    position: 'Data Analyst',
                    hireDate: '2024-03-10',
                    salary: 62000,
                    status: 'Training',
                    manager: 'Data Science Lead',
                    location: 'Austin Office'
                }
            ];
            
            localStorage.setItem(this.storageKeys.employees, JSON.stringify(employees));
        }
    }

    // CRUD Operations for Jobs
    getJobs() {
        return JSON.parse(localStorage.getItem(this.storageKeys.jobs)) || [];
    }

    getJob(id) {
        const jobs = this.getJobs();
        return jobs.find(job => job.id === id);
    }

    addJob(job) {
        const jobs = this.getJobs();
        job.id = job.id || 'JOB' + String(jobs.length + 1).padStart(3, '0');
        job.postedDate = job.postedDate || new Date().toISOString().split('T')[0];
        job.status = job.status || 'Active';
        job.applicationsCount = job.applicationsCount || 0;
        jobs.push(job);
        localStorage.setItem(this.storageKeys.jobs, JSON.stringify(jobs));
        return job;
    }

    updateJob(id, updates) {
        const jobs = this.getJobs();
        const index = jobs.findIndex(job => job.id === id);
        if (index !== -1) {
            jobs[index] = { ...jobs[index], ...updates };
            localStorage.setItem(this.storageKeys.jobs, JSON.stringify(jobs));
            return jobs[index];
        }
        return null;
    }

    deleteJob(id) {
        const jobs = this.getJobs();
        const filteredJobs = jobs.filter(job => job.id !== id);
        localStorage.setItem(this.storageKeys.jobs, JSON.stringify(filteredJobs));
        return true;
    }

    // CRUD Operations for Candidates
    getCandidates() {
        return JSON.parse(localStorage.getItem(this.storageKeys.candidates)) || [];
    }

    getCandidate(id) {
        const candidates = this.getCandidates();
        return candidates.find(candidate => candidate.id === id);
    }

    addCandidate(candidate) {
        const candidates = this.getCandidates();
        candidate.id = candidate.id || 'CAN' + String(candidates.length + 1).padStart(3, '0');
        candidate.registeredDate = candidate.registeredDate || new Date().toISOString().split('T')[0];
        candidate.status = candidate.status || 'Available';
        candidate.appliedJobs = candidate.appliedJobs || [];
        candidates.push(candidate);
        localStorage.setItem(this.storageKeys.candidates, JSON.stringify(candidates));
        return candidate;
    }

    updateCandidate(id, updates) {
        const candidates = this.getCandidates();
        const index = candidates.findIndex(candidate => candidate.id === id);
        if (index !== -1) {
            candidates[index] = { ...candidates[index], ...updates };
            localStorage.setItem(this.storageKeys.candidates, JSON.stringify(candidates));
            return candidates[index];
        }
        return null;
    }

    // CRUD Operations for Employers
    getEmployers() {
        return JSON.parse(localStorage.getItem(this.storageKeys.employers)) || [];
    }

    getEmployer(id) {
        const employers = this.getEmployers();
        return employers.find(employer => employer.id === id);
    }

    addEmployer(employer) {
        const employers = this.getEmployers();
        employer.id = employer.id || 'EMP' + String(employers.length + 1).padStart(3, '0');
        employer.registeredDate = employer.registeredDate || new Date().toISOString().split('T')[0];
        employer.status = employer.status || 'Active';
        employers.push(employer);
        localStorage.setItem(this.storageKeys.employers, JSON.stringify(employers));
        return employer;
    }

    updateEmployer(id, updates) {
        const employers = this.getEmployers();
        const index = employers.findIndex(employer => employer.id === id);
        if (index !== -1) {
            employers[index] = { ...employers[index], ...updates };
            localStorage.setItem(this.storageKeys.employers, JSON.stringify(employers));
            return employers[index];
        }
        return null;
    }

    // CRUD Operations for Applications
    getApplications() {
        return JSON.parse(localStorage.getItem(this.storageKeys.applications)) || [];
    }

    getApplication(id) {
        const applications = this.getApplications();
        return applications.find(application => application.id === id);
    }

    addApplication(application) {
        const applications = this.getApplications();
        application.id = application.id || 'APP' + String(applications.length + 1).padStart(3, '0');
        application.appliedDate = application.appliedDate || new Date().toISOString().split('T')[0];
        application.status = application.status || 'Pending';
        application.lastUpdated = new Date().toISOString().split('T')[0];
        applications.push(application);
        localStorage.setItem(this.storageKeys.applications, JSON.stringify(applications));
        
        // Update job application count
        this.updateJobApplicationCount(application.jobId);
        
        return application;
    }

    updateApplication(id, updates) {
        const applications = this.getApplications();
        const index = applications.findIndex(application => application.id === id);
        if (index !== -1) {
            applications[index] = { ...applications[index], ...updates, lastUpdated: new Date().toISOString().split('T')[0] };
            localStorage.setItem(this.storageKeys.applications, JSON.stringify(applications));
            return applications[index];
        }
        return null;
    }

    // Helper Methods
    updateJobApplicationCount(jobId) {
        const applications = this.getApplications();
        const count = applications.filter(app => app.jobId === jobId).length;
        this.updateJob(jobId, { applicationsCount: count });
    }

    getJobsForClient() {
        // Return jobs formatted for client-side display
        return this.getJobs().filter(job => job.status === 'Active').map(job => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            category: job.category,
            description: job.description,
            requirements: job.requirements,
            salary: job.salary,
            benefits: job.benefits
        }));
    }

    getCandidatesForClient() {
        // Return candidates formatted for client-side display (public profiles)
        return this.getCandidates().filter(candidate => candidate.status === 'Available').map(candidate => ({
            id: candidate.id,
            name: candidate.name,
            skills: candidate.skills,
            experience: candidate.experience,
            preferredRole: candidate.preferredRole,
            location: candidate.location,
            portfolioUrl: candidate.portfolioUrl
        }));
    }

    getEmployersForClient() {
        // Return employers formatted for client-side display
        return this.getEmployers().filter(employer => employer.status === 'Active').map(employer => ({
            id: employer.id,
            companyName: employer.companyName,
            industry: employer.industry,
            location: employer.location,
            description: employer.description,
            website: employer.website,
            activeJobs: employer.activeJobs?.length || 0
        }));
    }

    // Statistics for Admin Dashboard
    getStatistics() {
        const jobs = this.getJobs();
        const candidates = this.getCandidates();
        const employers = this.getEmployers();
        const applications = this.getApplications();
        const employees = JSON.parse(localStorage.getItem(this.storageKeys.employees)) || [];

        return {
            totalJobs: jobs.length,
            activeJobs: jobs.filter(job => job.status === 'Active').length,
            totalCandidates: candidates.length,
            availableCandidates: candidates.filter(candidate => candidate.status === 'Available').length,
            totalEmployers: employers.length,
            activeEmployers: employers.filter(employer => employer.status === 'Active').length,
            totalApplications: applications.length,
            pendingApplications: applications.filter(app => app.status === 'Pending').length,
            totalEmployees: employees.length,
            activeEmployees: employees.filter(emp => emp.status === 'Active').length
        };
    }
}

// Initialize the data manager
const nexStaffData = new NexStaffDataManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NexStaffDataManager;
}
