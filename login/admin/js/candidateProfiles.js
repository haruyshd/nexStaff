// Candidate Profiles Management
console.log('📄 candidateProfiles.js loading...');

const CandidateProfilesAPI = {
    init() {
        console.log('🚀 CandidateProfilesAPI initializing...');
        console.log('🔍 API object:', this);
        console.log('🔍 Available methods:', Object.keys(this));
        this.loadCandidateProfiles();
    },

    loadCandidateProfiles() {
        console.log('📊 Loading candidate profiles...');
        // Get all candidates from storage
        const allCandidates = this.getAllCandidates();
        console.log(`Found ${allCandidates.length} candidates:`, allCandidates);
        this.renderCandidateProfiles(allCandidates);
    },    getAllCandidates() {
        // Get from localStorage or use sample data
        const stored = localStorage.getItem('nexstaff_candidates');
        if (stored) {
            const candidates = JSON.parse(stored);
            console.log('📦 Loaded candidates from localStorage:', candidates);
            return candidates;
        }
        
        console.log('🔧 No stored candidates, creating sample data...');
        // Sample data with approval status
        const candidates = [
            {
                id: 1,
                name: "John Doe",
                email: "john.doe@email.com",
                phone: "(555) 123-4567",
                skills: ["JavaScript", "React", "Node.js"],
                experience: "5 years",
                preferredRole: "Senior Software Engineer",
                status: "Available",
                approvalStatus: "approved",
                submissionDate: "2025-06-10T10:00:00Z",
                appliedJobs: ["Software Engineer", "Full Stack Developer"]
            },
            {
                id: 2,
                name: "Jane Smith",
                email: "jane.smith@email.com",
                phone: "(555) 234-5678",
                skills: ["UI/UX Design", "Figma", "Adobe XD"],
                experience: "3 years",
                preferredRole: "UI/UX Designer",
                status: "Available",
                approvalStatus: "pending",
                submissionDate: "2025-06-12T14:30:00Z",
                appliedJobs: ["UI/UX Designer", "Product Designer"]
            },
            {
                id: 3,
                name: "Mike Johnson",
                email: "mike.johnson@email.com",
                phone: "(555) 345-6789",
                skills: ["Python", "Django", "PostgreSQL"],
                experience: "4 years",
                preferredRole: "Backend Developer",
                status: "Available",
                approvalStatus: "pending",
                submissionDate: "2025-06-13T09:15:00Z",
                appliedJobs: ["Backend Developer", "Python Developer"]
            },
            {
                id: 4,
                name: "Sarah Wilson",
                email: "sarah.wilson@email.com",
                phone: "(555) 456-7890",
                skills: ["Digital Marketing", "SEO", "Content Strategy"],
                experience: "2 years",
                preferredRole: "Marketing Specialist",
                status: "Available",
                approvalStatus: "pending",
                submissionDate: "2025-06-14T11:20:00Z",
                appliedJobs: ["Marketing Specialist", "Content Manager"]
            }
        ];
        
        // Save to localStorage
        localStorage.setItem('nexstaff_candidates', JSON.stringify(candidates));
        console.log('💾 Sample candidates saved to localStorage');        return candidates;
    },

    renderCandidateProfiles(candidates) {
        console.log('🎨 Rendering candidate profiles...');
        const container = document.getElementById('candidateProfiles');
        if (!container) {
            console.error('❌ candidateProfiles container not found!');
            return;
        }
        console.log('✅ Container found, rendering candidates...');

        // Add filter tabs
        const filterTabs = `
            <div class="candidate-filters">
                <button class="filter-btn active" onclick="CandidateProfilesAPI.filterCandidates('all')">
                    All (${candidates.length})
                </button>
                <button class="filter-btn" onclick="CandidateProfilesAPI.filterCandidates('pending')">
                    Pending Approval (${candidates.filter(c => c.approvalStatus === 'pending').length})
                </button>
                <button class="filter-btn" onclick="CandidateProfilesAPI.filterCandidates('approved')">
                    Approved (${candidates.filter(c => c.approvalStatus === 'approved').length})
                </button>
                <button class="filter-btn" onclick="CandidateProfilesAPI.filterCandidates('rejected')">
                    Rejected (${candidates.filter(c => c.approvalStatus === 'rejected').length})
                </button>
            </div>
        `;

        const candidateCards = candidates.map(candidate => {
            const approvalClass = candidate.approvalStatus === 'approved' ? 'approved' : 
                                 candidate.approvalStatus === 'rejected' ? 'rejected' : 'pending';
            
            const approvalBadge = candidate.approvalStatus === 'approved' ? 
                '<span class="approval-badge approved"><i class="fas fa-check-circle"></i> Approved</span>' :
                candidate.approvalStatus === 'rejected' ? 
                '<span class="approval-badge rejected"><i class="fas fa-times-circle"></i> Rejected</span>' :
                '<span class="approval-badge pending"><i class="fas fa-clock"></i> Pending Review</span>';

            return `
                <div class="profile-card candidate ${approvalClass}" data-status="${candidate.approvalStatus}">
                    <div class="profile-header">
                        <div>
                            <h3>${candidate.name}</h3>
                            <span class="status ${candidate.status.toLowerCase()}">${candidate.status}</span>
                        </div>
                        ${approvalBadge}
                    </div>
                    <div class="profile-content">
                        <p><strong>Email:</strong> ${candidate.email}</p>
                        <p><strong>Phone:</strong> ${candidate.phone || 'Not provided'}</p>
                        <p><strong>Preferred Role:</strong> ${candidate.preferredRole}</p>
                        <p><strong>Experience:</strong> ${candidate.experience}</p>
                        <p><strong>Submitted:</strong> ${new Date(candidate.submissionDate).toLocaleDateString()}</p>
                        <div class="skills">
                            <strong>Skills:</strong>
                            <div class="skill-tags">
                                ${candidate.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
                            </div>
                        </div>
                        <div class="applied-jobs">
                            <strong>Applied Jobs:</strong>
                            <ul>
                                ${candidate.appliedJobs.map(job => `<li>${job}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="profile-actions">
                        ${this.generateActionButtons(candidate)}
                    </div>
                </div>
            `;
        }).join('');        container.innerHTML = filterTabs + '<div id="candidateCards">' + candidateCards + '</div>';
    },

    filterCandidates(status) {
        const allCandidates = this.getAllCandidates();
        let filteredCandidates = allCandidates;
        
        if (status !== 'all') {
            filteredCandidates = allCandidates.filter(candidate => candidate.approvalStatus === status);
        }
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Update candidate cards
        const candidateCards = filteredCandidates.map(candidate => {
            const approvalClass = candidate.approvalStatus === 'approved' ? 'approved' : 
                                 candidate.approvalStatus === 'rejected' ? 'rejected' : 'pending';
            
            const approvalBadge = candidate.approvalStatus === 'approved' ? 
                '<span class="approval-badge approved"><i class="fas fa-check-circle"></i> Approved</span>' :
                candidate.approvalStatus === 'rejected' ? 
                '<span class="approval-badge rejected"><i class="fas fa-times-circle"></i> Rejected</span>' :
                '<span class="approval-badge pending"><i class="fas fa-clock"></i> Pending Review</span>';

            return `
                <div class="profile-card candidate ${approvalClass}" data-status="${candidate.approvalStatus}">
                    <div class="profile-header">
                        <div>
                            <h3>${candidate.name}</h3>
                            <span class="status ${candidate.status.toLowerCase()}">${candidate.status}</span>
                        </div>
                        ${approvalBadge}
                    </div>
                    <div class="profile-content">
                        <p><strong>Email:</strong> ${candidate.email}</p>
                        <p><strong>Phone:</strong> ${candidate.phone || 'Not provided'}</p>
                        <p><strong>Preferred Role:</strong> ${candidate.preferredRole}</p>
                        <p><strong>Experience:</strong> ${candidate.experience}</p>
                        <p><strong>Submitted:</strong> ${new Date(candidate.submissionDate).toLocaleDateString()}</p>
                        <div class="skills">
                            <strong>Skills:</strong>
                            <div class="skill-tags">
                                ${candidate.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
                            </div>
                        </div>
                        <div class="applied-jobs">
                            <strong>Applied Jobs:</strong>
                            <ul>
                                ${candidate.appliedJobs.map(job => `<li>${job}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="profile-actions">
                        ${this.generateActionButtons(candidate)}
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('candidateCards').innerHTML = candidateCards;
    },    approveCandidate(id) {
        console.log('✅ Approving candidate with ID:', id);
        const candidates = this.getAllCandidates();
        const candidate = candidates.find(c => c.id == id); // Use == for string/number conversion
        
        if (candidate) {
            candidate.approvalStatus = 'approved';
            candidate.approvedDate = new Date().toISOString();
            localStorage.setItem('nexstaff_candidates', JSON.stringify(candidates));
            
            // Show notification
            this.showNotification(`${candidate.name} has been approved and will now appear on the landing page!`, 'success');
            
            // Refresh display
            this.loadCandidateProfiles();
            
            // Refresh landing page display if ApprovedCandidatesDisplay is available
            if (typeof ApprovedCandidatesDisplay !== 'undefined') {
                ApprovedCandidatesDisplay.refreshDisplay();
            }
        }
    },    rejectCandidate(id) {
        const candidates = this.getAllCandidates();
        const candidate = candidates.find(c => c.id == id); // Use == for string/number conversion
        
        if (candidate) {
            const action = candidate.approvalStatus === 'approved' ? 'revoked approval for' : 'rejected';
            candidate.approvalStatus = 'rejected';
            candidate.rejectedDate = new Date().toISOString();
            localStorage.setItem('nexstaff_candidates', JSON.stringify(candidates));
            
            // Show notification
            this.showNotification(`${candidate.name} has been ${action}`, 'warning');
            
            // Refresh display
            this.loadCandidateProfiles();
        }
    },

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
        `;
        
        // Add to notifications container or create one
        let container = document.getElementById('notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            notification.remove();
        }, 4000);
    },

    getCandidateCount() {
        const candidates = this.getAllCandidates();
        return candidates.length;
    },

    getApprovedCandidates() {
        const candidates = this.getAllCandidates();
        return candidates.filter(candidate => candidate.approvalStatus === 'approved');
    },

    getPendingCandidates() {
        const candidates = this.getAllCandidates();
        return candidates.filter(candidate => candidate.approvalStatus === 'pending');
    },    addCandidate(candidateData) {
        const candidates = this.getAllCandidates();
        // Generate a unique ID
        const maxId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) : 0;
        const newCandidate = {
            id: maxId + 1,
            ...candidateData,
            approvalStatus: candidateData.approvalStatus || 'pending',
            submissionDate: candidateData.submissionDate || new Date().toISOString(),
            status: candidateData.status || 'Available'
        };
        
        candidates.push(newCandidate);
        localStorage.setItem('nexstaff_candidates', JSON.stringify(candidates));
        
        return newCandidate;
    },    updateCandidate(id, updatedData) {
        const candidates = this.getAllCandidates();
        const index = candidates.findIndex(c => c.id == id); // Use == for string/number conversion
        
        if (index !== -1) {
            candidates[index] = { ...candidates[index], ...updatedData };
            localStorage.setItem('nexstaff_candidates', JSON.stringify(candidates));
            return candidates[index];
        }
        return null;
    },    deleteCandidate(id) {
        const candidates = this.getAllCandidates();
        const index = candidates.findIndex(c => c.id == id); // Use == for string/number conversion
        
        if (index !== -1) {
            const deletedCandidate = candidates.splice(index, 1)[0];
            localStorage.setItem('nexstaff_candidates', JSON.stringify(candidates));
            return deletedCandidate;
        }
        return null;
    },    getCandidateById(id) {
        const candidates = this.getAllCandidates();
        return candidates.find(c => c.id == id); // Use == instead of === to handle string/number conversion
    },

    viewProfile(id) {
        const candidates = this.getAllCandidates();
        const candidate = candidates.find(c => c.id === id);
        
        if (candidate) {            // Create detailed view modal
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.display = 'flex'; // Force display
            modal.innerHTML = `
                <div class="modal-content candidate-detail-modal">
                    <div class="modal-header">
                        <h3>Candidate Profile - ${candidate.name}</h3>
                        <button type="button" class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="candidate-detail-grid">
                            <div class="detail-section">
                                <h4>Personal Information</h4>
                                <p><strong>Name:</strong> ${candidate.name}</p>
                                <p><strong>Email:</strong> ${candidate.email}</p>
                                <p><strong>Phone:</strong> ${candidate.phone || 'Not provided'}</p>
                                <p><strong>Status:</strong> <span class="status ${candidate.approvalStatus}">${candidate.approvalStatus}</span></p>
                            </div>
                            <div class="detail-section">
                                <h4>Professional Information</h4>
                                <p><strong>Preferred Role:</strong> ${candidate.preferredRole}</p>
                                <p><strong>Experience:</strong> ${candidate.experience}</p>
                                <p><strong>Availability:</strong> ${candidate.status}</p>
                            </div>
                            <div class="detail-section">
                                <h4>Skills</h4>
                                <div class="skill-tags">
                                    ${candidate.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
                                </div>
                            </div>
                            <div class="detail-section">
                                <h4>Application History</h4>
                                <ul>
                                    ${candidate.appliedJobs.map(job => `<li>${job}</li>`).join('')}
                                </ul>
                            </div>                            <div class="detail-section">
                                <h4>Submission Details</h4>
                                <p><strong>Submitted:</strong> ${new Date(candidate.submissionDate).toLocaleString()}</p>
                                ${candidate.approvedDate ? `<p><strong>Approved:</strong> ${new Date(candidate.approvedDate).toLocaleString()}</p>` : ''}
                                ${candidate.rejectedDate ? `<p><strong>Rejected:</strong> ${new Date(candidate.rejectedDate).toLocaleString()}</p>` : ''}
                            </div>
                            ${candidate.interviews && candidate.interviews.length > 0 ? `
                            <div class="detail-section">
                                <h4>Interview History</h4>
                                ${candidate.interviews.map(interview => `
                                    <div class="interview-item" style="border-left: 3px solid #8B5CF6; padding-left: 1rem; margin-bottom: 1rem;">
                                        <p><strong>Date:</strong> ${new Date(interview.date).toLocaleString()}</p>
                                        <p><strong>Type:</strong> ${interview.type}</p>
                                        ${interview.notes ? `<p><strong>Notes:</strong> ${interview.notes}</p>` : ''}
                                        <small style="color: #666;">Scheduled by ${interview.scheduledBy} on ${new Date(interview.scheduledDate).toLocaleDateString()}</small>
                                    </div>
                                `).join('')}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });        }
    },

    scheduleInterview(id) {
        const candidate = this.getCandidateById(id);
        if (!candidate) {
            this.showNotification('Candidate not found!', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex'; // Force display
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Schedule Interview - ${candidate.name}</h3>
                    <button type="button" class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="scheduleForm">
                        <div class="form-group">
                            <label for="interviewDate">Interview Date</label>
                            <input type="datetime-local" id="interviewDate" name="date" required>
                        </div>
                        <div class="form-group">
                            <label for="interviewType">Interview Type</label>
                            <select id="interviewType" name="type" required>
                                <option value="">Select Type</option>
                                <option value="phone">Phone Interview</option>
                                <option value="video">Video Interview</option>
                                <option value="in-person">In-Person Interview</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="interviewNotes">Notes</label>
                            <textarea id="interviewNotes" name="notes" rows="3" placeholder="Additional notes..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="CandidateProfilesAPI.confirmSchedule(${id})">
                        <i class="fas fa-calendar-check"></i> Schedule
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    confirmSchedule(id) {
        const form = document.getElementById('scheduleForm');
        const formData = new FormData(form);
        
        const interviewData = {
            date: formData.get('date'),
            type: formData.get('type'),
            notes: formData.get('notes'),
            scheduledBy: 'Admin',
            scheduledDate: new Date().toISOString()
        };

        // Update candidate with interview info
        const candidates = this.getAllCandidates();
        const candidate = candidates.find(c => c.id === id);        if (candidate) {
            if (!candidate.interviews) candidate.interviews = [];
            candidate.interviews.push(interviewData);
            localStorage.setItem('nexstaff_candidates', JSON.stringify(candidates));
            
            this.showNotification(`Interview scheduled for ${candidate.name} on ${new Date(interviewData.date).toLocaleDateString()}`, 'success');
              // Close modal
            document.querySelector('.modal-overlay').remove();
        }    },

    // Helper function to create modal
    createModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex'; // Force display
        modal.innerHTML = content;
        document.body.appendChild(modal);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    },

    // CRUD Operations
    createCandidate() {
        console.log('🆕 Creating new candidate...');
        console.log('🔍 Function called from button click');
          const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex'; // Force display
        console.log('✅ Modal element created and styled');
        
        modal.innerHTML = `
            <div class="modal-content candidate-form-modal">
                <div class="modal-header">
                    <h3>Add New Candidate</h3>
                    <button type="button" class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="candidateForm">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="candidateName">Full Name *</label>
                                <input type="text" id="candidateName" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="candidateEmail">Email *</label>
                                <input type="email" id="candidateEmail" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="candidatePhone">Phone</label>
                                <input type="tel" id="candidatePhone" name="phone">
                            </div>
                            <div class="form-group">
                                <label for="candidateExperience">Experience *</label>
                                <select id="candidateExperience" name="experience" required>
                                    <option value="">Select Experience</option>
                                    <option value="0-1 years">0-1 years</option>
                                    <option value="1-3 years">1-3 years</option>
                                    <option value="3-5 years">3-5 years</option>
                                    <option value="5-10 years">5-10 years</option>
                                    <option value="10+ years">10+ years</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="candidateRole">Preferred Role *</label>
                                <input type="text" id="candidateRole" name="preferredRole" required>
                            </div>
                            <div class="form-group">
                                <label for="candidateStatus">Status *</label>
                                <select id="candidateStatus" name="status" required>
                                    <option value="Available">Available</option>
                                    <option value="Interviewing">Interviewing</option>
                                    <option value="Hired">Hired</option>
                                    <option value="Not Available">Not Available</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="candidateApproval">Approval Status</label>
                                <select id="candidateApproval" name="approvalStatus">
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div class="form-group full-width">
                                <label for="candidateSkills">Skills (comma separated) *</label>
                                <input type="text" id="candidateSkills" name="skills" placeholder="JavaScript, React, Node.js" required>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.parentElement.parentElement.remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-plus"></i> Add Candidate
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Form submission handler
        const form = document.getElementById('candidateForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const candidateData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                experience: formData.get('experience'),
                preferredRole: formData.get('preferredRole'),
                status: formData.get('status'),
                approvalStatus: formData.get('approvalStatus'),
                skills: formData.get('skills').split(',').map(s => s.trim()),
                appliedJobs: []
            };
            
            this.addCandidate(candidateData);
            this.showNotification(`Candidate ${candidateData.name} added successfully!`, 'success');
            this.loadCandidateProfiles();
            modal.remove();
        });
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }        });
    },

    editCandidate(id) {
        console.log('✏️ Editing candidate with ID:', id);
        const candidate = this.getCandidateById(id);
        if (!candidate) {
            this.showNotification('Candidate not found!', 'error');
            return;
        }        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex'; // Force display
        modal.innerHTML = `
            <div class="modal-content candidate-form-modal">
                <div class="modal-header">
                    <h3>Edit Candidate - ${candidate.name}</h3>
                    <button type="button" class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editCandidateForm">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="editCandidateName">Full Name *</label>
                                <input type="text" id="editCandidateName" name="name" value="${candidate.name}" required>
                            </div>
                            <div class="form-group">
                                <label for="editCandidateEmail">Email *</label>
                                <input type="email" id="editCandidateEmail" name="email" value="${candidate.email}" required>
                            </div>
                            <div class="form-group">
                                <label for="editCandidatePhone">Phone</label>
                                <input type="tel" id="editCandidatePhone" name="phone" value="${candidate.phone || ''}">
                            </div>
                            <div class="form-group">
                                <label for="editCandidateExperience">Experience *</label>
                                <select id="editCandidateExperience" name="experience" required>
                                    <option value="0-1 years" ${candidate.experience === '0-1 years' ? 'selected' : ''}>0-1 years</option>
                                    <option value="1-3 years" ${candidate.experience === '1-3 years' ? 'selected' : ''}>1-3 years</option>
                                    <option value="3-5 years" ${candidate.experience === '3-5 years' ? 'selected' : ''}>3-5 years</option>
                                    <option value="5-10 years" ${candidate.experience === '5-10 years' ? 'selected' : ''}>5-10 years</option>
                                    <option value="10+ years" ${candidate.experience === '10+ years' ? 'selected' : ''}>10+ years</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editCandidateRole">Preferred Role *</label>
                                <input type="text" id="editCandidateRole" name="preferredRole" value="${candidate.preferredRole}" required>
                            </div>
                            <div class="form-group">
                                <label for="editCandidateStatus">Status *</label>
                                <select id="editCandidateStatus" name="status" required>
                                    <option value="Available" ${candidate.status === 'Available' ? 'selected' : ''}>Available</option>
                                    <option value="Interviewing" ${candidate.status === 'Interviewing' ? 'selected' : ''}>Interviewing</option>
                                    <option value="Hired" ${candidate.status === 'Hired' ? 'selected' : ''}>Hired</option>
                                    <option value="Not Available" ${candidate.status === 'Not Available' ? 'selected' : ''}>Not Available</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editCandidateApproval">Approval Status</label>
                                <select id="editCandidateApproval" name="approvalStatus">
                                    <option value="pending" ${candidate.approvalStatus === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="approved" ${candidate.approvalStatus === 'approved' ? 'selected' : ''}>Approved</option>
                                    <option value="rejected" ${candidate.approvalStatus === 'rejected' ? 'selected' : ''}>Rejected</option>
                                </select>
                            </div>
                            <div class="form-group full-width">
                                <label for="editCandidateSkills">Skills (comma separated) *</label>
                                <input type="text" id="editCandidateSkills" name="skills" value="${candidate.skills.join(', ')}" required>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.parentElement.parentElement.remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Update Candidate
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Form submission handler
        const form = document.getElementById('editCandidateForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const updatedData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                experience: formData.get('experience'),
                preferredRole: formData.get('preferredRole'),
                status: formData.get('status'),
                approvalStatus: formData.get('approvalStatus'),
                skills: formData.get('skills').split(',').map(s => s.trim())
            };
            
            this.updateCandidate(id, updatedData);
            this.showNotification(`Candidate ${updatedData.name} updated successfully!`, 'success');
            this.loadCandidateProfiles();
            modal.remove();
        });
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }        });
    },

    confirmDeleteCandidate(id) {
        console.log('🗑️ Deleting candidate with ID:', id);
        const candidate = this.getCandidateById(id);
        if (!candidate) {
            this.showNotification('Candidate not found!', 'error');
            return;
        }

        if (confirm(`Are you sure you want to delete ${candidate.name}? This action cannot be undone.`)) {
            this.deleteCandidate(id);
            this.showNotification(`Candidate ${candidate.name} deleted successfully!`, 'warning');
            this.loadCandidateProfiles();
        }
    },

    generateActionButtons(candidate) {
        return `
            <button class="btn btn-primary" onclick="CandidateProfilesAPI.viewProfile('${candidate.id}')">>
                <i class="fas fa-eye"></i> View
            </button>
            <button class="btn btn-secondary" onclick="CandidateProfilesAPI.editCandidate('${candidate.id}')">>
                <i class="fas fa-edit"></i> Edit
            </button>            ${candidate.approvalStatus === 'pending' ? `
                <button class="btn btn-success" onclick="CandidateProfilesAPI.approveCandidate('${candidate.id}')">>
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-danger" onclick="CandidateProfilesAPI.rejectCandidate('${candidate.id}')">>
                    <i class="fas fa-times"></i> Reject
                </button>
            ` : candidate.approvalStatus === 'approved' ? `
                <button class="btn btn-warning" onclick="CandidateProfilesAPI.rejectCandidate('${candidate.id}')">>
                    <i class="fas fa-ban"></i> Revoke
                </button>
                <button class="btn btn-info" onclick="CandidateProfilesAPI.scheduleInterview('${candidate.id}')">>
                    <i class="fas fa-calendar"></i> Interview
                </button>            ` : `
                <button class="btn btn-success" onclick="CandidateProfilesAPI.approveCandidate('${candidate.id}')">>
                    <i class="fas fa-undo"></i> Approve
                </button>
            `}
            <button class="btn btn-danger" onclick="CandidateProfilesAPI.confirmDeleteCandidate('${candidate.id}')" style="margin-top: 0.5rem;">>
                <i class="fas fa-trash"></i> Delete
            </button>        `;
    },    // Test function to verify API is working
    test() {
        console.log('🧪 Testing CandidateProfilesAPI...');
        console.log('✅ API is accessible and working!');
        alert('CandidateProfilesAPI is working!');
        return true;
    },

    // Simple test for createCandidate
    testCreate() {
        console.log('🧪 Testing createCandidate...');
        alert('testCreate function called successfully!');
        try {
            this.createCandidate();
        } catch (error) {
            console.error('❌ Error in createCandidate:', error);
            alert('Error: ' + error.message);
        }
    },
};

// Make API globally accessible for debugging
window.CandidateProfilesAPI = CandidateProfilesAPI;
console.log('🌐 CandidateProfilesAPI attached to window object');
console.log('✅ candidateProfiles.js loaded successfully');

// Test all functions are accessible
console.log('🔍 Available functions:');
console.log('  - createCandidate:', typeof CandidateProfilesAPI.createCandidate);
console.log('  - editCandidate:', typeof CandidateProfilesAPI.editCandidate);
console.log('  - confirmDeleteCandidate:', typeof CandidateProfilesAPI.confirmDeleteCandidate);
console.log('  - loadCandidateProfiles:', typeof CandidateProfilesAPI.loadCandidateProfiles);
