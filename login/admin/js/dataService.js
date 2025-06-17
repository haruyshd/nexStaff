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
    },    // Employee Management
    async addEmployee(employee) {
        try {
            // Check if AdminSupabaseClient is available (newer approach)
            if (typeof AdminSupabaseClient !== 'undefined') {
                console.log('Using AdminSupabaseClient to add employee:', employee);
                
                // Format employee data for AdminSupabaseClient
                const employeeData = {
                    personalDetails: {
                        fullName: employee.name || employee.fullName || employee.full_name,
                        email: employee.email,
                        contactNumber: employee.phone
                    },
                    jobDetails: {
                        department: employee.department,
                        jobTitle: employee.position,
                        employmentStatus: employee.status || 'Active',
                        joiningDate: employee.hireDate || new Date().toISOString().split('T')[0]
                    },
                    salary: {
                        basic: parseFloat(employee.salary) || 0
                    }
                };
                
                const result = await AdminSupabaseClient.employees.create(employeeData);
                if (result.success) {
                    console.log('Employee added via AdminSupabaseClient:', result.data);
                    this.notifySubscribers();
                    return true;
                } else {
                    console.error('AdminSupabaseClient error adding employee:', result.error);
                    throw new Error(result.error);
                }
            }
            // Check if direct Supabase is available (fallback)
            else if (typeof supabase !== 'undefined') {
                console.log('Using direct Supabase to add employee:', employee);
                
                // Format employee data for direct Supabase
                const employeeData = {
                    full_name: employee.name || employee.fullName || employee.full_name,
                    role: employee.position || employee.role,
                    email: employee.email,
                    phone: employee.phone || employee.contactNumber,
                    photo: employee.photo || employee.profilePicture,
                    join_date: employee.hireDate || employee.joinDate || new Date().toISOString().split('T')[0],
                    employment_status: employee.status || 'Active',
                    department_id: employee.departmentId || null,
                    position_id: employee.positionId || null,
                    job_details: JSON.stringify(employee.jobDetails || {}),
                    emergency_contact: JSON.stringify(employee.emergencyContacts || {}),
                    salary_info: JSON.stringify({ basic: parseFloat(employee.salary) || 0 })
                };
                
                // Save to Supabase
                const { data, error } = await supabase
                    .from('employees')
                    .insert([employeeData])
                    .select();
                
                if (error) {
                    console.error('Supabase error adding employee:', error);
                    throw error;
                }
                
                console.log('Employee added to Supabase:', data);
                this.notifySubscribers();
                return true;
            } else {
                // Fallback to localStorage if Supabase is not available
                console.log('Supabase not available, using localStorage for employee:', employee);
                const employees = JSON.parse(localStorage.getItem('employees')) || [];
                const newEmployee = {
                    ...employee,
                    id: employee.id || Date.now(),
                    createdAt: new Date().toISOString(),
                    status: employee.status || 'Active'
                };
                employees.push(newEmployee);
                localStorage.setItem('employees', JSON.stringify(employees));
                this.notifySubscribers();
                return true;
            }
        } catch (error) {
            console.error('Error adding employee:', error);
            return false;
        }
    },    async getEmployees() {
        try {
            // Check if AdminSupabaseClient is available (newer approach)
            if (typeof AdminSupabaseClient !== 'undefined') {
                console.log('Using AdminSupabaseClient to get employees');
                const result = await AdminSupabaseClient.employees.getAll();
                
                if (result.success) {
                    // Transform AdminSupabaseClient data format to match CRUDManager expectations
                    return result.data.map(emp => ({
                        id: emp.id,
                        name: emp.full_name,
                        fullName: emp.full_name,
                        role: emp.role,
                        position: emp.role,
                        email: emp.email,
                        phone: emp.phone,
                        photo: emp.photo,
                        hireDate: emp.join_date,
                        joinDate: emp.join_date,
                        status: emp.employment_status,
                        department: emp.departments?.name || 'N/A',
                        departmentId: emp.department_id,
                        positionId: emp.position_id,
                        salary: typeof emp.salary_info === 'string' ? JSON.parse(emp.salary_info)?.basic : emp.salary_info?.basic,
                        jobDetails: typeof emp.job_details === 'string' ? JSON.parse(emp.job_details) : emp.job_details,
                        emergencyContacts: typeof emp.emergency_contact === 'string' ? JSON.parse(emp.emergency_contact) : emp.emergency_contact
                    }));
                } else {
                    console.error('AdminSupabaseClient error getting employees:', result.error);
                    throw new Error(result.error);
                }
            }
            // Check if direct Supabase is available (fallback)
            else if (typeof supabase !== 'undefined') {
                console.log('Using direct Supabase to get employees');
                const { data, error } = await supabase
                    .from('employees')
                    .select('*');
                
                if (error) {
                    console.error('Supabase error getting employees:', error);
                    throw error;
                }
                
                // Transform Supabase data format to match CRUDManager expectations
                return data.map(emp => ({
                    id: emp.id,
                    name: emp.full_name,
                    fullName: emp.full_name,
                    role: emp.role,
                    position: emp.role,
                    email: emp.email,
                    phone: emp.phone,
                    photo: emp.photo,
                    hireDate: emp.join_date,
                    joinDate: emp.join_date,
                    status: emp.employment_status,
                    department: emp.department_id,
                    departmentId: emp.department_id,
                    positionId: emp.position_id,
                    salary: typeof emp.salary_info === 'string' ? JSON.parse(emp.salary_info)?.basic : emp.salary_info?.basic,
                    jobDetails: typeof emp.job_details === 'string' ? JSON.parse(emp.job_details) : emp.job_details,
                    emergencyContacts: typeof emp.emergency_contact === 'string' ? JSON.parse(emp.emergency_contact) : emp.emergency_contact
                }));
            } else {
                // Fallback to localStorage
                console.log('Supabase not available, using localStorage for employees');
                const employees = JSON.parse(localStorage.getItem('employees')) || [];
                return employees.map(emp => ({
                    ...emp,
                    name: emp.name || emp.fullName,
                    position: emp.position || emp.role
                }));
            }
        } catch (error) {
            console.error('Error getting employees:', error);
            // Return empty array on error instead of throwing
            return [];        }
    },

    // CRUD compatibility methods - these wrap the async methods for synchronous access
    readEmployees() {
        // Return cached employees or empty array
        return this._cachedEmployees || [];
    },

    // Cache employees for synchronous access
    async cacheEmployees() {
        this._cachedEmployees = await this.getEmployees();
        return this._cachedEmployees;
    },

    readCandidates() {
        return this._cachedCandidates || [];
    },

    async cacheCandidates() {
        this._cachedCandidates = await this.getCandidates();
        return this._cachedCandidates;
    },

    readEmployers() {
        return this._cachedEmployers || [];
    },

    async cacheEmployers() {
        this._cachedEmployers = await this.getEmployers();
        return this._cachedEmployers;
    },

    readJobs() {
        return this._cachedJobs || [];
    },

    async cacheJobs() {
        this._cachedJobs = await this.getJobs();
        return this._cachedJobs;
    },

    readApplications() {
        return this._cachedApplications || [];
    },

    async cacheApplications() {
        this._cachedApplications = await this.getApplications();
        return this._cachedApplications;
    },

    readSchedules() {
        return this._cachedSchedules || [];
    },

    async cacheSchedules() {
        this._cachedSchedules = await this.getSchedules();
        return this._cachedSchedules;
    },

    // Update employee
    async updateEmployee(employee) {
        try {
            // Check if AdminSupabaseClient is available (newer approach)
            if (typeof AdminSupabaseClient !== 'undefined') {
                console.log('Using AdminSupabaseClient to update employee:', employee);
                
                // Format employee data for AdminSupabaseClient
                const employeeData = {
                    personalDetails: {
                        fullName: employee.name || employee.fullName || employee.full_name,
                        email: employee.email,
                        contactNumber: employee.phone
                    },
                    jobDetails: {
                        department: employee.department,
                        jobTitle: employee.position,
                        employmentStatus: employee.status || 'Active',
                        joiningDate: employee.hireDate || new Date().toISOString().split('T')[0]
                    },
                    salary: {
                        basic: parseFloat(employee.salary) || 0
                    }
                };
                
                const result = await AdminSupabaseClient.employees.update(employee.id, employeeData);
                if (result.success) {
                    console.log('Employee updated via AdminSupabaseClient:', result.data);
                    await this.cacheEmployees(); // Refresh cache
                    this.notifySubscribers();
                    return true;
                } else {
                    console.error('AdminSupabaseClient error updating employee:', result.error);
                    throw new Error(result.error);
                }
            }
            // Check if direct Supabase is available (fallback)
            else if (typeof supabase !== 'undefined') {
                console.log('Using direct Supabase to update employee:', employee);
                
                // Format employee data for direct Supabase
                const employeeData = {
                    full_name: employee.name || employee.fullName || employee.full_name,
                    role: employee.position || employee.role,
                    email: employee.email,
                    phone: employee.phone || employee.contactNumber,
                    photo: employee.photo || employee.profilePicture,
                    employment_status: employee.status || 'Active',
                    department_id: employee.departmentId || null,
                    position_id: employee.positionId || null,
                    salary_info: JSON.stringify({ basic: parseFloat(employee.salary) || 0 }),
                    updated_at: new Date().toISOString()
                };
                
                // Update in Supabase
                const { data, error } = await supabase
                    .from('employees')
                    .update(employeeData)
                    .eq('id', employee.id)
                    .select();
                
                if (error) {
                    console.error('Supabase error updating employee:', error);
                    throw error;
                }
                
                console.log('Employee updated in Supabase:', data);
                await this.cacheEmployees(); // Refresh cache
                this.notifySubscribers();
                return true;
            } else {
                // Fallback to localStorage if Supabase is not available
                console.log('Supabase not available, using localStorage for employee update:', employee);
                const employees = JSON.parse(localStorage.getItem('employees')) || [];
                const index = employees.findIndex(emp => emp.id == employee.id);
                
                if (index !== -1) {
                    employees[index] = { ...employees[index], ...employee, updatedAt: new Date().toISOString() };
                    localStorage.setItem('employees', JSON.stringify(employees));
                    this._cachedEmployees = employees; // Update cache
                    this.notifySubscribers();
                    return true;
                } else {
                    throw new Error('Employee not found');
                }
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            return false;
        }
    },

    // Delete employee
    async deleteEmployee(employeeId) {
        try {
            // Check if AdminSupabaseClient is available (newer approach)
            if (typeof AdminSupabaseClient !== 'undefined') {
                console.log('Using AdminSupabaseClient to delete employee:', employeeId);
                
                const result = await AdminSupabaseClient.employees.delete(employeeId);
                if (result.success) {
                    console.log('Employee deleted via AdminSupabaseClient');
                    await this.cacheEmployees(); // Refresh cache
                    this.notifySubscribers();
                    return true;
                } else {
                    console.error('AdminSupabaseClient error deleting employee:', result.error);
                    throw new Error(result.error);
                }
            }
            // Check if direct Supabase is available (fallback)
            else if (typeof supabase !== 'undefined') {
                console.log('Using direct Supabase to delete employee:', employeeId);
                
                const { error } = await supabase
                    .from('employees')
                    .delete()
                    .eq('id', employeeId);
                
                if (error) {
                    console.error('Supabase error deleting employee:', error);
                    throw error;
                }
                
                console.log('Employee deleted from Supabase');
                await this.cacheEmployees(); // Refresh cache
                this.notifySubscribers();
                return true;
            } else {
                // Fallback to localStorage if Supabase is not available
                console.log('Supabase not available, using localStorage for employee deletion:', employeeId);
                const employees = JSON.parse(localStorage.getItem('employees')) || [];
                const filteredEmployees = employees.filter(emp => emp.id != employeeId);
                localStorage.setItem('employees', JSON.stringify(filteredEmployees));
                this._cachedEmployees = filteredEmployees; // Update cache
                this.notifySubscribers();
                return true;
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            return false;
        }
    },

    // Candidate Management
    async addCandidate(candidate) {
        try {
            // Check if Supabase is available
            if (typeof AdminSupabaseClient !== 'undefined' || (typeof SupabaseClient !== 'undefined' && typeof supabase !== 'undefined')) {
                console.log('Using Supabase to add candidate:', candidate);
                
                // Format candidate data for Supabase
                const candidateData = {
                    name: candidate.fullName || candidate.name,
                    email: candidate.email,
                    phone: candidate.phone || candidate.contactNumber,
                    location: candidate.location || candidate.address,
                    skills: JSON.stringify(candidate.skills || []),
                    experience: candidate.experience || '',
                    preferred_role: candidate.preferredRole || candidate.role,
                    current_position: candidate.currentPosition || candidate.currentRole,
                    education: candidate.education || '',
                    status: 'Available',
                    resume_url: candidate.resumeUrl || '',
                    portfolio_url: candidate.portfolioUrl || '',
                    linkedin_url: candidate.linkedinUrl || '',
                    salary_expectation: candidate.salaryExpectation || '',
                    availability: candidate.availability || 'Immediate'
                };
                
                // Save to Supabase
                const { data, error } = await supabase
                    .from('candidates')
                    .insert([candidateData])
                    .select();
                
                if (error) {
                    console.error('Supabase error adding candidate:', error);
                    throw error;
                }
                
                console.log('Candidate added to Supabase:', data);
                this.notifySubscribers();
                return true;
            } else {
                // Fallback to localStorage
                console.log('Supabase not available, using localStorage for candidate:', candidate);
                const candidates = JSON.parse(localStorage.getItem('candidates')) || [];
                candidate.id = candidate.id || Date.now();
                candidate.createdAt = new Date().toISOString();
                candidates.push(candidate);
                localStorage.setItem('candidates', JSON.stringify(candidates));
                this.notifySubscribers();
                return true;
            }
        } catch (error) {
            console.error('Error adding candidate:', error);
            return false;
        }
    },

    async getCandidates() {
        try {
            // Check if Supabase is available
            if (typeof AdminSupabaseClient !== 'undefined' || (typeof SupabaseClient !== 'undefined' && typeof supabase !== 'undefined')) {
                console.log('Using Supabase to get candidates');
                const { data, error } = await supabase
                    .from('candidates')
                    .select('*');
                
                if (error) {
                    console.error('Supabase error getting candidates:', error);
                    throw error;
                }
                
                // Transform Supabase data format to match local format if needed
                return data.map(candidate => ({
                    id: candidate.id,
                    name: candidate.name,
                    fullName: candidate.name,
                    email: candidate.email,
                    phone: candidate.phone,
                    location: candidate.location,
                    skills: typeof candidate.skills === 'string' ? JSON.parse(candidate.skills) : candidate.skills,
                    experience: candidate.experience,
                    preferredRole: candidate.preferred_role,
                    currentPosition: candidate.current_position,
                    education: candidate.education,
                    status: candidate.status,
                    resumeUrl: candidate.resume_url,
                    portfolioUrl: candidate.portfolio_url,
                    linkedinUrl: candidate.linkedin_url,
                    salaryExpectation: candidate.salary_expectation,
                    availability: candidate.availability,
                    registeredDate: candidate.registered_date,
                    createdAt: candidate.created_at
                }));
            } else {
                // Fallback to localStorage
                return JSON.parse(localStorage.getItem('candidates')) || [];
            }
        } catch (error) {
            console.error('Error getting candidates:', error);
            return [];
        }
    },    // Employer Management
    async addEmployer(employer) {
        try {
            // Check if Supabase is available
            if (typeof AdminSupabaseClient !== 'undefined' || (typeof SupabaseClient !== 'undefined' && typeof supabase !== 'undefined')) {
                console.log('Using Supabase to add employer:', employer);
                
                // Format employer data for Supabase
                const employerData = {
                    company_name: employer.companyName || employer.company_name,
                    industry: employer.industry || '',
                    website: employer.website || '',
                    email: employer.email,
                    phone: employer.phone || employer.contactNumber,
                    address: employer.address || '',
                    city: employer.city || '',
                    state: employer.state || '',
                    zipcode: employer.zipcode || '',
                    country: employer.country || '',
                    logo_url: employer.logoUrl || employer.logo_url,
                    description: employer.description || '',
                    founded_year: employer.foundedYear || employer.founded_year,
                    company_size: employer.companySize || employer.company_size,
                    social_media: JSON.stringify(employer.socialMedia || {}),
                    status: 'Active',
                    verified: false,
                    subscription_plan: 'Free'
                };
                
                // Save to Supabase
                const { data, error } = await supabase
                    .from('employers')
                    .insert([employerData])
                    .select();
                
                if (error) {
                    console.error('Supabase error adding employer:', error);
                    throw error;
                }
                
                console.log('Employer added to Supabase:', data);
                this.notifySubscribers();
                return true;
            } else {
                // Fallback to localStorage
                console.log('Supabase not available, using localStorage for employer:', employer);
                const employers = JSON.parse(localStorage.getItem('employers')) || [];
                employer.id = employer.id || Date.now();
                employer.createdAt = new Date().toISOString();
                employers.push(employer);
                localStorage.setItem('employers', JSON.stringify(employers));
                this.notifySubscribers();
                return true;
            }
        } catch (error) {
            console.error('Error adding employer:', error);
            return false;
        }
    },

    async getEmployers() {
        try {
            // Check if Supabase is available
            if (typeof AdminSupabaseClient !== 'undefined' || (typeof SupabaseClient !== 'undefined' && typeof supabase !== 'undefined')) {
                console.log('Using Supabase to get employers');
                const { data, error } = await supabase
                    .from('employers')
                    .select('*');
                
                if (error) {
                    console.error('Supabase error getting employers:', error);
                    throw error;
                }
                
                // Transform Supabase data format to match local format if needed
                return data.map(employer => ({
                    id: employer.id,
                    companyName: employer.company_name,
                    industry: employer.industry,
                    website: employer.website,
                    email: employer.email,
                    phone: employer.phone,
                    address: employer.address,
                    city: employer.city,
                    state: employer.state,
                    zipcode: employer.zipcode,
                    country: employer.country,
                    logoUrl: employer.logo_url,
                    description: employer.description,
                    foundedYear: employer.founded_year,
                    companySize: employer.company_size,
                    socialMedia: typeof employer.social_media === 'string' ? JSON.parse(employer.social_media) : employer.social_media,
                    status: employer.status,
                    verified: employer.verified,
                    subscriptionPlan: employer.subscription_plan,
                    createdAt: employer.created_at
                }));
            } else {
                // Fallback to localStorage
                return JSON.parse(localStorage.getItem('employers')) || [];
            }
        } catch (error) {
            console.error('Error getting employers:', error);
            return [];
        }
    },    // Job Management
    async addJob(job) {
        try {
            // Check if Supabase is available
            if (typeof AdminSupabaseClient !== 'undefined' || (typeof SupabaseClient !== 'undefined' && typeof supabase !== 'undefined')) {
                console.log('Using Supabase to add job:', job);
                
                // Format job data for Supabase
                const jobData = {
                    title: job.title,
                    company: job.company,
                    employer_id: job.employerId || null,
                    department: job.department || '',
                    location: job.location || '',
                    type: job.type || 'Full-time',
                    category: job.category || '',
                    salary: job.salary || '',
                    description: job.description || '',
                    requirements: JSON.stringify(job.requirements || []),
                    benefits: JSON.stringify(job.benefits || []),
                    posted_date: job.postedDate || new Date().toISOString().split('T')[0],
                    status: job.status || 'Active',
                    applications_count: 0,
                    urgency: job.urgency || 'Normal'
                };
                
                // Save to Supabase
                const { data, error } = await supabase
                    .from('jobs')
                    .insert([jobData])
                    .select();
                
                if (error) {
                    console.error('Supabase error adding job:', error);
                    throw error;
                }
                
                console.log('Job added to Supabase:', data);
                
                // Dispatch event for real-time updates
                document.dispatchEvent(new CustomEvent('jobAdded', {
                    detail: data[0]
                }));
                
                this.notifySubscribers();
                return true;
            } else {
                // Fallback to localStorage
                const jobs = JSON.parse(localStorage.getItem('nexstaff_jobs')) || [];
                job.id = job.id || Date.now();
                job.createdAt = new Date().toISOString();
                jobs.push(job);
                localStorage.setItem('nexstaff_jobs', JSON.stringify(jobs));
                
                // Dispatch event for real-time updates
                document.dispatchEvent(new CustomEvent('jobAdded', {
                    detail: job
                }));
                
                this.notifySubscribers();
                return true;
            }
        } catch (error) {
            console.error('Error adding job:', error);
            return false;
        }
    },

    async getJobs() {
        try {
            // Check if Supabase is available
            if (typeof AdminSupabaseClient !== 'undefined' || (typeof SupabaseClient !== 'undefined' && typeof supabase !== 'undefined')) {
                console.log('Using Supabase to get jobs');
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*');
                
                if (error) {
                    console.error('Supabase error getting jobs:', error);
                    throw error;
                }
                
                // Transform Supabase data format to match local format if needed
                return data.map(job => ({
                    id: job.id,
                    title: job.title,
                    company: job.company,
                    employerId: job.employer_id,
                    department: job.department,
                    location: job.location,
                    type: job.type,
                    category: job.category,
                    salary: job.salary,
                    description: job.description,
                    requirements: typeof job.requirements === 'string' ? JSON.parse(job.requirements) : job.requirements,
                    benefits: typeof job.benefits === 'string' ? JSON.parse(job.benefits) : job.benefits,
                    postedDate: job.posted_date,
                    status: job.status,
                    applicationsCount: job.applications_count,
                    urgency: job.urgency,
                    createdAt: job.created_at,
                    updatedAt: job.updated_at
                }));
            } else {
                // Fallback to localStorage
                return JSON.parse(localStorage.getItem('nexstaff_jobs')) || [];
            }
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
    async addApplication(application) {
        try {
            application.id = application.id || 'APP' + Date.now().toString();
            application.createdAt = new Date().toISOString();
            
            // Check if Supabase is available
            if (typeof SupabaseClient !== 'undefined' && typeof supabase !== 'undefined') {
                console.log('Using Supabase to add application:', application);
                
                // Format application data for Supabase
                const applicationData = {
                    id: application.id,
                    job_id: application.jobId,
                    job_title: application.jobTitle || '',
                    company_name: application.companyName || '',
                    candidate_name: application.candidateName || application.fullName,
                    full_name: application.fullName,
                    email: application.email,
                    phone: application.phone || '',
                    cover_letter: application.coverLetter || '',
                    resume_url: application.resumeUrl || '',
                    resume_name: application.resumeName || '',
                    expected_salary: application.expectedSalary || '',
                    availability: application.availability || 'Immediate',
                    portfolio_links: application.portfolioLinks || [],
                    reference_contact: application.referenceContact || '',
                    status: application.status || 'New',
                    priority: application.priority || 'Medium',
                    submitted_at: application.createdAt,
                    last_updated: application.createdAt,
                    source: application.source || 'admin_dashboard',
                    notes: application.notes || ''
                };
                
                // Save to Supabase
                const { data, error } = await supabase
                    .from('applications')
                    .insert(applicationData)
                    .select();
                    
                if (error) {
                    console.error('Supabase error adding application:', error);
                    throw error;
                }
                
                console.log('Application added to Supabase:', data);
                this.notifySubscribers();
                return true;
            }
            
            // Fallback to localStorage if Supabase is not available
            console.log('Supabase not available, using localStorage for application:', application);
            const applications = JSON.parse(localStorage.getItem('applications')) || [];
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
    },    // --- CRUD for Employees ---
    createEmployee(employee) {
        const employees = this.getEmployees();
        employee.id = employee.id || Date.now();
        employees.push(employee);
        localStorage.setItem('employees', JSON.stringify(employees));
        this.notifySubscribers();
        return employee;
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
        return this._cachedCandidates || [];
    },

    async cacheCandidates() {
        this._cachedCandidates = await this.getCandidates();
        return this._cachedCandidates;
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
        return this._cachedEmployers || [];
    },

    async cacheEmployers() {
        this._cachedEmployers = await this.getEmployers();
        return this._cachedEmployers;
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
        return this._cachedJobs || [];
    },

    async cacheJobs() {
        this._cachedJobs = await this.getJobs();
        return this._cachedJobs;
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
        return this._cachedApplications || [];
    },

    async cacheApplications() {
        this._cachedApplications = await this.getApplications();
        return this._cachedApplications;
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
        return this._cachedSchedules || [];
    },

    async cacheSchedules() {
        this._cachedSchedules = await this.getSchedules();
        return this._cachedSchedules;
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
        }        if (!localStorage.getItem('employers') || JSON.parse(localStorage.getItem('employers')).length === 0) {
            const sampleEmployers = [
                {
                    id: 1,
                    company: 'Tech Corp Inc.',
                    contactPerson: 'Michael Davis',
                    email: 'contact@techcorp.com',
                    phone: '+1-234-567-8905',
                    industry: 'Technology',
                    address: '123 Tech Street, Silicon Valley',
                    status: 'Active',
                    createdAt: '2025-05-15T10:00:00Z'
                },
                {
                    id: 2,
                    company: 'Healthcare Solutions',
                    contactPerson: 'Lisa Chen',
                    email: 'hr@healthcaresolutions.com',
                    phone: '+1-234-567-8906',
                    industry: 'Healthcare',
                    address: '456 Medical Ave, Health City',
                    status: 'Pending',
                    createdAt: '2025-06-10T14:30:00Z'
                },
                {
                    id: 3,
                    company: 'StartupXYZ',
                    contactPerson: 'Alex Rodriguez',
                    email: 'alex@startupxyz.com',
                    phone: '+1-234-567-8907',
                    industry: 'Technology',
                    address: '789 Innovation Blvd, Tech Hub',
                    status: 'Pending',
                    createdAt: '2025-06-12T09:15:00Z',
                    description: 'Innovative startup focused on mobile app development'
                },
                {
                    id: 4,
                    company: 'Finance Pro LLC',
                    contactPerson: 'Jennifer Smith',
                    email: 'jen@financepro.com',
                    phone: '+1-234-567-8908',                    industry: 'Finance',
                    address: '321 Finance Street, Money City',
                    status: 'Active',
                    createdAt: '2025-04-20T11:45:00Z'
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
            return false;        } catch (error) {
            console.error('Error declining application:', error);
            return false;
        }
    },

    // Initialize sample data for testing
    initializeSampleEmployers() {
        const existingEmployers = this.getEmployers();
        if (existingEmployers.length === 0) {
            const sampleEmployers = [                {
                    id: 1001,
                    company: "TechCorp Solutions",
                    companyName: "TechCorp Solutions",
                    contactPerson: "John Smith",
                    email: "john.smith@techcorp.com",
                    phone: "(555) 123-4567",
                    industry: "Technology",
                    website: "www.techcorp.com",
                    address: "123 Tech Street, Silicon Valley, CA 94000",
                    companySize: "51-200",
                    description: "Leading technology company specializing in cloud solutions and AI development. We're committed to innovation and creating cutting-edge software solutions for businesses worldwide.",
                    requirements: "Strong programming skills in JavaScript, Python, or Java. Experience with cloud platforms (AWS, Azure). Bachelor's degree in Computer Science or related field. 2+ years of experience preferred.",
                    status: "Pending",
                    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                    notes: "New employer application pending review"
                },                {
                    id: 1002,
                    company: "HealthFirst Medical",
                    companyName: "HealthFirst Medical",
                    contactPerson: "Dr. Sarah Johnson",
                    email: "sarah.johnson@healthfirst.com",
                    phone: "(555) 234-5678",
                    industry: "Healthcare",
                    website: "www.healthfirst.com",
                    address: "456 Medical Center Drive, Houston, TX 77001",
                    companySize: "201-1000",
                    description: "Comprehensive healthcare provider offering state-of-the-art medical services. We are dedicated to providing exceptional patient care and advancing medical research.",
                    requirements: "Medical degree and valid license. Board certification preferred. Experience in relevant specialty. Strong communication and patient care skills.",
                    status: "Active",
                    approvedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                    approvedBy: "Admin",
                    notes: "Verified medical facility - approved"
                },
                {
                    id: 1003,
                    company: "Global Finance Inc",
                    contactPerson: "Michael Brown",
                    email: "m.brown@globalfinance.com",
                    phone: "(555) 345-6789",
                    industry: "Finance",
                    website: "www.globalfinance.com",
                    status: "Pending",
                    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
                    notes: "Large financial institution - awaiting verification"
                },
                {
                    id: 1004,
                    company: "QuickBuild Construction",
                    contactPerson: "Bob Wilson",
                    email: "bob@quickbuild.com",
                    phone: "(555) 456-7890",
                    industry: "Manufacturing",
                    status: "Rejected",
                    rejectedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                    rejectedBy: "Admin",
                    rejectionReason: "Incomplete documentation",
                    notes: "Application rejected due to missing safety certifications"
                },
                {
                    id: 1005,
                    company: "EduTech Academy",
                    contactPerson: "Lisa Davis",
                    email: "lisa.davis@edutech.com",
                    phone: "(555) 567-8901",
                    industry: "Education",
                    website: "www.edutech.com",
                    status: "Active",
                    approvedAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
                    approvedBy: "Admin",
                    notes: "Educational institution - verified and approved"
                }
            ];

            localStorage.setItem('employers', JSON.stringify(sampleEmployers));
            console.log('Sample employer data initialized');
        }
    }
};
