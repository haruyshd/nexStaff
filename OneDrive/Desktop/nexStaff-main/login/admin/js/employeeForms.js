// Employee Forms and UI Handler
const EmployeeForms = {
    init() {
        this.bindFormEvents();
        this.initializeFormValidation();
        this.setupImageUpload();
    },

    bindFormEvents() {
        // Personal Details Form
        document.getElementById('personalDetailsForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePersonalDetailsSubmit(e.target);
        });

        // Job Details Form
        document.getElementById('jobDetailsForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleJobDetailsSubmit(e.target);
        });

        // Salary Form
        document.getElementById('salaryForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSalarySubmit(e.target);
        });

        // Leave Request Form
        document.getElementById('leaveRequestForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLeaveRequestSubmit(e.target);
        });

        // Document Upload Form
        document.getElementById('documentUploadForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDocumentUpload(e.target);
        });

        // Performance Review Form
        document.getElementById('performanceReviewForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePerformanceReview(e.target);
        });

        // Training Enrollment Form
        document.getElementById('trainingEnrollmentForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTrainingEnrollment(e.target);
        });

        // Resignation Form
        document.getElementById('resignationForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleResignation(e.target);
        });
    },

    initializeFormValidation() {
        // Add custom validation rules
        this.addValidationRules();

        // Initialize validation for all forms
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('input', (e) => {
                this.validateField(e.target);
            });
        });
    },

    addValidationRules() {
        // Custom validation for Employee ID format
        this.addEmployeeIdValidation();
        
        // Custom validation for phone numbers
        this.addPhoneNumberValidation();
        
        // Custom validation for email addresses
        this.addEmailValidation();
        
        // Custom validation for dates
        this.addDateValidation();
        
        // Custom validation for file uploads
        this.addFileValidation();
    },

    setupImageUpload() {
        const profilePicture = document.getElementById('profilePicture');
        if (profilePicture) {
            profilePicture.addEventListener('change', (e) => {
                this.handleImageUpload(e.target.files[0]);
            });
        }
    },

    // Form Submission Handlers
    async handlePersonalDetailsSubmit(form) {
        try {
            const formData = new FormData(form);
            const employeeId = form.dataset.employeeId;
            
            const personalDetails = {
                fullName: formData.get('fullName'),
                dateOfBirth: formData.get('dateOfBirth'),
                gender: formData.get('gender'),
                contactNumber: formData.get('contactNumber'),
                email: formData.get('email'),
                residentialAddress: formData.get('address'),
                emergencyContacts: JSON.parse(formData.get('emergencyContacts') || '[]')
            };

            const result = await EmployeeManagementAPI.updateEmployee(employeeId, { personalDetails });
            if (result) {
                this.showSuccess('Personal details updated successfully');
                this.refreshEmployeeData(employeeId);
            }
        } catch (error) {
            this.showError('Failed to update personal details');
            console.error(error);
        }
    },

    async handleJobDetailsSubmit(form) {
        try {
            const formData = new FormData(form);
            const employeeId = form.dataset.employeeId;
            
            const jobDetails = {
                department: formData.get('department'),
                jobTitle: formData.get('jobTitle'),
                employmentType: formData.get('employmentType'),
                workLocation: formData.get('workLocation'),
                reportingManager: formData.get('reportingManager'),
                employmentStatus: formData.get('employmentStatus')
            };

            const result = await EmployeeManagementAPI.updateEmployee(employeeId, { jobDetails });
            if (result) {
                this.showSuccess('Job details updated successfully');
                this.refreshEmployeeData(employeeId);
            }
        } catch (error) {
            this.showError('Failed to update job details');
            console.error(error);
        }
    },

    async handleSalarySubmit(form) {
        try {
            const formData = new FormData(form);
            const employeeId = form.dataset.employeeId;
            
            const salaryDetails = {
                basic: parseFloat(formData.get('basicSalary')),
                allowances: JSON.parse(formData.get('allowances') || '[]'),
                deductions: JSON.parse(formData.get('deductions') || '[]'),
                bankDetails: {
                    accountName: formData.get('accountName'),
                    accountNumber: formData.get('accountNumber'),
                    bankName: formData.get('bankName'),
                    branchCode: formData.get('branchCode')
                },
                taxInfo: {
                    tin: formData.get('tin'),
                    sss: formData.get('sss'),
                    philHealth: formData.get('philHealth'),
                    pagIbig: formData.get('pagIbig')
                }
            };

            const result = await EmployeeManagementAPI.updateEmployee(employeeId, { salary: salaryDetails });
            if (result) {
                this.showSuccess('Salary details updated successfully');
                this.refreshEmployeeData(employeeId);
            }
        } catch (error) {
            this.showError('Failed to update salary details');
            console.error(error);
        }
    },

    async handleLeaveRequestSubmit(form) {
        try {
            const formData = new FormData(form);
            const employeeId = form.dataset.employeeId;
            
            const leaveRequest = {
                type: formData.get('leaveType'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                reason: formData.get('reason'),
                attachments: JSON.parse(formData.get('attachments') || '[]')
            };

            const result = await EmployeeManagementAPI.requestLeave(employeeId, leaveRequest);
            if (result) {
                this.showSuccess('Leave request submitted successfully');
                this.refreshEmployeeData(employeeId);
            }
        } catch (error) {
            this.showError('Failed to submit leave request');
            console.error(error);
        }
    },

    // UI Helper Functions
    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    validateField(field) {
        const value = field.value;
        const type = field.type;
        const name = field.name;

        field.setCustomValidity('');
        field.classList.remove('invalid');

        // Custom validation based on field type and name
        switch(type) {
            case 'email':
                if (!this.isValidEmail(value)) {
                    field.setCustomValidity('Please enter a valid email address');
                }
                break;
            case 'tel':
                if (!this.isValidPhone(value)) {
                    field.setCustomValidity('Please enter a valid phone number');
                }
                break;
            case 'date':
                if (!this.isValidDate(value)) {
                    field.setCustomValidity('Please enter a valid date');
                }
                break;
        }

        // Show validation message
        if (!field.validity.valid) {
            field.classList.add('invalid');
            this.showFieldError(field);
        }
    },

    showFieldError(field) {
        const errorElement = field.parentElement.querySelector('.field-error');
        if (errorElement) {
            errorElement.textContent = field.validationMessage;
        }
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isValidPhone(phone) {
        return /^\+?[\d\s-]{10,}$/.test(phone);
    },

    isValidDate(date) {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    },

    async handleImageUpload(file) {
        if (!file) return;
        
        try {
            // Convert to base64 for demo purposes
            // In production, use proper file upload to server
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Image = e.target.result;
                const employeeId = document.querySelector('[data-employee-id]').dataset.employeeId;
                
                const result = await EmployeeManagementAPI.updateEmployee(employeeId, {
                    personalDetails: {
                        profilePicture: base64Image
                    }
                });

                if (result) {
                    this.showSuccess('Profile picture updated successfully');
                    this.refreshEmployeeData(employeeId);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            this.showError('Failed to upload profile picture');
            console.error(error);
        }
    },

    refreshEmployeeData(employeeId) {
        // Refresh the UI with updated employee data
        const employee = EmployeeManagementAPI.getEmployeeById(employeeId);
        if (employee) {
            this.populateEmployeeData(employee);
        }
    },

    populateEmployeeData(employee) {
        // Populate all forms with employee data
        this.populatePersonalDetails(employee);
        this.populateJobDetails(employee);
        this.populateSalaryDetails(employee);
        this.populateAttendanceData(employee);
        this.populatePerformanceData(employee);
        this.populateDocuments(employee);
        this.populateTrainingData(employee);
    }
};
