// Job Management System for Admin Dashboard
const JobManagementAPI = {
    init() {
        console.log('Initializing Job Management System');
        this.setupEventListeners();
        this.loadJobs();
        this.setupDemoData();
        this.setupBulkActions();
        this.renderJobStats();
    },    setupEventListeners() {
        // Add job button
        document.getElementById('addJobBtn')?.addEventListener('click', () => {
            this.openJobModal();
        });

        // Search functionality
        const searchInput = document.getElementById('jobsSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterJobs(e.target.value);
            });
        }

        // Type filter
        const typeFilter = document.getElementById('jobsTypeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filterJobsByType(e.target.value);
            });
        }

        // Listen for job updates from other sources
        document.addEventListener('jobAdded', () => {
            this.loadJobs();
            this.updateJobStats();
        });

        document.addEventListener('jobUpdated', () => {
            this.loadJobs();
            this.updateJobStats();
        });

        document.addEventListener('jobDeleted', () => {
            this.loadJobs();
            this.updateJobStats();
        });
    },

    setupDemoData() {
        const existingJobs = this.getJobs();
        if (existingJobs.length === 0) {
            const demoJobs = [
                {
                    id: 'JOB001',
                    title: 'Senior Software Engineer',
                    company: 'NexTech Solutions',
                    location: 'San Francisco, CA',
                    type: 'Full-time',
                    salary: '$120,000 - $150,000',
                    status: 'ACTIVE',
                    description: 'Join our team to build next-generation staffing solutions.',
                    requirements: ['5+ years experience', 'React', 'Node.js', 'MongoDB'],
                    benefits: ['Health Insurance', 'Flexible Hours', 'Remote Work'],
                    postedDate: new Date().toISOString(),
                    category: 'Technology'
                },
                {
                    id: 'JOB002',
                    title: 'UI/UX Designer',
                    company: 'Creative Studios',
                    location: 'New York, NY',
                    type: 'Full-time',
                    salary: '$80,000 - $100,000',
                    status: 'ACTIVE',
                    description: 'Create beautiful and intuitive user interfaces for our platforms.',
                    requirements: ['3+ years experience', 'Figma', 'Adobe Creative Suite', 'User Research'],
                    benefits: ['Health Insurance', 'Creative Environment', 'Professional Development'],
                    postedDate: new Date().toISOString(),
                    category: 'Design'
                },
                {
                    id: 'JOB003',
                    title: 'Marketing Manager',
                    company: 'Global Brands Inc',
                    location: 'Austin, TX',
                    type: 'Full-time',
                    salary: '$90,000 - $110,000',
                    status: 'ON HOLD',
                    description: 'Lead our marketing initiatives and drive growth.',
                    requirements: ['5+ years experience', 'Digital Marketing', 'SEO', 'Analytics'],
                    benefits: ['Health Insurance', 'Bonus Structure', 'Team Events'],
                    postedDate: new Date().toISOString(),
                    category: 'Marketing'
                },
                {
                    id: 'JOB004',
                    title: 'Data Analyst',
                    company: 'Analytics Pro',
                    location: 'Chicago, IL',
                    type: 'Full-time',
                    salary: '$75,000 - $95,000',
                    status: 'ACTIVE',
                    description: 'Analyze data to drive business insights and decisions.',
                    requirements: ['3+ years experience', 'SQL', 'Python', 'Tableau'],
                    benefits: ['Health Insurance', 'Learning Budget', 'Flexible Schedule'],
                    postedDate: new Date().toISOString(),
                    category: 'Analytics'
                }
            ];

            // Save demo jobs
            localStorage.setItem('nexstaff_jobs', JSON.stringify(demoJobs));
            console.log('Demo jobs data added');
        }
    },

    getJobs() {
        try {
            // Try to get from enhanced data manager first
            if (typeof nexStaffData !== 'undefined') {
                return nexStaffData.getAllJobs();
            }
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('nexstaff_jobs')) || [];
        } catch (error) {
            console.error('Error getting jobs:', error);
            return [];
        }
    },

    saveJob(jobData) {
        try {
            if (typeof nexStaffData !== 'undefined') {
                if (jobData.id && this.getJobById(jobData.id)) {
                    return nexStaffData.updateJob(jobData.id, jobData);
                } else {
                    return nexStaffData.addJob(jobData);
                }
            } else {
                // Fallback to localStorage
                const jobs = this.getJobs();
                const existingIndex = jobs.findIndex(job => job.id === jobData.id);
                
                if (existingIndex >= 0) {
                    jobs[existingIndex] = jobData;
                } else {
                    jobData.id = jobData.id || `JOB${Date.now()}`;
                    jobs.push(jobData);
                }
                
                localStorage.setItem('nexstaff_jobs', JSON.stringify(jobs));
                
                // Dispatch event for real-time updates
                document.dispatchEvent(new CustomEvent(existingIndex >= 0 ? 'jobUpdated' : 'jobAdded', {
                    detail: jobData
                }));
                return true;
            }
        } catch (error) {
            console.error('Error saving job:', error);
            return false;
        }
    },

    getJobById(jobId) {
        return this.getJobs().find(job => job.id === jobId);
    },    updateJobStatus(jobId, newStatus) {
        const job = this.getJobById(jobId);
        if (job) {
            const oldStatus = job.status;
            job.status = newStatus;
            job.updatedDate = new Date().toISOString();
            
            this.saveJob(job);
            this.loadJobs();
            
            // Add visual feedback
            this.animateStatusChange(jobId, newStatus);
            
            // Dispatch event to update public job listings
            document.dispatchEvent(new CustomEvent('jobStatusChanged', {
                detail: { jobId, status: newStatus, oldStatus, job }
            }));
            
            // Also dispatch to window for cross-page communication
            window.dispatchEvent(new CustomEvent('jobStatusChanged', {
                detail: { jobId, status: newStatus, oldStatus, job }
            }));
            
            // Log status change for analytics
            console.log(`Job ${jobId} status changed from ${oldStatus} to ${newStatus}`);
            
            // Show notification about public page impact
            if (newStatus === 'ACTIVE' && oldStatus !== 'ACTIVE') {
                this.showNotification('Job is now visible on the public jobs page', 'success');
            } else if (oldStatus === 'ACTIVE' && newStatus !== 'ACTIVE') {
                this.showNotification('Job is no longer visible on the public jobs page', 'info');
            }
        }
    },

    deleteJob(jobId) {
        try {
            if (typeof nexStaffData !== 'undefined') {
                nexStaffData.deleteJob(jobId);
            } else {
                const jobs = this.getJobs();
                const filteredJobs = jobs.filter(job => job.id !== jobId);
                localStorage.setItem('nexstaff_jobs', JSON.stringify(filteredJobs));
                
                document.dispatchEvent(new CustomEvent('jobDeleted', {
                    detail: { jobId }
                }));
            }
            this.loadJobs();
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    },

    loadJobs() {
        const jobs = this.getJobs();
        const tbody = document.getElementById('jobsTableBody');
        
        if (!tbody) {
            console.error('Jobs table body not found');
            return;
        }

        if (jobs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No jobs found</td></tr>';
            return;
        }

        tbody.innerHTML = jobs.map(job => `
            <tr>
                <td><strong>${job.id}</strong></td>
                <td>
                    <div style="font-weight: 600;">${job.title}</div>
                    <div style="font-size: 0.85rem; color: #6b7280;">${job.category || 'General'}</div>
                </td>
                <td>${job.company}</td>
                <td>${job.location}</td>
                <td>
                    <span class="badge badge-info">${job.type}</span>
                </td>
                <td style="font-weight: 600;">${job.salary}</td>                <td>
                    <div class="d-flex align-items-center">
                        <select class="form-control form-control-sm status-select mr-2" data-job-id="${job.id}" style="width: auto; min-width: 100px;">
                            <option value="ACTIVE" ${job.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
                            <option value="ON HOLD" ${job.status === 'ON HOLD' ? 'selected' : ''}>ON HOLD</option>
                            <option value="CLOSED" ${job.status === 'CLOSED' ? 'selected' : ''}>CLOSED</option>
                            <option value="DRAFT" ${job.status === 'DRAFT' ? 'selected' : ''}>DRAFT</option>
                        </select>
                        <button class="btn btn-sm ${job.status === 'ACTIVE' ? 'btn-success' : 'btn-outline-success'}" 
                                onclick="JobManagementAPI.quickToggleActive('${job.id}')" 
                                title="${job.status === 'ACTIVE' ? 'Set Inactive' : 'Set Active'}"
                                data-job-id="${job.id}">
                            <i class="fas ${job.status === 'ACTIVE' ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                        </button>
                    </div>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="JobManagementAPI.viewJob('${job.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="JobManagementAPI.editJob('${job.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="JobManagementAPI.confirmDeleteJob('${job.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners for status changes
        tbody.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const jobId = e.target.dataset.jobId;
                const newStatus = e.target.value;
                this.updateJobStatus(jobId, newStatus);
            });        });
        
        // Add checkboxes for bulk operations
        this.addCheckboxesToTable();
        
        // Update job stats
        this.updateJobStats();
    },

    filterJobs(searchTerm) {
        const jobs = this.getJobs();
        const filteredJobs = jobs.filter(job => 
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.displayFilteredJobs(filteredJobs);
    },

    filterJobsByType(type) {
        if (type === 'All Types') {
            this.loadJobs();
            return;
        }
        
        const jobs = this.getJobs();
        const filteredJobs = jobs.filter(job => job.type === type);
        this.displayFilteredJobs(filteredJobs);
    },

    displayFilteredJobs(jobs) {
        const tbody = document.getElementById('jobsTableBody');
        if (jobs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No jobs found matching your criteria</td></tr>';
            return;
        }
        
        // Temporarily override the jobs list for display
        const originalGetJobs = this.getJobs;
        this.getJobs = () => jobs;
        this.loadJobs();
        this.getJobs = originalGetJobs;
    },    openJobModal(jobId = null) {
        const isEdit = !!jobId;
        const job = isEdit ? this.getJobById(jobId) : null;
        
        // Use the existing modal from dashboard
        const modal = document.getElementById('jobsModal');
        const modalTitle = document.getElementById('jobsModalTitle');
        const form = document.getElementById('jobsForm');
        
        if (!modal || !form) {
            console.error('Job modal or form not found');
            return;
        }
        
        // Reset form
        form.reset();
        
        // Populate form if editing
        if (isEdit && job) {
            document.getElementById('jobTitle').value = job.title || '';
            document.getElementById('company').value = job.company || '';
            document.getElementById('location').value = job.location || '';
            document.getElementById('jobType').value = job.type || '';
            document.getElementById('salaryRange').value = job.salary || '';
            document.getElementById('jobDescription').value = job.description || '';
            document.getElementById('jobRequirements').value = Array.isArray(job.requirements) ? job.requirements.join('\n') : (job.requirements || '');
            document.getElementById('applicationDeadline').value = job.deadline || '';
            document.getElementById('jobStatus').value = job.status || 'ACTIVE';
            
            modalTitle.textContent = 'Edit Job';
        } else {
            modalTitle.textContent = 'Add New Job';
        }
        
        // Store job ID for saving
        modal.dataset.jobId = jobId || '';
        
        // Show modal
        modal.style.display = 'flex';
        modal.classList.add('show');
    },    closeJobModal() {
        const modal = document.getElementById('jobsModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    },

    saveJobFromModal(event) {
        event.preventDefault();
        
        const form = document.getElementById('jobsForm');
        const modal = document.getElementById('jobsModal');
        const jobId = modal.dataset.jobId;
        
        if (!form) {
            console.error('Job form not found');
            return;
        }
        
        // Get form data
        const formData = new FormData(form);
        const jobData = Object.fromEntries(formData.entries());
        
        // Process requirements (split by newlines if it's a string)
        if (jobData.requirements) {
            jobData.requirements = jobData.requirements.split('\n').filter(req => req.trim());
        }
        
        // Add metadata
        if (jobId) {
            // Editing existing job
            jobData.id = jobId;
            jobData.updatedDate = new Date().toISOString();
        } else {
            // Creating new job
            jobData.id = `JOB${Date.now()}`;
            jobData.postedDate = new Date().toISOString();
            jobData.category = 'General';
            jobData.benefits = ['Health Insurance', 'Flexible Hours'];
        }
          // Save job
        const success = this.saveJob(jobData);
        
        if (success) {
            this.closeJobModal();
            this.loadJobs();
            
            // Show success message with public visibility info
            const isActive = jobData.status === 'ACTIVE';
            const baseMessage = `Job ${jobId ? 'updated' : 'created'} successfully!`;
            const visibilityMessage = isActive ? 
                ' Job is now visible on the public jobs page.' : 
                ' Job is saved as draft and not visible to job seekers yet.';
            
            this.showNotification(baseMessage + visibilityMessage, 'success');
        } else {
            this.showNotification('Error saving job. Please try again.', 'error');
        }
    },

    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.background = '#10B981';
        } else if (type === 'error') {
            notification.style.background = '#EF4444';
        } else {
            notification.style.background = '#3B82F6';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    createJobModal() {
        // Check if modal already exists
        if (document.getElementById('jobModal')) return;
        
        const modalHTML = `
        <div class="modal fade" id="jobModal" tabindex="-1" role="dialog" aria-labelledby="jobModalTitle" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="jobModalTitle">Add New Job</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form id="jobForm">
                        <div class="modal-body">
                            <input type="hidden" id="jobId">
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobTitle">Job Title *</label>
                                        <input type="text" class="form-control" id="jobTitle" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobCompany">Company *</label>
                                        <input type="text" class="form-control" id="jobCompany" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobLocation">Location *</label>
                                        <input type="text" class="form-control" id="jobLocation" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobType">Job Type</label>
                                        <select class="form-control" id="jobType">
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Remote">Remote</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobSalary">Salary Range</label>
                                        <input type="text" class="form-control" id="jobSalary" placeholder="e.g., $60,000 - $80,000">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobCategory">Category</label>
                                        <select class="form-control" id="jobCategory">
                                            <option value="Technology">Technology</option>
                                            <option value="Design">Design</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Education">Education</option>
                                            <option value="Analytics">Analytics</option>
                                            <option value="Operations">Operations</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="jobDescription">Job Description</label>
                                <textarea class="form-control" id="jobDescription" rows="4" placeholder="Describe the role, responsibilities, and what you're looking for..."></textarea>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobRequirements">Requirements (one per line)</label>
                                        <textarea class="form-control" id="jobRequirements" rows="4" placeholder="e.g., Bachelor's degree&#10;3+ years experience&#10;JavaScript proficiency"></textarea>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobBenefits">Benefits (one per line)</label>
                                        <textarea class="form-control" id="jobBenefits" rows="4" placeholder="e.g., Health Insurance&#10;401k Match&#10;Flexible Hours"></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="jobStatus">Status</label>
                                <select class="form-control" id="jobStatus">
                                    <option value="ACTIVE">Active</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="ON HOLD">On Hold</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="saveJobBtn">Create Job</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>`;
        
        // Append modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add form submit handler
        document.getElementById('jobForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveJobFromForm();
        });
    },

    saveJobFromForm() {
        const formData = new FormData(document.getElementById('jobForm'));
        const jobId = document.getElementById('jobId').value;
        const isEdit = !!jobId;
        
        // Validate required fields
        const title = document.getElementById('jobTitle').value.trim();
        const company = document.getElementById('jobCompany').value.trim();
        const location = document.getElementById('jobLocation').value.trim();
        
        if (!title || !company || !location) {
            alert('Please fill in all required fields (Title, Company, Location)');
            return;
        }
        
        const jobData = {
            id: jobId || `JOB${Date.now()}`,
            title: title,
            company: company,
            location: location,
            type: document.getElementById('jobType').value,
            salary: document.getElementById('jobSalary').value.trim(),
            category: document.getElementById('jobCategory').value,
            description: document.getElementById('jobDescription').value.trim(),
            requirements: document.getElementById('jobRequirements').value
                .split('\n')
                .map(req => req.trim())
                .filter(req => req.length > 0),
            benefits: document.getElementById('jobBenefits').value
                .split('\n')
                .map(ben => ben.trim())
                .filter(ben => ben.length > 0),
            status: document.getElementById('jobStatus').value,
            postedDate: isEdit ? this.getJobById(jobId)?.postedDate : new Date().toISOString(),
            updatedDate: new Date().toISOString()
        };
        
        if (this.saveJob(jobData)) {
            $('#jobModal').modal('hide');
            this.loadJobs();
            this.updateJobStats();
            this.showNotification(isEdit ? 'Job updated successfully!' : 'Job created successfully!', 'success');
        } else {
            this.showNotification('Error saving job. Please try again.', 'error');
        }
    },    renderJobStats() {
        const jobs = this.getJobs();
        const stats = this.getJobStats();
        
        // Check if stats cards already exist
        if (document.getElementById('jobStatsCards')) {
            this.updateJobStats();
            return;
        }
        
        const statsHTML = `
        <div id="jobStatsCards" class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h4 class="card-title" id="totalJobs">${stats.total}</h4>
                                <p class="card-text">Total Jobs</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-briefcase fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h4 class="card-title" id="activeJobs">${stats.active}</h4>
                                <p class="card-text">Active Jobs</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-check-circle fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h4 class="card-title" id="onHoldJobs">${stats.onHold}</h4>
                                <p class="card-text">On Hold</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-pause-circle fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h4 class="card-title" id="draftJobs">${stats.draft}</h4>
                                <p class="card-text">Drafts</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-edit fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        
        const jobsSection = document.getElementById('jobs-section');
        const titleDiv = jobsSection.querySelector('div[style*="display: flex"]');
        if (titleDiv && jobsSection) {
            titleDiv.insertAdjacentHTML('afterend', statsHTML);
        }
    },

    updateJobStats() {
        const stats = this.getJobStats();
        
        const elements = {
            'totalJobs': stats.total,
            'activeJobs': stats.active,
            'onHoldJobs': stats.onHold,
            'draftJobs': stats.draft
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    },

    getJobStats() {
        const jobs = this.getJobs();
        return {
            total: jobs.length,
            active: jobs.filter(job => job.status === 'ACTIVE').length,
            onHold: jobs.filter(job => job.status === 'ON HOLD').length,
            draft: jobs.filter(job => job.status === 'DRAFT').length,
            closed: jobs.filter(job => job.status === 'CLOSED').length
        };
    },

    openJobModal(jobId = null) {
        const isEdit = !!jobId;
        const job = isEdit ? this.getJobById(jobId) : null;
        
        // Use the existing modal from dashboard
        const modal = document.getElementById('jobsModal');
        const modalTitle = document.getElementById('jobsModalTitle');
        const form = document.getElementById('jobsForm');
        
        if (!modal || !form) {
            console.error('Job modal or form not found');
            return;
        }
        
        // Reset form
        form.reset();
        
        // Populate form if editing
        if (isEdit && job) {
            document.getElementById('jobTitle').value = job.title || '';
            document.getElementById('company').value = job.company || '';
            document.getElementById('location').value = job.location || '';
            document.getElementById('jobType').value = job.type || '';
            document.getElementById('salaryRange').value = job.salary || '';
            document.getElementById('jobDescription').value = job.description || '';
            document.getElementById('jobRequirements').value = Array.isArray(job.requirements) ? job.requirements.join('\n') : (job.requirements || '');
            document.getElementById('applicationDeadline').value = job.deadline || '';
            document.getElementById('jobStatus').value = job.status || 'ACTIVE';
            
            modalTitle.textContent = 'Edit Job';
        } else {
            modalTitle.textContent = 'Add New Job';
        }
        
        // Store job ID for saving
        modal.dataset.jobId = jobId || '';
        
        // Show modal
        modal.style.display = 'flex';
        modal.classList.add('show');
    },    closeJobModal() {
        const modal = document.getElementById('jobsModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    },

    saveJobFromModal(event) {
        event.preventDefault();
        
        const form = document.getElementById('jobsForm');
        const modal = document.getElementById('jobsModal');
        const jobId = modal.dataset.jobId;
        
        if (!form) {
            console.error('Job form not found');
            return;
        }
        
        // Get form data
        const formData = new FormData(form);
        const jobData = Object.fromEntries(formData.entries());
        
        // Process requirements (split by newlines if it's a string)
        if (jobData.requirements) {
            jobData.requirements = jobData.requirements.split('\n').filter(req => req.trim());
        }
        
        // Add metadata
        if (jobId) {
            // Editing existing job
            jobData.id = jobId;
            jobData.updatedDate = new Date().toISOString();
        } else {
            // Creating new job
            jobData.id = `JOB${Date.now()}`;
            jobData.postedDate = new Date().toISOString();
            jobData.category = 'General';
            jobData.benefits = ['Health Insurance', 'Flexible Hours'];
        }
        
        // Save job
        const success = this.saveJob(jobData);
        
        if (success) {
            this.closeJobModal();
            this.loadJobs();
            this.updateJobStats();
            
            // Show success message
            this.showNotification(`Job ${jobId ? 'updated' : 'created'} successfully!`, 'success');
        } else {
            this.showNotification('Error saving job. Please try again.', 'error');
        }
    },

    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.background = '#10B981';
        } else if (type === 'error') {
            notification.style.background = '#EF4444';
        } else {
            notification.style.background = '#3B82F6';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    createJobModal() {
        // Check if modal already exists
        if (document.getElementById('jobModal')) return;
        
        const modalHTML = `
        <div class="modal fade" id="jobModal" tabindex="-1" role="dialog" aria-labelledby="jobModalTitle" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="jobModalTitle">Add New Job</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form id="jobForm">
                        <div class="modal-body">
                            <input type="hidden" id="jobId">
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobTitle">Job Title *</label>
                                        <input type="text" class="form-control" id="jobTitle" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobCompany">Company *</label>
                                        <input type="text" class="form-control" id="jobCompany" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobLocation">Location *</label>
                                        <input type="text" class="form-control" id="jobLocation" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobType">Job Type</label>
                                        <select class="form-control" id="jobType">
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Remote">Remote</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobSalary">Salary Range</label>
                                        <input type="text" class="form-control" id="jobSalary" placeholder="e.g., $60,000 - $80,000">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobCategory">Category</label>
                                        <select class="form-control" id="jobCategory">
                                            <option value="Technology">Technology</option>
                                            <option value="Design">Design</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Education">Education</option>
                                            <option value="Analytics">Analytics</option>
                                            <option value="Operations">Operations</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="jobDescription">Job Description</label>
                                <textarea class="form-control" id="jobDescription" rows="4" placeholder="Describe the role, responsibilities, and what you're looking for..."></textarea>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobRequirements">Requirements (one per line)</label>
                                        <textarea class="form-control" id="jobRequirements" rows="4" placeholder="e.g., Bachelor's degree&#10;3+ years experience&#10;JavaScript proficiency"></textarea>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="jobBenefits">Benefits (one per line)</label>
                                        <textarea class="form-control" id="jobBenefits" rows="4" placeholder="e.g., Health Insurance&#10;401k Match&#10;Flexible Hours"></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="jobStatus">Status</label>
                                <select class="form-control" id="jobStatus">
                                    <option value="ACTIVE">Active</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="ON HOLD">On Hold</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="saveJobBtn">Create Job</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>`;
        
        // Append modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add form submit handler
        document.getElementById('jobForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveJobFromForm();
        });
    },

    saveJobFromForm() {
        const formData = new FormData(document.getElementById('jobForm'));
        const jobId = document.getElementById('jobId').value;
        const isEdit = !!jobId;
        
        // Validate required fields
        const title = document.getElementById('jobTitle').value.trim();
        const company = document.getElementById('jobCompany').value.trim();
        const location = document.getElementById('jobLocation').value.trim();
        
        if (!title || !company || !location) {
            alert('Please fill in all required fields (Title, Company, Location)');
            return;
        }
        
        const jobData = {
            id: jobId || `JOB${Date.now()}`,
            title: title,
            company: company,
            location: location,
            type: document.getElementById('jobType').value,
            salary: document.getElementById('jobSalary').value.trim(),
            category: document.getElementById('jobCategory').value,
            description: document.getElementById('jobDescription').value.trim(),
            requirements: document.getElementById('jobRequirements').value
                .split('\n')
                .map(req => req.trim())
                .filter(req => req.length > 0),
            benefits: document.getElementById('jobBenefits').value
                .split('\n')
                .map(ben => ben.trim())
                .filter(ben => ben.length > 0),
            status: document.getElementById('jobStatus').value,
            postedDate: isEdit ? this.getJobById(jobId)?.postedDate : new Date().toISOString(),
            updatedDate: new Date().toISOString()
        };
        
        if (this.saveJob(jobData)) {
            $('#jobModal').modal('hide');
            this.loadJobs();
            this.updateJobStats();
            this.showNotification(isEdit ? 'Job updated successfully!' : 'Job created successfully!', 'success');
        } else {
            this.showNotification('Error saving job. Please try again.', 'error');
        }
    },    viewJob(jobId) {
        const job = this.getJobById(jobId);
        if (!job) {
            this.showNotification('Job not found', 'error');
            return;
        }
        
        // Open modal in view mode
        this.openJobModal(jobId);
        
        // Make form read-only
        const form = document.getElementById('jobsForm');
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = true;
        });
        
        // Update modal title and hide save button
        document.getElementById('jobsModalTitle').textContent = 'View Job Details';
        const footer = document.querySelector('#jobsModal .modal-footer');
        footer.innerHTML = `
            <button type="button" class="btn btn-primary" onclick="JobManagementAPI.closeJobModal()">Close</button>
        `;
    },

    editJob(jobId) {
        this.openJobModal(jobId);
    },

    confirmDeleteJob(jobId) {
        const job = this.getJobById(jobId);
        if (!job) {
            this.showNotification('Job not found', 'error');
            return;
        }
        
        if (confirm(`Are you sure you want to delete the job "${job.title}" at ${job.company}?\n\nThis action cannot be undone.`)) {
            this.deleteJob(jobId);
            this.showNotification('Job deleted successfully', 'success');
        }
    },    quickToggleActive(jobId) {
        const job = this.getJobById(jobId);
        if (!job) return;
          const newStatus = job.status === 'ACTIVE' ? 'ON HOLD' : 'ACTIVE';
        this.updateJobStatus(jobId, newStatus);
        
        this.showNotification(`Job ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`, 'success');
    },

    addCheckboxesToTable() {
        // Add checkboxes to each row for bulk operations
        const tbody = document.getElementById('jobsTableBody');
        if (!tbody) return;
        
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const firstCell = row.cells[0];
            if (firstCell && !firstCell.querySelector('input[type="checkbox"]')) {
                const jobId = firstCell.textContent.trim();
                if (jobId && jobId !== 'Job ID') {
                    firstCell.innerHTML = `<input type="checkbox" class="job-checkbox" value="${jobId}"> ${firstCell.innerHTML}`;
                }
            }
        });
    },

    setupBulkActions() {
        // This method can be expanded later for bulk operations
        console.log('Bulk actions setup complete');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    JobManagementAPI.init();
});

// Make API globally available
window.JobManagementAPI = JobManagementAPI;
