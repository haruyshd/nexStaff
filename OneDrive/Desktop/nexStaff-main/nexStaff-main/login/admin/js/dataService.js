// Shared data service for synchronization
const DataService = {
    subscribers: new Set(),

    // Subscribe to data changes
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    },

    // Notify all subscribers of data changes
    notifySubscribers() {
        this.subscribers.forEach(callback => callback());
    },

    // Generic CRUD Operations
    create(entityType, data) {
        try {
            const items = this.getAll(entityType);
            const newItem = {
                ...data,
                id: data.id || Date.now() + Math.random(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            items.push(newItem);
            localStorage.setItem(entityType, JSON.stringify(items));
            this.notifySubscribers();
            return newItem;
        } catch (error) {
            console.error(`Error creating ${entityType}:`, error);
            return null;
        }
    },

    getAll(entityType) {
        try {
            return JSON.parse(localStorage.getItem(entityType)) || [];
        } catch (error) {
            console.error(`Error getting ${entityType}:`, error);
            return [];
        }
    },

    getById(entityType, id) {
        try {
            const items = this.getAll(entityType);
            return items.find(item => item.id == id) || null;
        } catch (error) {
            console.error(`Error getting ${entityType} by ID:`, error);
            return null;
        }
    },

    update(entityType, id, data) {
        try {
            const items = this.getAll(entityType);
            const index = items.findIndex(item => item.id == id);
            if (index !== -1) {
                items[index] = {
                    ...items[index],
                    ...data,
                    id: items[index].id, // Preserve original ID
                    createdAt: items[index].createdAt, // Preserve creation date
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem(entityType, JSON.stringify(items));
                this.notifySubscribers();
                return items[index];
            }
            return null;
        } catch (error) {
            console.error(`Error updating ${entityType}:`, error);
            return null;
        }
    },

    delete(entityType, id) {
        try {
            const items = this.getAll(entityType);
            const filteredItems = items.filter(item => item.id != id);
            if (filteredItems.length < items.length) {
                localStorage.setItem(entityType, JSON.stringify(filteredItems));
                this.notifySubscribers();
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Error deleting ${entityType}:`, error);
            return false;
        }
    },

    // Bulk operations
    bulkDelete(entityType, ids) {
        try {
            const items = this.getAll(entityType);
            const filteredItems = items.filter(item => !ids.includes(item.id));
            localStorage.setItem(entityType, JSON.stringify(filteredItems));
            this.notifySubscribers();
            return true;
        } catch (error) {
            console.error(`Error bulk deleting ${entityType}:`, error);
            return false;
        }
    },

    search(entityType, query, fields = []) {
        try {
            const items = this.getAll(entityType);
            if (!query) return items;
            
            const lowerQuery = query.toLowerCase();
            return items.filter(item => {
                if (fields.length === 0) {
                    // Search all string fields
                    return Object.values(item).some(value => 
                        typeof value === 'string' && value.toLowerCase().includes(lowerQuery)
                    );
                } else {
                    // Search specific fields
                    return fields.some(field => 
                        item[field] && typeof item[field] === 'string' && 
                        item[field].toLowerCase().includes(lowerQuery)
                    );
                }
            });
        } catch (error) {
            console.error(`Error searching ${entityType}:`, error);
            return [];
        }
    },

    // Load employer profiles with teams
    loadEmployerProfiles() {
        try {
            const employers = JSON.parse(localStorage.getItem('employerProfiles')) || [];
            const teams = JSON.parse(localStorage.getItem('teams')) || [];
            
            console.log('DataService: Loading profiles and teams', { employers, teams });

            // Match teams with employers
            const updatedEmployers = employers.map(employer => {
                const employerTeams = teams.filter(team => 
                    team.email && employer.email && 
                    team.email.toLowerCase() === employer.email.toLowerCase()
                );
                return {
                    ...employer,
                    teams: employerTeams,
                    updatedAt: employer.updatedAt || employer.createdAt
                };
            });

            return updatedEmployers;
        } catch (error) {
            console.error('DataService: Error loading data', error);
            return [];
        }
    },

    // Save a new team and update employer profiles
    saveTeam(teamData) {
        try {
            // Load existing data
            const teams = JSON.parse(localStorage.getItem('teams')) || [];
            const employers = JSON.parse(localStorage.getItem('employerProfiles')) || [];

            // Add new team
            teams.push(teamData);
            localStorage.setItem('teams', JSON.stringify(teams));

            // Update employer profiles
            const updatedEmployers = employers.map(employer => {
                if (employer.email && teamData.email && 
                    employer.email.toLowerCase() === teamData.email.toLowerCase()) {
                    return {
                        ...employer,
                        teams: [...(employer.teams || []), teamData],
                        updatedAt: new Date().toISOString()
                    };
                }
                return employer;
            });

            localStorage.setItem('employerProfiles', JSON.stringify(updatedEmployers));
            
            console.log('DataService: Team saved and profiles updated', { teamData, updatedEmployers });
            
            // Notify subscribers of data change
            this.notifySubscribers();
            
            return true;
        } catch (error) {
            console.error('DataService: Error saving team', error);
            return false;
        }
    },

    // Initialize real-time sync
    initSync() {
        console.log('DataService: Initializing sync');
        
        // Listen for storage events (changes from other tabs)
        window.addEventListener('storage', (event) => {
            if (event.key === 'teams' || event.key === 'employerProfiles' || 
                event.key === 'employees' || event.key === 'candidates' || 
                event.key === 'jobs' || event.key === 'events' || event.key === 'applications') {
                console.log('DataService: Storage changed', event.key);
                this.notifySubscribers();
            }
        });

        // Set up periodic sync
        setInterval(() => {
            this.notifySubscribers();
        }, 2000); // Sync every 2 seconds
    },

    // Employee Management
    addEmployee(employee) {
        try {
            const employees = JSON.parse(localStorage.getItem('employees')) || [];
            employee.id = employee.id || Date.now();
            employee.createdAt = new Date().toISOString();
            employees.push(employee);
            localStorage.setItem('employees', JSON.stringify(employees));
            this.notifySubscribers();
            return true;
        } catch (error) {
            console.error('Error adding employee:', error);
            return false;
        }
    },

    getEmployees() {
        try {
            return JSON.parse(localStorage.getItem('employees')) || [];
        } catch (error) {
            console.error('Error getting employees:', error);
            return [];
        }
    },

    // Candidate Management
    addCandidate(candidate) {
        try {
            const candidates = JSON.parse(localStorage.getItem('candidates')) || [];
            candidate.id = candidate.id || Date.now();
            candidate.createdAt = new Date().toISOString();
            candidates.push(candidate);
            localStorage.setItem('candidates', JSON.stringify(candidates));
            this.notifySubscribers();
            return true;
        } catch (error) {
            console.error('Error adding candidate:', error);
            return false;
        }
    },

    getCandidates() {
        try {
            return JSON.parse(localStorage.getItem('candidates')) || [];
        } catch (error) {
            console.error('Error getting candidates:', error);
            return [];
        }
    },

    // Employer Management
    addEmployer(employer) {
        try {
            const employers = JSON.parse(localStorage.getItem('employers')) || [];
            employer.id = employer.id || Date.now();
            employer.createdAt = new Date().toISOString();
            employers.push(employer);
            localStorage.setItem('employers', JSON.stringify(employers));
            this.notifySubscribers();
            return true;
        } catch (error) {
            console.error('Error adding employer:', error);
            return false;
        }
    },

    getEmployers() {
        try {
            return JSON.parse(localStorage.getItem('employers')) || [];
        } catch (error) {
            console.error('Error getting employers:', error);
            return [];
        }
    },

    // Job Management
    addJob(job) {
        try {
            const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
            job.id = job.id || Date.now();
            job.createdAt = new Date().toISOString();
            jobs.push(job);
            localStorage.setItem('jobs', JSON.stringify(jobs));
            this.notifySubscribers();
            return true;
        } catch (error) {
            console.error('Error adding job:', error);
            return false;
        }
    },

    getJobs() {
        try {
            return JSON.parse(localStorage.getItem('jobs')) || [];
        } catch (error) {
            console.error('Error getting jobs:', error);
            return [];
        }
    },

    // Event/Schedule Management
    addEvent(event) {
        try {
            const events = JSON.parse(localStorage.getItem('events')) || [];
            event.id = event.id || Date.now();
            event.createdAt = new Date().toISOString();
            events.push(event);
            localStorage.setItem('events', JSON.stringify(events));
            this.notifySubscribers();
            return true;
        } catch (error) {
            console.error('Error adding event:', error);
            return false;
        }
    },

    getEvents() {
        try {
            return JSON.parse(localStorage.getItem('events')) || [];
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    },

    // Application Management
    addApplication(application) {
        try {
            const applications = JSON.parse(localStorage.getItem('applications')) || [];
            application.id = application.id || Date.now();
            application.createdAt = new Date().toISOString();
            applications.push(application);
            localStorage.setItem('applications', JSON.stringify(applications));
            this.notifySubscribers();
            return true;
        } catch (error) {
            console.error('Error adding application:', error);
            return false;
        }
    },

    // Team Management
    addTeam(teamData) {
        try {
            const teams = JSON.parse(localStorage.getItem('teams')) || [];
            teamData.id = teamData.id || Date.now();
            teamData.createdAt = new Date().toISOString();
            teams.push(teamData);
            localStorage.setItem('teams', JSON.stringify(teams));
            this.notifySubscribers();
            return true;
        } catch (error) {
            console.error('Error adding team:', error);
            return false;
        }
    },

    getTeams() {
        try {
            return JSON.parse(localStorage.getItem('teams')) || [];
        } catch (error) {
            console.error('Error getting teams:', error);
            return [];
        }
    },

    getApplications() {
        try {
            return JSON.parse(localStorage.getItem('applications')) || [];
        } catch (error) {
            console.error('Error getting applications:', error);
            return [];
        }
    },

    updateApplicationStatus(id, status, notes) {
        try {
            const applications = JSON.parse(localStorage.getItem('applications')) || [];
            const application = applications.find(app => app.id == id);
            if (application) {
                application.status = status;
                application.notes = notes;
                application.lastUpdated = new Date().toISOString();
                localStorage.setItem('applications', JSON.stringify(applications));
                this.notifySubscribers();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating application status:', error);
            return false;
        }
    },

    // --- CRUD for Employees ---
    createEmployee(employee) {
        const employees = this.getEmployees();
        employee.id = employee.id || Date.now();
        employees.push(employee);
        localStorage.setItem('employees', JSON.stringify(employees));
        this.notifySubscribers();
        return employee;
    },
    readEmployees() {
        return this.getEmployees();
    },
    updateEmployee(updated) {
        let employees = this.getEmployees();
        employees = employees.map(emp => emp.id == updated.id ? {...emp, ...updated} : emp);
        localStorage.setItem('employees', JSON.stringify(employees));
        this.notifySubscribers();
        return updated;
    },
    deleteEmployee(id) {
        let employees = this.getEmployees();
        employees = employees.filter(emp => emp.id != id);
        localStorage.setItem('employees', JSON.stringify(employees));
        this.notifySubscribers();
    },

    // --- CRUD for Candidates ---
    createCandidate(candidate) {
        const candidates = this.getCandidates();
        candidate.id = candidate.id || Date.now();
        candidates.push(candidate);
        localStorage.setItem('candidates', JSON.stringify(candidates));
        this.notifySubscribers();
        return candidate;
    },
    readCandidates() {
        return this.getCandidates();
    },
    updateCandidate(updated) {
        let candidates = this.getCandidates();
        candidates = candidates.map(c => c.id == updated.id ? {...c, ...updated} : c);
        localStorage.setItem('candidates', JSON.stringify(candidates));
        this.notifySubscribers();
        return updated;
    },
    deleteCandidate(id) {
        let candidates = this.getCandidates();
        candidates = candidates.filter(c => c.id != id);
        localStorage.setItem('candidates', JSON.stringify(candidates));
        this.notifySubscribers();
    },

    // --- CRUD for Employers ---
    createEmployer(employer) {
        const employers = this.getEmployers();
        employer.id = employer.id || Date.now();
        employers.push(employer);
        localStorage.setItem('employers', JSON.stringify(employers));
        this.notifySubscribers();
        return employer;
    },
    readEmployers() {
        return this.getEmployers();
    },
    updateEmployer(updated) {
        let employers = this.getEmployers();
        employers = employers.map(e => e.id == updated.id ? {...e, ...updated} : e);
        localStorage.setItem('employers', JSON.stringify(employers));
        this.notifySubscribers();
        return updated;
    },
    deleteEmployer(id) {
        let employers = this.getEmployers();
        employers = employers.filter(e => e.id != id);
        localStorage.setItem('employers', JSON.stringify(employers));
        this.notifySubscribers();
    },

    // --- CRUD for Jobs ---
    createJob(job) {
        const jobs = this.getJobs();
        job.id = job.id || Date.now();
        jobs.push(job);
        localStorage.setItem('jobs', JSON.stringify(jobs));
        this.notifySubscribers();
        return job;
    },
    readJobs() {
        return this.getJobs();
    },
    updateJob(updated) {
        let jobs = this.getJobs();
        jobs = jobs.map(j => j.id == updated.id ? {...j, ...updated} : j);
        localStorage.setItem('jobs', JSON.stringify(jobs));
        this.notifySubscribers();
        return updated;
    },
    deleteJob(id) {
        let jobs = this.getJobs();
        jobs = jobs.filter(j => j.id != id);
        localStorage.setItem('jobs', JSON.stringify(jobs));
        this.notifySubscribers();
    },

    // --- CRUD for Applications ---
    createApplication(application) {
        const applications = this.getApplications();
        application.id = application.id || Date.now();
        applications.push(application);
        localStorage.setItem('applications', JSON.stringify(applications));
        this.notifySubscribers();
        return application;
    },
    readApplications() {
        return this.getApplications();
    },
    updateApplication(updated) {
        let applications = this.getApplications();
        applications = applications.map(a => a.id == updated.id ? {...a, ...updated} : a);
        localStorage.setItem('applications', JSON.stringify(applications));
        this.notifySubscribers();
        return updated;
    },
    deleteApplication(id) {
        let applications = this.getApplications();
        applications = applications.filter(a => a.id != id);
        localStorage.setItem('applications', JSON.stringify(applications));
        this.notifySubscribers();
    },

    // --- CRUD for Schedules ---
    createSchedule(schedule) {
        const schedules = this.getEvents();
        schedule.id = schedule.id || Date.now();
        schedules.push(schedule);
        localStorage.setItem('events', JSON.stringify(schedules));
        this.notifySubscribers();
        return schedule;
    },
    readSchedules() {
        return this.getEvents();
    },
    updateSchedule(updated) {
        let schedules = this.getEvents();
        schedules = schedules.map(s => s.id == updated.id ? {...s, ...updated} : s);
        localStorage.setItem('events', JSON.stringify(schedules));
        this.notifySubscribers();
        return updated;
    },
    deleteSchedule(id) {
        let schedules = this.getEvents();
        schedules = schedules.filter(s => s.id != id);
        localStorage.setItem('events', JSON.stringify(schedules));
        this.notifySubscribers();
    },

    // Initialize with sample data if localStorage is empty
    initializeSampleData() {
        if (!localStorage.getItem('employees') || JSON.parse(localStorage.getItem('employees')).length === 0) {
            const sampleEmployees = [
                {
                    id: 1,
                    name: 'John Smith',
                    email: 'john.smith@nexstaff.com',
                    phone: '+1-234-567-8901',
                    department: 'Technology',
                    position: 'Software Engineer',
                    hireDate: '2024-01-15',
                    salary: 75000,
                    status: 'Active'
                },
                {
                    id: 2,
                    name: 'Sarah Johnson',
                    email: 'sarah.johnson@nexstaff.com',
                    phone: '+1-234-567-8902',
                    department: 'Marketing',
                    position: 'Marketing Manager',
                    hireDate: '2024-02-20',
                    salary: 65000,
                    status: 'Active'
                }
            ];
            localStorage.setItem('employees', JSON.stringify(sampleEmployees));
        }

        if (!localStorage.getItem('candidates') || JSON.parse(localStorage.getItem('candidates')).length === 0) {
            const sampleCandidates = [
                {
                    id: 1,
                    name: 'Alice Brown',
                    email: 'alice.brown@email.com',
                    phone: '+1-234-567-8903',
                    skills: 'JavaScript, React, Node.js',
                    experience: '3 years',
                    education: 'Computer Science Degree',
                    status: 'Available'
                },
                {
                    id: 2,
                    name: 'Bob Wilson',
                    email: 'bob.wilson@email.com',
                    phone: '+1-234-567-8904',
                    skills: 'Python, Django, PostgreSQL',
                    experience: '5 years',
                    education: 'Software Engineering Degree',
                    status: 'Interviewing'
                }
            ];
            localStorage.setItem('candidates', JSON.stringify(sampleCandidates));
        }

        if (!localStorage.getItem('employers') || JSON.parse(localStorage.getItem('employers')).length === 0) {
            const sampleEmployers = [
                {
                    id: 1,
                    company: 'Tech Corp Inc.',
                    contactPerson: 'Michael Davis',
                    email: 'contact@techcorp.com',
                    phone: '+1-234-567-8905',
                    industry: 'Technology',
                    address: '123 Tech Street, Silicon Valley',
                    status: 'Active'
                },
                {
                    id: 2,
                    company: 'Healthcare Solutions',
                    contactPerson: 'Lisa Chen',
                    email: 'hr@healthcaresolutions.com',
                    phone: '+1-234-567-8906',
                    industry: 'Healthcare',
                    address: '456 Medical Ave, Health City',
                    status: 'Active'
                }
            ];
            localStorage.setItem('employers', JSON.stringify(sampleEmployers));
        }

        if (!localStorage.getItem('jobs') || JSON.parse(localStorage.getItem('jobs')).length === 0) {
            const sampleJobs = [
                {
                    id: 1,
                    title: 'Senior Software Engineer',
                    company: 'Tech Corp Inc.',
                    location: 'San Francisco, CA',
                    type: 'Full-time',
                    salary: '$90,000 - $120,000',
                    description: 'We are looking for a senior software engineer...',
                    requirements: 'Bachelor\'s degree, 5+ years experience...',
                    deadline: '2025-07-15',
                    status: 'Open'
                },
                {
                    id: 2,
                    title: 'Marketing Specialist',
                    company: 'Healthcare Solutions',
                    location: 'New York, NY',
                    type: 'Full-time',
                    salary: '$50,000 - $70,000',
                    description: 'Join our marketing team...',
                    requirements: 'Marketing degree, 2+ years experience...',
                    deadline: '2025-08-01',
                    status: 'Open'
                }
            ];
            localStorage.setItem('jobs', JSON.stringify(sampleJobs));
        }        if (!localStorage.getItem('applications') || JSON.parse(localStorage.getItem('applications')).length === 0) {
            const sampleApplications = [
                {
                    id: 1,
                    candidateName: 'Alice Brown',
                    email: 'alice.brown@email.com',
                    phone: '+1-234-567-8903',
                    jobPosition: 'Senior Software Engineer',
                    applicationDate: '2025-06-01',
                    status: 'Pending',
                    lastUpdated: '2025-06-01',
                    notes: 'Strong technical background, excellent portfolio'
                },
                {
                    id: 2,
                    candidateName: 'Bob Wilson',
                    email: 'bob.wilson@email.com',
                    phone: '+1-234-567-8904',
                    jobPosition: 'Marketing Specialist',
                    applicationDate: '2025-06-02',
                    status: 'Interview',
                    lastUpdated: '2025-06-10',
                    notes: 'Scheduled for interview next week'
                },
                {
                    id: 3,
                    candidateName: 'Emily Rodriguez',
                    email: 'emily.rodriguez@email.com',
                    phone: '+1-234-567-8910',
                    jobPosition: 'UX Designer',
                    applicationDate: '2025-06-05',
                    status: 'Under Review',
                    lastUpdated: '2025-06-12',
                    notes: 'Creative portfolio, good design principles'
                }
            ];
            localStorage.setItem('applications', JSON.stringify(sampleApplications));
        }

        if (!localStorage.getItem('events') || JSON.parse(localStorage.getItem('events')).length === 0) {
            const sampleEvents = [
                {
                    id: 1,
                    title: 'Interview with Alice Brown',
                    date: '2025-06-20',
                    time: '10:00',
                    type: 'Interview',
                    participants: 'Alice Brown, John Smith',
                    location: 'Conference Room A',
                    description: 'Technical interview for Software Engineer position',
                    status: 'Scheduled'
                },
                {
                    id: 2,
                    title: 'Team Meeting',
                    date: '2025-06-21',
                    time: '14:00',
                    type: 'Meeting',
                    participants: 'Development Team',
                    location: 'Main Conference Room',
                    description: 'Weekly team sync meeting',
                    status: 'Scheduled'
                }
            ];
            localStorage.setItem('events', JSON.stringify(sampleEvents));
        }

        this.notifySubscribers();
    },

    // Application Management - Accept/Decline functionality
    acceptApplication(applicationId, hireDetails) {
        try {
            const applications = this.getApplications();
            const application = applications.find(app => app.id == applicationId);
            
            if (application) {
                // Update application status to accepted
                application.status = 'Accepted';
                application.notes = hireDetails.notes || 'Application accepted - Candidate hired';
                application.acceptedAt = new Date().toISOString();
                application.acceptedBy = hireDetails.acceptedBy || 'Admin';
                application.lastUpdated = new Date().toISOString();
                
                // Save updated applications
                localStorage.setItem('applications', JSON.stringify(applications));                // If hiring, potentially create employee record
                if (hireDetails.createEmployee) {
                    const newEmployee = {
                        name: application.candidateName || application.name,
                        email: application.email,
                        phone: application.phone,
                        position: application.jobPosition || application.jobTitle,
                        department: hireDetails.department || 'General',
                        startDate: hireDetails.startDate || new Date().toISOString().split('T')[0],
                        salary: hireDetails.salary || 'TBD',
                        status: 'Active',
                        hiredFrom: 'Application',
                        applicationId: applicationId
                    };
                    console.log('Creating employee from application:', newEmployee);
                    this.createEmployee(newEmployee);
                }
                
                this.notifySubscribers();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error accepting application:', error);
            return false;
        }
    },

    declineApplication(applicationId, declineReason) {
        try {
            const applications = this.getApplications();
            const application = applications.find(app => app.id == applicationId);
            
            if (application) {
                application.status = 'Rejected';
                application.notes = declineReason || 'Application declined';
                application.declinedAt = new Date().toISOString();
                application.lastUpdated = new Date().toISOString();
                
                localStorage.setItem('applications', JSON.stringify(applications));
                this.notifySubscribers();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error declining application:', error);
            return false;
        }
    },
};
