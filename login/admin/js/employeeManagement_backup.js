// Employee Management System Data API - Supabase Edition
const EmployeeManagementAPI = {
    // Employee Status
    STATUS: {
        ACTIVE: 'Active',
        ON_LEAVE: 'On Leave',
        TERMINATED: 'Terminated',
        RESIGNED: 'Resigned'
    },

    // Check if Supabase is available
    isSupabaseAvailable() {
        return typeof AdminSupabaseClient !== 'undefined' && AdminSupabaseClient;
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
    },    // Initialize with Supabase
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
    },    // Employee CRUD operations
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
    },    // Attendance Management
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
    },    // Performance Management
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
    },    // Document Management
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
        const trainings = JSON.parse(localStorage.getItem(this.KEYS.TRAINING)) || [];
        const newTraining = {
            id: Date.now(),
            employeeId,
            ...training,
            status: 'assigned',
            assignedAt: new Date().toISOString()
        };
        
        trainings.push(newTraining);
        localStorage.setItem(this.KEYS.TRAINING, JSON.stringify(trainings));
        return newTraining;
    },

    async getTrainings(employeeId) {
        const trainings = JSON.parse(localStorage.getItem(this.KEYS.TRAINING)) || [];
        return trainings.filter(training => training.employeeId === employeeId);
    },

    // Payroll Management
    async recordPayroll(employeeId, payroll) {
        const payrolls = JSON.parse(localStorage.getItem(this.KEYS.PAYROLL)) || [];
        const newPayroll = {
            id: Date.now(),
            employeeId,
            ...payroll,
            processedAt: new Date().toISOString()
        };
        
        payrolls.push(newPayroll);
        localStorage.setItem(this.KEYS.PAYROLL, JSON.stringify(payrolls));
        return newPayroll;
    },

    async getPayrollHistory(employeeId) {
        const payrolls = JSON.parse(localStorage.getItem(this.KEYS.PAYROLL)) || [];
        return payrolls.filter(payroll => payroll.employeeId === employeeId);
    },    // Department Operations
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
    },    // Enhanced Employee Operations for compatibility
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
    },

    // Backward compatibility methods
    getEmployees() {
        return this.getEmployees();
    },

    getEmployeeById(employeeId) {
        // Handle both numeric and string IDs
        if (typeof employeeId === 'string' && employeeId.startsWith('EMP')) {
            return this.getEmployees().then(employees => 
                employees.find(emp => 
                    emp.personalDetails?.employeeId === employeeId || 
                    emp.employeeId === employeeId
                )
            );
        } else {
            return this.getEmployeeById(employeeId);
        }
    },

    async updateEmployee(employeeId, updates) {
        // Handle both numeric and string IDs
        if (typeof employeeId === 'string' && employeeId.startsWith('EMP')) {
            const employees = await this.getEmployees();
            const employee = employees.find(emp => 
                emp.personalDetails?.employeeId === employeeId || 
                emp.employeeId === employeeId
            );
            if (employee) {
                return await this.updateEmployee(employee.id, updates);
            }
            return null;
        } else {
            return await this.updateEmployee(employeeId, updates);
        }
    },
            };
            this.saveEmployees(employees);            return await this.updateEmployee(employee.id, updates);
        }
        return null;
    }
};
        };
    },

    // Helper Methods for Analytics
    getDepartmentDistribution(employees) {
        return employees.reduce((acc, emp) => {
            const dept = emp.jobDetails.department;
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
        }, {});
    },

    getAttendanceSummary(employees) {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
        
        return employees.map(emp => ({
            employeeId: emp.personalDetails.employeeId,
            name: emp.personalDetails.fullName,
            attendance: emp.attendance.records.filter(record => 
                new Date(record.timestamp) >= thirtyDaysAgo
            ).length
        }));
    },

    getPerformanceOverview(employees) {
        return employees.reduce((acc, emp) => {
            const latestReview = emp.performance.reviews[emp.performance.reviews.length - 1];
            if (latestReview) {
                acc[latestReview.rating] = (acc[latestReview.rating] || 0) + 1;
            }
            return acc;
        }, {});
    },

    getLeaveMetrics(employees) {
        return employees.reduce((acc, emp) => {
            emp.attendance.leaves.history.forEach(leave => {
                acc[leave.type] = (acc[leave.type] || 0) + 1;
            });
            return acc;
        }, {});
    },

    getTurnoverRate(employees) {
        const resigned = employees.filter(emp => 
            emp.jobDetails.employmentStatus === 'Resigned' || 
            emp.jobDetails.employmentStatus === 'Terminated'
        ).length;
        return (resigned / employees.length) * 100;
    },

    setupEventListeners() {
        // Add Employee button click handler
        const addBtn = document.getElementById('addEmployeeBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showEmployeeModal());
        }

        // Global event delegation for employee actions
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const employeeId = target.closest('[data-employee-id]')?.dataset.employeeId;

            switch (action) {
                case 'edit':
                    this.showEmployeeModal(employeeId);
                    break;
                case 'delete':
                    this.confirmDeleteEmployee(employeeId);
                    break;
            }
        });
    },

    showEmployeeModal(employeeId = null) {
        const employee = employeeId ? this.getEmployeeById(employeeId) : null;
        const modalTitle = employee ? 'Edit Employee' : 'Add Employee';

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${modalTitle}</h2>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <form id="employeeForm">
                    <input type="hidden" name="id" value="${employee?.id || ''}">
                    <div class="form-group">
                        <label for="fullName">Full Name</label>
                        <input type="text" id="fullName" name="fullName" value="${employee?.fullName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="role">Role</label>
                        <select id="role" name="role" required>
                            <option value="">Select Role</option>
                            <option value="Admin" ${employee?.role === 'Admin' ? 'selected' : ''}>Admin</option>
                            <option value="Hardware" ${employee?.role === 'Hardware' ? 'selected' : ''}>Hardware</option>
                            <option value="Software" ${employee?.role === 'Software' ? 'selected' : ''}>Software</option>
                            <option value="Marketing" ${employee?.role === 'Marketing' ? 'selected' : ''}>Marketing</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone</label>
                        <input type="tel" id="phone" name="phone" value="${employee?.phone || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" value="${employee?.email || ''}" required>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            if (employee) {
                this.updateEmployee(data);
            } else {
                this.addEmployee(data);
            }
            
            modal.remove();
        });
    },

    confirmDeleteEmployee(employeeId) {
        const employee = this.getEmployeeById(employeeId);
        if (!employee) return;

        if (confirm(`Are you sure you want to remove ${employee.fullName}?`)) {
            this.deleteEmployee(employeeId);
        }
    },

    async getEmployees() {
        try {
            // Try to use DataService first (which uses Supabase if available)
            if (typeof DataService !== 'undefined' && DataService.getEmployees) {
                console.log('Using DataService to get employees');
                return await DataService.getEmployees();
            } else {
                // Fallback to local storage
                console.log('Using localStorage to get employees');
                return JSON.parse(localStorage.getItem('employees')) || [];
            }
        } catch (error) {
            console.error('Error getting employees:', error);
            return [];
        }
    },

    getEmployeeById(id) {
        return this.getEmployees().find(emp => emp.id === id);
    },

    async addEmployee(data) {
        try {
            const newEmployee = {
                ...data,
                id: Date.now().toString(),
                joinDate: new Date().toISOString().split('T')[0],
                photo: data.photo || '../client/img/default-avatar.png'
            };
            
            // Try to use DataService first (which uses Supabase if available)
            if (typeof DataService !== 'undefined' && DataService.addEmployee) {
                console.log('Using DataService to add employee');
                await DataService.addEmployee(newEmployee);
            } else {
                // Fallback to local storage
                console.log('Using localStorage to add employee');
                const employees = this.getEmployees();
                employees.push(newEmployee);
                localStorage.setItem(this.KEYS.EMPLOYEES, JSON.stringify(employees));
            }
            
            this.refreshEmployeeList();
            this.showNotification('Employee added successfully!', 'success');
        } catch (error) {
            console.error('Error adding employee:', error);
            this.showNotification('Failed to add employee. Please try again.', 'error');
        }
    },

    updateEmployee(data) {
        const employees = this.getEmployees();
        const index = employees.findIndex(emp => emp.id === data.id);
        
        if (index >= 0) {
            employees[index] = {
                ...employees[index],
                ...data
            };
            localStorage.setItem('employees', JSON.stringify(employees));
            this.refreshEmployeeList();
            this.showNotification('Employee updated successfully!', 'success');
        }
    },

    deleteEmployee(id) {
        const employees = this.getEmployees().filter(emp => emp.id !== id);
        localStorage.setItem('employees', JSON.stringify(employees));
        this.refreshEmployeeList();
        this.showNotification('Employee removed successfully!', 'success');
    },

    refreshEmployeeList() {
        const container = document.getElementById('employeeCards');
        if (!container) return;

        const employees = this.getEmployees();
        if (employees.length === 0) {
            container.innerHTML = '<div class="no-data">No employees found.</div>';
            return;
        }

        container.innerHTML = employees.map(emp => `
            <div class="employee-card" data-employee-id="${emp.id}">
                <img src="${emp.photo}" alt="${emp.fullName}" class="employee-photo">
                <h3 class="employee-name">${emp.fullName}</h3>
                <p class="employee-role">
                    <span class="role-badge ${emp.role.toLowerCase()}">${emp.role}</span>
                </p>
                <div class="employee-contact">
                    <span><i class="phone-icon"></i>${emp.phone}</span>
                    <span><i class="email-icon"></i>${emp.email}</span>
                </div>
                <div class="join-date">Joined: ${new Date(emp.joinDate).toLocaleDateString()}</div>
                <div class="employee-actions">
                    <button class="btn btn-icon" data-action="edit" title="Edit">
                        <i class="edit-icon"></i>
                    </button>
                    <button class="btn btn-icon" data-action="delete" title="Remove">
                        <i class="delete-icon"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="message">${message}</span>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

        let container = document.getElementById('notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications';
            document.body.appendChild(container);
        }

        container.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
};
