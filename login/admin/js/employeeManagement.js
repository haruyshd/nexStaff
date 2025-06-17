// Employee Management System Data API
const EmployeeManagementAPI = {
    // Storage keys
    KEYS: {
        EMPLOYEES: 'nexstaff_employees_v2',
        DEPARTMENTS: 'nexstaff_departments',
        POSITIONS: 'nexstaff_positions',
        ATTENDANCE: 'nexstaff_attendance',
        PERFORMANCE: 'nexstaff_performance',
        DOCUMENTS: 'nexstaff_documents',
        TRAINING: 'nexstaff_training',
        PAYROLL: 'nexstaff_payroll',
        LEAVES: 'nexstaff_leaves',
        TAX_INFO: 'nexstaff_tax_info',
        EMERGENCY_CONTACTS: 'nexstaff_emergency_contacts'
    },

    // Employee Status
    STATUS: {
        ACTIVE: 'active',
        ON_LEAVE: 'on_leave',
        TERMINATED: 'terminated',
        RESIGNED: 'resigned'
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

    // Initialize storage with default data
    init() {
        // Initialize departments
        if (!localStorage.getItem(this.KEYS.DEPARTMENTS)) {
            const defaultDepartments = [
                { id: 1, name: 'Human Resources', code: 'HR' },
                { id: 2, name: 'Information Technology', code: 'IT' },
                { id: 3, name: 'Finance', code: 'FIN' },
                { id: 4, name: 'Marketing', code: 'MKT' },
                { id: 5, name: 'Operations', code: 'OPS' }
            ];
            localStorage.setItem(this.KEYS.DEPARTMENTS, JSON.stringify(defaultDepartments));
        }

        // Initialize positions
        if (!localStorage.getItem(this.KEYS.POSITIONS)) {
            const defaultPositions = [
                { id: 1, name: 'HR Manager', departmentId: 1, level: 'manager' },
                { id: 2, name: 'Software Engineer', departmentId: 2, level: 'staff' },
                { id: 3, name: 'Financial Analyst', departmentId: 3, level: 'staff' },
                { id: 4, name: 'Marketing Specialist', departmentId: 4, level: 'staff' },
                { id: 5, name: 'Operations Manager', departmentId: 5, level: 'manager' }
            ];
            localStorage.setItem(this.KEYS.POSITIONS, JSON.stringify(defaultPositions));
        }
    },
    // Employee CRUD operations
    async getEmployees(filters = {}) {
        const employees = JSON.parse(localStorage.getItem(this.KEYS.EMPLOYEES)) || [];
        
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
    },

    async getEmployeeById(id) {
        const employees = await this.getEmployees();
        return employees.find(emp => emp.id === id);
    },

    async createEmployee(data) {
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
        localStorage.setItem(this.KEYS.EMPLOYEES, JSON.stringify(employees));
        
        return newEmployee;
    },

    async updateEmployee(id, data) {
        const employees = await this.getEmployees();
        const index = employees.findIndex(emp => emp.id === id);
        
        if (index !== -1) {
            employees[index] = {
                ...employees[index],
                ...data,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(this.KEYS.EMPLOYEES, JSON.stringify(employees));
            return employees[index];
        }
        return null;
    },

    async deleteEmployee(id) {
        const employees = await this.getEmployees();
        const filtered = employees.filter(emp => emp.id !== id);
        localStorage.setItem(this.KEYS.EMPLOYEES, JSON.stringify(filtered));
        return true;
    },

    // Attendance Management
    async recordAttendance(employeeId, data) {
        const attendance = JSON.parse(localStorage.getItem(this.KEYS.ATTENDANCE)) || [];
        const newRecord = {
            id: Date.now(),
            employeeId,
            ...data,
            timestamp: new Date().toISOString()
        };
        
        attendance.push(newRecord);
        localStorage.setItem(this.KEYS.ATTENDANCE, JSON.stringify(attendance));
        return newRecord;
    },

    async getAttendance(employeeId, startDate, endDate) {
        const attendance = JSON.parse(localStorage.getItem(this.KEYS.ATTENDANCE)) || [];
        return attendance.filter(record => {
            const recordDate = new Date(record.timestamp);
            return record.employeeId === employeeId &&
                   (!startDate || recordDate >= new Date(startDate)) &&
                   (!endDate || recordDate <= new Date(endDate));
        });
    },

    // Performance Management
    async addPerformanceReview(employeeId, review) {
        const reviews = JSON.parse(localStorage.getItem(this.KEYS.PERFORMANCE)) || [];
        const newReview = {
            id: Date.now(),
            employeeId,
            ...review,
            createdAt: new Date().toISOString()
        };
        
        reviews.push(newReview);
        localStorage.setItem(this.KEYS.PERFORMANCE, JSON.stringify(reviews));
        return newReview;
    },

    async getPerformanceReviews(employeeId) {
        const reviews = JSON.parse(localStorage.getItem(this.KEYS.PERFORMANCE)) || [];
        return reviews.filter(review => review.employeeId === employeeId);
    },

    // Document Management
    async uploadDocument(employeeId, document) {
        const documents = JSON.parse(localStorage.getItem(this.KEYS.DOCUMENTS)) || [];
        const newDocument = {
            id: Date.now(),
            employeeId,
            ...document,
            uploadedAt: new Date().toISOString()
        };
        
        documents.push(newDocument);
        localStorage.setItem(this.KEYS.DOCUMENTS, JSON.stringify(documents));
        return newDocument;
    },

    async getDocuments(employeeId) {
        const documents = JSON.parse(localStorage.getItem(this.KEYS.DOCUMENTS)) || [];
        return documents.filter(doc => doc.employeeId === employeeId);
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
    },

    // Department Operations
    async getDepartments() {
        return JSON.parse(localStorage.getItem(this.KEYS.DEPARTMENTS)) || [];
    },

    async getPositions(departmentId) {
        const positions = JSON.parse(localStorage.getItem(this.KEYS.POSITIONS)) || [];
        return departmentId ? 
            positions.filter(pos => pos.departmentId === departmentId) : 
            positions;
    },

    // Analytics
    async getAnalytics() {
        const employees = await this.getEmployees();
        const departments = await this.getDepartments();
        
        return {
            totalEmployees: employees.length,
            byDepartment: departments.map(dept => ({
                department: dept.name,
                count: employees.filter(emp => emp.departmentId === dept.id).length
            })),
            byStatus: Object.values(this.STATUS).map(status => ({
                status,
                count: employees.filter(emp => emp.status === status).length
            }))
        };
    },

    // Save to localStorage
    saveEmployees(employees) {
        localStorage.setItem(this.KEYS.EMPLOYEES, JSON.stringify(employees));
    },

    // Initialize new employee
    createNewEmployee(data) {
        const employeeId = this.generateEmployeeId();
        const newEmployee = {
            ...this.EMPLOYEE_TEMPLATE,
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const employees = this.getEmployees();
        employees.push(newEmployee);
        this.saveEmployees(employees);
        return newEmployee;
    },

    // Employee ID Generator
    generateEmployeeId() {
        const employees = this.getEmployees();
        const maxId = employees.length > 0 
            ? Math.max(...employees.map(e => parseInt(e.personalDetails.employeeId.slice(3)))) 
            : 0;
        return `EMP${(maxId + 1).toString().padStart(5, '0')}`;
    },

    // Enhanced CRUD Operations
    getEmployees() {
        return JSON.parse(localStorage.getItem(this.KEYS.EMPLOYEES)) || [];
    },

    getEmployeeById(employeeId) {
        return this.getEmployees().find(emp => emp.personalDetails.employeeId === employeeId);
    },

    updateEmployee(employeeId, updates) {
        const employees = this.getEmployees();
        const index = employees.findIndex(emp => emp.personalDetails.employeeId === employeeId);
        if (index !== -1) {
            employees[index] = {
                ...employees[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveEmployees(employees);
            return employees[index];
        }
        return null;
    },

    // Attendance Management
    recordAttendance(employeeId, type, time = new Date()) {
        const employee = this.getEmployeeById(employeeId);
        if (employee) {
            const record = {
                type, // CHECK_IN, CHECK_OUT
                timestamp: time.toISOString(),
                location: '', // Could be integrated with geolocation
            };
            employee.attendance.records.push(record);
            return this.updateEmployee(employeeId, employee);
        }
        return null;
    },

    // Leave Management
    requestLeave(employeeId, leaveData) {
        const employee = this.getEmployeeById(employeeId);
        if (employee) {
            const leave = {
                ...leaveData,
                status: 'PENDING',
                requestedAt: new Date().toISOString()
            };
            employee.attendance.leaves.history.push(leave);
            return this.updateEmployee(employeeId, employee);
        }
        return null;
    },

    // Performance Management
    addPerformanceReview(employeeId, reviewData) {
        const employee = this.getEmployeeById(employeeId);
        if (employee) {
            const review = {
                ...reviewData,
                date: new Date().toISOString(),
                reviewerId: '', // Should be set to current user
                status: 'DRAFT'
            };
            employee.performance.reviews.push(review);
            return this.updateEmployee(employeeId, employee);
        }
        return null;
    },

    // Document Management
    addDocument(employeeId, documentData) {
        const employee = this.getEmployeeById(employeeId);
        if (employee) {
            const document = {
                ...documentData,
                uploadedAt: new Date().toISOString(),
                uploadedBy: '', // Should be set to current user
                status: 'ACTIVE'
            };
            employee.documents[documentData.type].push(document);
            return this.updateEmployee(employeeId, employee);
        }
        return null;
    },

    // Training Management
    enrollInTraining(employeeId, trainingData) {
        const employee = this.getEmployeeById(employeeId);
        if (employee) {
            const training = {
                ...trainingData,
                enrolledAt: new Date().toISOString(),
                status: 'ENROLLED'
            };
            employee.training.enrolled.push(training);
            return this.updateEmployee(employeeId, employee);
        }
        return null;
    },

    // Analytics
    getAnalytics() {
        const employees = this.getEmployees();
        return {
            totalEmployees: employees.length,
            departmentDistribution: this.getDepartmentDistribution(employees),
            attendanceSummary: this.getAttendanceSummary(employees),
            performanceOverview: this.getPerformanceOverview(employees),
            leaveMetrics: this.getLeaveMetrics(employees),
            turnoverRate: this.getTurnoverRate(employees)
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
