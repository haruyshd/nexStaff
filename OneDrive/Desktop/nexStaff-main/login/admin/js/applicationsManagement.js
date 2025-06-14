// Applications Management API
const ApplicationsAPI = {
    init() {
        console.log('Initializing ApplicationsAPI');
        this.setupEventListeners();
        this.setupDemoData(); // Add some sample data if empty
        this.refreshApplicationsList();
    },

    setupEventListeners() {
        // Status filter listener
        document.getElementById('applicationStatus')?.addEventListener('change', () => {
            this.refreshApplicationsList();
        });

        // Search input listener
        document.getElementById('applicationSearch')?.addEventListener('input', () => {
            this.refreshApplicationsList();
        });

        // Listen for new applications
        document.addEventListener('applicationSubmitted', (e) => {
            console.log('New application submitted:', e.detail);
            this.refreshApplicationsList();
        });
    },

    setupDemoData() {
        const existingApplications = this.getApplications();
        if (existingApplications.length === 0) {
            const demoApplications = [
                {
                    id: '1',
                    jobTitle: 'Senior Full Stack Developer',
                    companyName: 'NexStaff Technologies',
                    fullName: 'John Smith',
                    email: 'john.smith@email.com',
                    phone: '+1 234-567-8900',
                    status: 'New',
                    submittedAt: '2025-06-13T10:00:00Z',
                    resume: 'data:application/pdf;base64,SGVsbG8='
                },
                {
                    id: '2',
                    jobTitle: 'UI/UX Designer',
                    companyName: 'NexStaff Creative',
                    fullName: 'Emily Johnson',
                    email: 'emily.j@email.com',
                    phone: '+1 234-567-8901',
                    status: 'Under Review',
                    submittedAt: '2025-06-12T15:30:00Z',
                    resume: 'data:application/pdf;base64,V29ybGQ='
                }
            ];
            localStorage.setItem('jobApplications', JSON.stringify(demoApplications));
            console.log('Demo applications data added');
        }
    },

    getApplications() {
        try {
            return JSON.parse(localStorage.getItem('jobApplications')) || [];
        } catch (error) {
            console.error('Error getting applications:', error);
            return [];
        }
    },

    addApplication(applicationData) {
        try {
            const applications = this.getApplications();
            const newApplication = {
                id: Date.now().toString(),
                status: 'New',
                submittedAt: new Date().toISOString(),
                ...applicationData
            };
            
            applications.push(newApplication);
            localStorage.setItem('jobApplications', JSON.stringify(applications));
            
            // Dispatch event for real-time updates
            document.dispatchEvent(new CustomEvent('applicationSubmitted', {
                detail: newApplication
            }));
            
            return true;
        } catch (error) {
            console.error('Error adding application:', error);
            return false;
        }
    },

    updateApplicationStatus(applicationId, newStatus) {
        try {
            const applications = this.getApplications();
            const index = applications.findIndex(app => app.id === applicationId);
            
            if (index !== -1) {
                applications[index].status = newStatus;
                localStorage.setItem('jobApplications', JSON.stringify(applications));
                this.refreshApplicationsList();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating application status:', error);
            return false;
        }
    },

    getStatusColor(status) {
        const colors = {
            'New': '#3498db',
            'Review': '#f1c40f',
            'Interview': '#9b59b6',
            'Accepted': '#2ecc71',
            'Rejected': '#e74c3c'
        };
        return colors[status] || '#95a5a6';
    },

    refreshApplicationsList() {
        console.log('Refreshing applications list');
        const applications = this.getApplications();
        console.log('Found applications:', applications);
        
        const container = document.querySelector('.applications-grid');
        if (!container) {
            console.error('Applications grid container not found');
            return;
        }

        const statusFilter = document.getElementById('applicationStatus')?.value || 'all';
        const searchQuery = document.getElementById('applicationSearch')?.value?.toLowerCase() || '';

        // Filter applications
        const filteredApplications = applications.filter(app => {
            const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
            const matchesSearch = 
                app.fullName.toLowerCase().includes(searchQuery) ||
                app.jobTitle.toLowerCase().includes(searchQuery) ||
                app.email.toLowerCase().includes(searchQuery);
            return matchesStatus && matchesSearch;
        });

        console.log('Filtered applications:', filteredApplications);

        // Sort applications by date (newest first)
        filteredApplications.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        // Render applications
        container.innerHTML = filteredApplications.map(app => this.createApplicationCard(app)).join('');
        console.log('Applications rendered');
    },

    createApplicationCard(application) {
        const submittedDate = new Date(application.submittedAt).toLocaleDateString();
        
        return `
            <div class="application-card" data-id="${application.id}">
                <h3>${application.jobTitle}</h3>
                <div class="application-meta">
                    ${application.companyName} • Submitted ${submittedDate}
                </div>
                <div class="application-details">
                    <p><i class="fas fa-user"></i> ${application.fullName}</p>
                    <p><i class="fas fa-envelope"></i> ${application.email}</p>
                    <p><i class="fas fa-phone"></i> ${application.phone}</p>
                </div>
                <div class="status-badge status-${application.status.replace(/\s+/g, '-')}">
                    ${application.status}
                </div>
                <div class="application-actions">
                    <button class="btn-view-resume" onclick="ApplicationsAPI.viewResume('${application.id}')">
                        <i class="fas fa-file-pdf"></i> View Resume
                    </button>
                    <button class="btn-update-status" onclick="ApplicationsAPI.showStatusUpdateModal('${application.id}')">
                        <i class="fas fa-edit"></i> Update Status
                    </button>
                </div>
            </div>
        `;
    },

    addCardEventListeners() {
        // Add status filter listener
        document.getElementById('applicationStatus').addEventListener('change', () => {
            this.refreshApplicationsList();
        });

        // Add search input listener
        document.getElementById('applicationSearch').addEventListener('input', () => {
            this.refreshApplicationsList();
        });
    },

    viewResume(applicationId) {
        const applications = this.getApplications();
        const application = applications.find(app => app.id === applicationId);
        
        if (application && application.resume) {
            // Open resume in new tab
            const newTab = window.open();
            newTab.document.write(`
                <iframe src="${application.resume}" style="width:100%;height:100vh;border:none;"></iframe>
            `);
        }
    },

    showStatusUpdateModal(applicationId) {
        const statuses = ['New', 'Under Review', 'Interview', 'Accepted', 'Rejected'];
        const currentStatus = this.getApplications().find(app => app.id === applicationId)?.status;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <h3>Update Application Status</h3>
                <select id="newStatus" class="filter-select" style="width: 100%; margin: 1rem 0;">
                    ${statuses.map(status => `
                        <option value="${status}" ${status === currentStatus ? 'selected' : ''}>
                            ${status}
                        </option>
                    `).join('')}
                </select>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn-cancel">Cancel</button>
                    <button class="btn-update">Update</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeModal = () => {
            modal.remove();
        };
        
        modal.querySelector('.btn-cancel').onclick = closeModal;
        modal.querySelector('.btn-update').onclick = () => {
            const newStatus = modal.querySelector('#newStatus').value;
            this.updateApplicationStatus(applicationId, newStatus);
            closeModal();
        };
        
        // Close on outside click
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }
};
