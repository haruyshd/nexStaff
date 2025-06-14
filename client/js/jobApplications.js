// Job Applications Management
class JobApplicationManager {
    constructor() {
        this.modal = document.getElementById('applicationModal');
        this.form = document.getElementById('applicationForm');
        this.closeBtn = this.modal.querySelector('.close');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle modal close button
        this.closeBtn.addEventListener('click', () => this.closeModal());

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
            if (applyButton) {
                const jobCard = applyButton.closest('.job-card');
                this.openModal({
                    jobId: jobCard.dataset.jobId,
                    jobTitle: jobCard.querySelector('h3').textContent,
                    companyName: jobCard.querySelector('.company').textContent
                });
            }
        });
    }

    openModal(jobInfo) {
        // Set hidden fields
        this.form.querySelector('#jobId').value = jobInfo.jobId;
        this.form.querySelector('#jobTitle').value = jobInfo.jobTitle;
        this.form.querySelector('#companyName').value = jobInfo.companyName;
        
        // Show modal
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.form.reset();
    }

    async handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(this.form);
        const applicationData = {
            jobId: formData.get('jobId'),
            jobTitle: formData.get('jobTitle'),
            companyName: formData.get('companyName'),
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            coverLetter: formData.get('coverLetter'),
            resumeName: formData.get('resume').name
        };

        try {
            // Convert resume file to base64
            const resumeFile = formData.get('resume');
            const base64Resume = await this.fileToBase64(resumeFile);
            applicationData.resume = base64Resume;

            // Save to localStorage
            const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            applications.push({
                ...applicationData,
                id: Date.now().toString(),
                status: 'New',
                submittedAt: new Date().toISOString()
            });
            localStorage.setItem('jobApplications', JSON.stringify(applications));

            // Notify dashboard
            document.dispatchEvent(new CustomEvent('applicationSubmitted'));
            
            this.showNotification('Application submitted successfully!', 'success');
            this.closeModal();
        } catch (error) {
            console.error('Error submitting application:', error);
            this.showNotification('Error submitting application. Please try again.', 'error');
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
