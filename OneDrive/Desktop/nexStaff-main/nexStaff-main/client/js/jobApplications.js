// Job Applications Management
class JobApplicationManager {
    constructor() {
        this.modal = document.getElementById('applicationModal');
        this.form = document.getElementById('applicationForm');
        
        if (this.modal && this.form) {
            this.closeBtn = this.modal.querySelector('.close');
            this.setupEventListeners();
        }
        
        // Initialize data manager reference
        this.dataManager = typeof nexStaffData !== 'undefined' ? nexStaffData : null;
    }

    setupEventListeners() {
        // Handle modal close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });

        // Handle form submission
        this.form.addEventListener('submit', (event) => this.handleSubmit(event));

        // Handle "Apply Now" buttons
        document.addEventListener('click', (event) => {
            const applyButton = event.target.closest('.apply-btn');
            if (applyButton && applyButton.onclick) {
                // Handled by onclick attribute
                return;
            }
        });
    }

    openModal(jobInfo) {
        if (!this.modal || !this.form) return;
        
        // Set job information
        const jobIdField = this.form.querySelector('#jobId') || this.form.querySelector('[name="jobId"]');
        const jobTitleField = this.form.querySelector('#jobTitle') || this.form.querySelector('[name="jobTitle"]');
        const companyNameField = this.form.querySelector('#companyName') || this.form.querySelector('[name="companyName"]');
        
        if (jobIdField) jobIdField.value = jobInfo.jobId || '';
        if (jobTitleField) jobTitleField.value = jobInfo.jobTitle || '';
        if (companyNameField) companyNameField.value = jobInfo.companyName || '';
        
        // Update modal display elements
        const modalJobTitle = this.modal.querySelector('#modal-job-title') || this.modal.querySelector('.modal-job-title');
        const modalCompanyName = this.modal.querySelector('#modal-company-name') || this.modal.querySelector('.modal-company-name');
        
        if (modalJobTitle) modalJobTitle.textContent = jobInfo.jobTitle || 'Job Application';
        if (modalCompanyName) modalCompanyName.textContent = jobInfo.companyName || '';
        
        // Show modal
        this.modal.style.display = 'block';        // Show modal
        this.modal.style.display = 'block';
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.style.display = 'none';
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        if (this.form) this.form.reset();
    }

    async handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(this.form);
        
        // Get job information
        const jobId = sessionStorage.getItem('applying_job_id') || formData.get('jobId');
        const jobTitle = sessionStorage.getItem('applying_job_title') || formData.get('jobTitle');
        const companyName = sessionStorage.getItem('applying_company_name') || formData.get('companyName');
        
        const applicationData = {
            jobId: jobId,
            jobTitle: jobTitle,
            companyName: companyName,
            candidateName: formData.get('fullName') || formData.get('candidateName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            coverLetter: formData.get('coverLetter'),
            expectedSalary: formData.get('expectedSalary') || formData.get('salary'),
            availability: formData.get('availability') || 'Immediate',
            portfolioLinks: [formData.get('portfolio')].filter(Boolean),
            referenceContact: formData.get('reference')
        };

        try {
            // Handle resume file if present
            const resumeFile = formData.get('resume');
            if (resumeFile && resumeFile.size > 0) {
                const base64Resume = await this.fileToBase64(resumeFile);
                applicationData.resumeUrl = base64Resume;
                applicationData.resumeName = resumeFile.name;
            }

            // Create candidate profile if not exists
            let candidateId = this.createOrUpdateCandidate(applicationData);
            applicationData.candidateId = candidateId;

            // Submit application through data manager
            if (this.dataManager) {
                // Get job and employer details
                const job = this.dataManager.getJob(jobId);
                if (job) {
                    applicationData.employerId = job.employerId;
                    applicationData.employerName = job.company;
                }
                
                const application = this.dataManager.addApplication(applicationData);
                console.log('Application submitted:', application);
            } else {
                // Fallback to localStorage
                const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
                applications.push({
                    ...applicationData,
                    id: 'APP' + String(applications.length + 1).padStart(3, '0'),
                    appliedDate: new Date().toISOString().split('T')[0],
                    status: 'Pending',
                    stage: 'Initial Review',
                    score: null,
                    lastUpdated: new Date().toISOString().split('T')[0]
                });
                localStorage.setItem('jobApplications', JSON.stringify(applications));
            }

            // Clear session storage
            sessionStorage.removeItem('applying_job_id');
            sessionStorage.removeItem('applying_job_title');
            sessionStorage.removeItem('applying_company_name');

            // Notify success
            this.showNotification('Application submitted successfully! You will be contacted soon.', 'success');
            this.closeModal();
            
            // Dispatch event for dashboard updates
            document.dispatchEvent(new CustomEvent('applicationSubmitted', { detail: applicationData }));
            
        } catch (error) {
            console.error('Error submitting application:', error);
            this.showNotification('Error submitting application. Please try again.', 'error');
        }
    }

    createOrUpdateCandidate(applicationData) {
        if (!this.dataManager) return null;
        
        // Check if candidate already exists by email
        const candidates = this.dataManager.getCandidates();
        let existingCandidate = candidates.find(c => c.email === applicationData.email);
        
        if (existingCandidate) {
            // Update existing candidate's applied jobs
            if (!existingCandidate.appliedJobs.includes(applicationData.jobId)) {
                existingCandidate.appliedJobs.push(applicationData.jobId);
                this.dataManager.updateCandidate(existingCandidate.id, {
                    appliedJobs: existingCandidate.appliedJobs,
                    lastActive: new Date().toISOString().split('T')[0]
                });
            }
            return existingCandidate.id;
        } else {
            // Create new candidate
            const candidateData = {
                name: applicationData.candidateName,
                email: applicationData.email,
                phone: applicationData.phone,
                skills: [], // Can be extracted from cover letter or additional fields
                experience: 'Not specified',
                preferredRole: applicationData.jobTitle,
                status: 'Available',
                resumeUrl: applicationData.resumeUrl,
                portfolioUrl: applicationData.portfolioLinks?.[0],
                appliedJobs: [applicationData.jobId],
                salary_expectation: applicationData.expectedSalary,
                availability: applicationData.availability
            };
            
            const newCandidate = this.dataManager.addCandidate(candidateData);
            return newCandidate.id;
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new JobApplicationManager();
});
