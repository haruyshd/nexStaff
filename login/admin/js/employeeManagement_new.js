// Employee Management System Data API - Supabase Edition
const EmployeeManagementAPI = {
    // Employee Status
    STATUS: {
        ACTIVE: 'Active',
        ON_LEAVE: 'On Leave',
        TERMINATED: 'Terminated',
        RESIGNED: 'Resigned'
    },

    // Employee Template
    EMPLOYEE_TEMPLATE: {
        personalDetails: {
            employeeId: '', // EMP00001 format
            fullName: '',
            profilePicture: null,
            dateOfBirth: '',
            gender: '',
            contactNumber: '',
            email: '',
            residentialAddress: '',
            emergencyContacts: []
        },
        jobDetails: {
            department: '',
            jobTitle: '',
            joiningDate: '',
            employmentType: '', // Full-time, Part-time, Contractual, Intern
            workLocation: '',
            reportingManager: '',
            employmentStatus: 'Active' // Active, On Leave, Resigned, Terminated
        },
        salary: {
            basic: 0,
            allowances: [],
            deductions: [],
            netPay: 0,
            payrollHistory: [],
            bankDetails: {
                accountName: '',
                accountNumber: '',
                bankName: '',
                branchCode: ''
            },
            taxInfo: {
                tin: '',
                sss: '',
                philHealth: '',
                pagIbig: ''
            }
        },
        attendance: {
            records: [], // Daily attendance records
            overtime: [],
            leaves: {
                balance: {},
                history: []
            }
        },
        performance: {
            reviews: [],
            goals: [],
            kpis: [],
            appraisals: [],
            promotions: [],
            disciplinaryActions: []
        },
        documents: {
            resume: null,
            contract: null,
            governmentIds: [],
            companyIds: [],
            certificates: [],
            policies: []
        },
        training: {
            enrolled: [],
            completed: [],
            skillDevelopment: [],
            feedback: []
        },
        userAccount: {
            username: '',
            role: '',
            accessLevel: '',
            lastLogin: null,
            activityLogs: []
        },
        resignation: {
            exitDate: null,
            reason: '',
            exitInterview: null,
            clearanceStatus: '',
            finalSettlement: null
        }
    },

    // Check if Supabase is available
    isSupabaseAvailable() {
        return typeof AdminSupabaseClient !== 'undefined' && AdminSupabaseClient;
    },

    // Initialize with Supabase
    async init() {
        if (this.isSupabaseAvailable()) {
            console.log('Employee Management initialized with Supabase');
            // Initialize default departments and positions if they don't exist
            await this.initializeDefaultData();
        } else {
            console.warn('Supabase not available, falling back to localStorage');
            this.initLocalStorage();
        }
    },

    // Initialize default data in Supabase
    async initializeDefaultData() {
        try {
            // Check if departments exist
            const deptResult = await AdminSupabaseClient.departments.getAll();
            if (deptResult.success && deptResult.data.length === 0) {
                // Insert default departments
                const defaultDepartments = [
                    { name: 'Human Resources', code: 'HR', description: 'Human Resources Department' },
                    { name: 'Information Technology', code: 'IT', description: 'Information Technology Department' },
                    { name: 'Finance', code: 'FIN', description: 'Finance Department' },
                    { name: 'Marketing', code: 'MKT', description: 'Marketing Department' },
                    { name: 'Operations', code: 'OPS', description: 'Operations Department' }
                ];

                for (const dept of defaultDepartments) {
                    await supabase.from('departments').insert([dept]);
                }
            }

            // Check if positions exist
            const posResult = await AdminSupabaseClient.positions.getAll();
            if (posResult.success && posResult.data.length === 0) {
                // Get departments for position mapping
                const departments = await AdminSupabaseClient.departments.getAll();
                if (departments.success) {
                    const deptMap = {};
                    departments.data.forEach(dept => {
                        deptMap[dept.code] = dept.id;
                    });

                    const defaultPositions = [
                        { name: 'HR Manager', department_id: deptMap['HR'], level: 'manager' },
                        { name: 'Software Engineer', department_id: deptMap['IT'], level: 'staff' },
                        { name: 'Financial Analyst', department_id: deptMap['FIN'], level: 'staff' },
                        { name: 'Marketing Specialist', department_id: deptMap['MKT'], level: 'staff' },
                        { name: 'Operations Manager', department_id: deptMap['OPS'], level: 'manager' }
                    ];

                    for (const pos of defaultPositions) {
                        await supabase.from('positions').insert([pos]);
                    }
                }
            }
        } catch (error) {
            console.error('Error initializing default data:', error);
        }
    },

    // Fallback localStorage initialization
    initLocalStorage() {
        // Initialize departments
        if (!localStorage.getItem('nexstaff_departments')) {
            const defaultDepartments = [
                { id: 1, name: 'Human Resources', code: 'HR' },
                { id: 2, name: 'Information Technology', code: 'IT' },
                { id: 3, name: 'Finance', code: 'FIN' },
                { id: 4, name: 'Marketing', code: 'MKT' },
                { id: 5, name: 'Operations', code: 'OPS' }
            ];
            localStorage.setItem('nexstaff_departments', JSON.stringify(defaultDepartments));
        }

        // Initialize positions
        if (!localStorage.getItem('nexstaff_positions')) {
            const defaultPositions = [
                { id: 1, name: 'HR Manager', departmentId: 1, level: 'manager' },
                { id: 2, name: 'Software Engineer', departmentId: 2, level: 'staff' },
                { id: 3, name: 'Financial Analyst', departmentId: 3, level: 'staff' },
                { id: 4, name: 'Marketing Specialist', departmentId: 4, level: 'staff' },
                { id: 5, name: 'Operations Manager', departmentId: 5, level: 'manager' }
            ];
            localStorage.setItem('nexstaff_positions', JSON.stringify(defaultPositions));
        }
    },

    // Employee CRUD operations
    async getEmployees(filters = {}) {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.employees.getAll(filters);
            if (result.success) {
                return result.data.map(emp => ({
                    id: emp.id,
                    name: emp.full_name,
                    email: emp.email,
                    phone: emp.phone,
                    role: emp.role,
                    department: emp.departments?.name || 'N/A',
                    departmentId: emp.department_id,
                    position: emp.positions?.name || 'N/A',
                    positionId: emp.position_id,
                    status: emp.employment_status,
                    joinDate: emp.join_date,
                    photo: emp.photo,
                    address: emp.address,
                    jobDetails: typeof emp.job_details === 'string' ? JSON.parse(emp.job_details) : emp.job_details,
                    salary: typeof emp.salary_info === 'string' ? JSON.parse(emp.salary_info) : emp.salary_info,
                    attendance: typeof emp.attendance === 'string' ? JSON.parse(emp.attendance) : emp.attendance,
                    performance: typeof emp.performance === 'string' ? JSON.parse(emp.performance) : emp.performance,
                    documents: typeof emp.documents === 'string' ? JSON.parse(emp.documents) : emp.documents,
                    emergencyContacts: typeof emp.emergency_contact === 'string' ? JSON.parse(emp.emergency_contact) : emp.emergency_contact,
                    createdAt: emp.created_at,
                    updatedAt: emp.updated_at
                }));
            } else {
                console.error('Error fetching employees from Supabase:', result.error);
                return [];
            }
        } else {
            // Fallback to localStorage
            const employees = JSON.parse(localStorage.getItem('nexstaff_employees_v2')) || [];
            
            // Apply filters
            return employees.filter(emp => {
                let match = true;
                if (filters.departmentId) {
                    match = match && emp.departmentId === filters.departmentId;
                }
                if (filters.status) {
                    match = match && emp.status === filters.status;
                }
                if (filters.search) {
                    const search = filters.search.toLowerCase();
                    match = match && (
                        emp.name.toLowerCase().includes(search) ||
                        emp.email.toLowerCase().includes(search)
                    );
                }
                return match;
            });
        }
    },

    async getEmployeeById(id) {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.employees.getById(id);
            if (result.success) {
                const emp = result.data;
                return {
                    id: emp.id,
                    name: emp.full_name,
                    email: emp.email,
                    phone: emp.phone,
                    role: emp.role,
                    department: emp.departments?.name || 'N/A',
                    departmentId: emp.department_id,
                    position: emp.positions?.name || 'N/A',
                    positionId: emp.position_id,
                    status: emp.employment_status,
                    joinDate: emp.join_date,
                    photo: emp.photo,
                    address: emp.address,
                    jobDetails: typeof emp.job_details === 'string' ? JSON.parse(emp.job_details) : emp.job_details,
                    salary: typeof emp.salary_info === 'string' ? JSON.parse(emp.salary_info) : emp.salary_info,
                    attendance: typeof emp.attendance === 'string' ? JSON.parse(emp.attendance) : emp.attendance,
                    performance: typeof emp.performance === 'string' ? JSON.parse(emp.performance) : emp.performance,
                    documents: typeof emp.documents === 'string' ? JSON.parse(emp.documents) : emp.documents,
                    emergencyContacts: typeof emp.emergency_contact === 'string' ? JSON.parse(emp.emergency_contact) : emp.emergency_contact,
                    createdAt: emp.created_at,
                    updatedAt: emp.updated_at
                };
            } else {
                console.error('Error fetching employee from Supabase:', result.error);
                return null;
            }
        } else {
            // Fallback to localStorage
            const employees = await this.getEmployees();
            return employees.find(emp => emp.id === id);
        }
    },

    async createEmployee(data) {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.employees.create(data);
            if (result.success) {
                return {
                    id: result.data.id,
                    name: result.data.full_name,
                    email: result.data.email,
                    phone: result.data.phone,
                    role: result.data.role,
                    status: result.data.employment_status,
                    createdAt: result.data.created_at,
                    updatedAt: result.data.updated_at
                };
            } else {
                console.error('Error creating employee in Supabase:', result.error);
                return null;
            }
        } else {
            // Fallback to localStorage
            const employees = await this.getEmployees();
            const newId = Math.max(...employees.map(emp => emp.id), 0) + 1;
            
            const newEmployee = {
                id: newId,
                ...data,
                status: this.STATUS.ACTIVE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            employees.push(newEmployee);
            localStorage.setItem('nexstaff_employees_v2', JSON.stringify(employees));
            
            return newEmployee;
        }
    },

    async updateEmployee(id, data) {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.employees.update(id, data);
            if (result.success) {
                return {
                    id: result.data.id,
                    name: result.data.full_name,
                    email: result.data.email,
                    phone: result.data.phone,
                    role: result.data.role,
                    status: result.data.employment_status,
                    updatedAt: result.data.updated_at
                };
            } else {
                console.error('Error updating employee in Supabase:', result.error);
                return null;
            }
        } else {
            // Fallback to localStorage
            const employees = await this.getEmployees();
            const index = employees.findIndex(emp => emp.id === id);
            
            if (index !== -1) {
                employees[index] = {
                    ...employees[index],
                    ...data,
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem('nexstaff_employees_v2', JSON.stringify(employees));
                return employees[index];
            }
            return null;
        }
    },

    async deleteEmployee(id) {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.employees.delete(id);
            return result.success;
        } else {
            // Fallback to localStorage
            const employees = await this.getEmployees();
            const filtered = employees.filter(emp => emp.id !== id);
            localStorage.setItem('nexstaff_employees_v2', JSON.stringify(filtered));
            return true;
        }
    },

    // Attendance Management
    async recordAttendance(employeeId, data) {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.attendance.record(employeeId, data);
            if (result.success) {
                return result.data;
            } else {
                console.error('Error recording attendance in Supabase:', result.error);
                return null;
            }
        } else {
            // Fallback to localStorage
            const attendance = JSON.parse(localStorage.getItem('nexstaff_attendance')) || [];
            const newRecord = {
                id: Date.now(),
                employeeId,
                ...data,
                timestamp: new Date().toISOString()
            };
            
            attendance.push(newRecord);
            localStorage.setItem('nexstaff_attendance', JSON.stringify(attendance));
            return newRecord;
        }
    },

    async getAttendance(employeeId, startDate, endDate) {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.attendance.get(employeeId, startDate, endDate);
            if (result.success) {
                return result.data;
            } else {
                console.error('Error fetching attendance from Supabase:', result.error);
                return [];
            }
        } else {
            // Fallback to localStorage
            const attendance = JSON.parse(localStorage.getItem('nexstaff_attendance')) || [];
            return attendance.filter(record => {
                const recordDate = new Date(record.timestamp);
                return record.employeeId === employeeId &&
                       (!startDate || recordDate >= new Date(startDate)) &&
                       (!endDate || recordDate <= new Date(endDate));
            });
        }
    },

    // Performance Management
    async addPerformanceReview(employeeId, review) {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.performance.addReview(employeeId, review);
            if (result.success) {
                return result.data;
            } else {
                console.error('Error adding performance review in Supabase:', result.error);
                return null;
            }
        } else {
            // Fallback to localStorage
            const reviews = JSON.parse(localStorage.getItem('nexstaff_performance')) || [];
            const newReview = {
                id: Date.now(),
                employeeId,
                ...review,
                createdAt: new Date().toISOString()
            };
            
            reviews.push(newReview);
            localStorage.setItem('nexstaff_performance', JSON.stringify(reviews));
            return newReview;
        }
    },

    async getPerformanceReviews(employeeId) {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.performance.getReviews(employeeId);
            if (result.success) {
                return result.data;
            } else {
                console.error('Error fetching performance reviews from Supabase:', result.error);
                return [];
            }
        } else {
            // Fallback to localStorage
            const reviews = JSON.parse(localStorage.getItem('nexstaff_performance')) || [];
            return reviews.filter(review => review.employeeId === employeeId);
        }
    },

    // Document Management
    async uploadDocument(employeeId, document) {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.documents.upload(employeeId, document);
            if (result.success) {
                return result.data;
            } else {
                console.error('Error uploading document in Supabase:', result.error);
                return null;
            }
        } else {
            // Fallback to localStorage
            const documents = JSON.parse(localStorage.getItem('nexstaff_documents')) || [];
            const newDocument = {
                id: Date.now(),
                employeeId,
                ...document,
                uploadedAt: new Date().toISOString()
            };
            
            documents.push(newDocument);
            localStorage.setItem('nexstaff_documents', JSON.stringify(documents));
            return newDocument;
        }
    },

    async getDocuments(employeeId) {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.documents.get(employeeId);
            if (result.success) {
                return result.data;
            } else {
                console.error('Error fetching documents from Supabase:', result.error);
                return {};
            }
        } else {
            // Fallback to localStorage
            const documents = JSON.parse(localStorage.getItem('nexstaff_documents')) || [];
            return documents.filter(doc => doc.employeeId === employeeId);
        }
    },

    // Training Management
    async assignTraining(employeeId, training) {
        const trainings = JSON.parse(localStorage.getItem('nexstaff_training')) || [];
        const newTraining = {
            id: Date.now(),
            employeeId,
            ...training,
            status: 'assigned',
            assignedAt: new Date().toISOString()
        };
        
        trainings.push(newTraining);
        localStorage.setItem('nexstaff_training', JSON.stringify(trainings));
        return newTraining;
    },

    async getTrainings(employeeId) {
        const trainings = JSON.parse(localStorage.getItem('nexstaff_training')) || [];
        return trainings.filter(training => training.employeeId === employeeId);
    },

    // Payroll Management
    async recordPayroll(employeeId, payroll) {
        const payrolls = JSON.parse(localStorage.getItem('nexstaff_payroll')) || [];
        const newPayroll = {
            id: Date.now(),
            employeeId,
            ...payroll,
            processedAt: new Date().toISOString()
        };
        
        payrolls.push(newPayroll);
        localStorage.setItem('nexstaff_payroll', JSON.stringify(payrolls));
        return newPayroll;
    },

    async getPayrollHistory(employeeId) {
        const payrolls = JSON.parse(localStorage.getItem('nexstaff_payroll')) || [];
        return payrolls.filter(payroll => payroll.employeeId === employeeId);
    },

    // Department Operations
    async getDepartments() {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.departments.getAll();
            if (result.success) {
                return result.data;
            } else {
                console.error('Error fetching departments from Supabase:', result.error);
                return [];
            }
        } else {
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('nexstaff_departments')) || [];
        }
    },

    async getPositions(departmentId) {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.positions.getAll(departmentId);
            if (result.success) {
                return result.data;
            } else {
                console.error('Error fetching positions from Supabase:', result.error);
                return [];
            }
        } else {
            // Fallback to localStorage
            const positions = JSON.parse(localStorage.getItem('nexstaff_positions')) || [];
            return departmentId ? 
                positions.filter(pos => pos.departmentId === departmentId) : 
                positions;
        }
    },

    // Analytics
    async getAnalytics() {
        if (this.isSupabaseAvailable()) {
            const result = await AdminSupabaseClient.analytics.getEmployeeStats();
            if (result.success) {
                return result.data;
            } else {
                console.error('Error fetching analytics from Supabase:', result.error);
                return this.getLocalAnalytics();
            }
        } else {
            return this.getLocalAnalytics();
        }
    },

    async getLocalAnalytics() {
        const employees = await this.getEmployees();
        const departments = await this.getDepartments();
        
        return {
            totalEmployees: employees.length,
            byDepartment: departments.map(dept => ({
                department: dept.name,
                count: employees.filter(emp => emp.departmentId === dept.id).length
            })),
            byStatus: {
                [this.STATUS.ACTIVE]: employees.filter(emp => emp.status === this.STATUS.ACTIVE).length,
                [this.STATUS.ON_LEAVE]: employees.filter(emp => emp.status === this.STATUS.ON_LEAVE).length,
                [this.STATUS.TERMINATED]: employees.filter(emp => emp.status === this.STATUS.TERMINATED).length,
                [this.STATUS.RESIGNED]: employees.filter(emp => emp.status === this.STATUS.RESIGNED).length
            }
        };
    },

    // Enhanced Employee Operations for compatibility
    async saveEmployees(employees) {
        if (this.isSupabaseAvailable()) {
            console.log('Note: saveEmployees is deprecated when using Supabase. Use individual CRUD operations instead.');
            return true;
        } else {
            localStorage.setItem('nexstaff_employees_v2', JSON.stringify(employees));
            return true;
        }
    },

    async createNewEmployee(data) {
        // Generate employee ID
        const employeeId = await this.generateEmployeeId();
        
        const employeeData = {
            personalDetails: {
                ...this.EMPLOYEE_TEMPLATE.personalDetails,
                ...data.personalDetails,
                employeeId
            },
            jobDetails: {
                ...this.EMPLOYEE_TEMPLATE.jobDetails,
                ...data.jobDetails,
                joiningDate: new Date().toISOString()
            },
            ...data
        };

        return await this.createEmployee(employeeData);
    },

    // Employee ID Generator
    async generateEmployeeId() {
        const employees = await this.getEmployees();
        const maxId = employees.length > 0 
            ? Math.max(...employees.map(e => {
                const id = e.personalDetails?.employeeId || e.employeeId || 'EMP00000';
                return parseInt(id.slice(3));
            })) 
            : 0;
        return `EMP${(maxId + 1).toString().padStart(5, '0')}`;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    EmployeeManagementAPI.init();
});

// Make it available globally
window.EmployeeManagementAPI = EmployeeManagementAPI;
