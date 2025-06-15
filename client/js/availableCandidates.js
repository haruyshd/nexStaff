// Available Candidates Display for candidates.html
const AvailableCandidatesDisplay = {
    init() {
        this.loadAvailableCandidates();
    },

    getAvailableCandidates() {
        // Get all candidates from storage
        const stored = localStorage.getItem('nexstaff_candidates');
        if (stored) {
            const allCandidates = JSON.parse(stored);
            // Filter for candidates with "Available" status (regardless of approval status)
            return allCandidates.filter(candidate => 
                candidate.status === 'Available' || 
                candidate.status === 'available' ||
                candidate.status === 'Available for opportunities'
            );
        }
        return [];
    },

    loadAvailableCandidates() {
        const container = document.getElementById('availableCandidatesContainer');
        if (!container) return;

        const availableCandidates = this.getAvailableCandidates();
        
        if (availableCandidates.length === 0) {
            container.innerHTML = `
                <div class="no-candidates-message">
                    <ion-icon name="people-outline"></ion-icon>
                    <h3>No Available Candidates</h3>
                    <p>Be the first to join our talent pool!</p>
                    <button class="btn-create-profile" onclick="document.getElementById('createProfileBtn').click()">
                        <ion-icon name="person-add-outline"></ion-icon>
                        Create Your Profile
                    </button>
                </div>
            `;
            return;
        }

        // Add filter options
        const filterHTML = `
            <div class="candidate-filters">
                <button class="filter-btn active" onclick="AvailableCandidatesDisplay.filterByStatus('all')">
                    All Available (${availableCandidates.length})
                </button>
                <button class="filter-btn" onclick="AvailableCandidatesDisplay.filterByStatus('approved')">
                    Approved (${availableCandidates.filter(c => c.approvalStatus === 'approved').length})
                </button>
                <button class="filter-btn" onclick="AvailableCandidatesDisplay.filterByStatus('pending')">
                    Pending Review (${availableCandidates.filter(c => c.approvalStatus === 'pending').length})
                </button>
            </div>
        `;

        const candidatesHTML = this.renderCandidateCards(availableCandidates);
        
        container.innerHTML = filterHTML + '<div id="candidateCardsContainer">' + candidatesHTML + '</div>';
    },

    renderCandidateCards(candidates) {
        return candidates.map(candidate => {
            const isApproved = candidate.approvalStatus === 'approved';
            const isPending = candidate.approvalStatus === 'pending';
            const isRejected = candidate.approvalStatus === 'rejected';
            
            const approvalBadge = isApproved ? 
                '<span class="approval-status approved"><ion-icon name="checkmark-circle"></ion-icon> Verified</span>' :
                isPending ? 
                '<span class="approval-status pending"><ion-icon name="time-outline"></ion-icon> Under Review</span>' :
                '<span class="approval-status rejected"><ion-icon name="close-circle"></ion-icon> Not Approved</span>';

            return `
                <div class="candidate-profile-card ${candidate.approvalStatus}" data-status="${candidate.approvalStatus}">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <span>${candidate.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div class="profile-info">
                            <h3>${candidate.name}</h3>
                            <p class="profile-role">${candidate.preferredRole}</p>
                            ${approvalBadge}
                        </div>
                    </div>
                    
                    <div class="profile-details">
                        <div class="detail-item">
                            <ion-icon name="briefcase-outline"></ion-icon>
                            <span>${candidate.experience}</span>
                        </div>
                        <div class="detail-item">
                            <ion-icon name="location-outline"></ion-icon>
                            <span>Remote/On-site</span>
                        </div>
                        <div class="detail-item">
                            <ion-icon name="calendar-outline"></ion-icon>
                            <span>Joined ${new Date(candidate.submissionDate).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div class="skills-section">
                        <h4>Skills</h4>
                        <div class="skills-container">
                            ${candidate.skills.slice(0, 4).map(skill => 
                                `<span class="skill-tag">${skill}</span>`
                            ).join('')}
                            ${candidate.skills.length > 4 ? 
                                `<span class="skills-more">+${candidate.skills.length - 4} more</span>` : ''
                            }
                        </div>
                    </div>

                    <div class="profile-actions">
                        ${isApproved ? `
                            <button class="btn-primary" onclick="AvailableCandidatesDisplay.contactCandidate('${candidate.email}', '${candidate.name}')">
                                <ion-icon name="mail-outline"></ion-icon>
                                Contact
                            </button>
                            <button class="btn-secondary" onclick="AvailableCandidatesDisplay.viewFullProfile(${candidate.id})">
                                <ion-icon name="eye-outline"></ion-icon>
                                View Profile
                            </button>
                        ` : `
                            <button class="btn-disabled" disabled>
                                <ion-icon name="mail-outline"></ion-icon>
                                Contact (Pending Approval)
                            </button>
                            <button class="btn-secondary" onclick="AvailableCandidatesDisplay.viewFullProfile(${candidate.id})">
                                <ion-icon name="eye-outline"></ion-icon>
                                View Profile
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },

    filterByStatus(status) {
        const allCandidates = this.getAvailableCandidates();
        let filteredCandidates = allCandidates;
        
        if (status !== 'all') {
            filteredCandidates = allCandidates.filter(candidate => candidate.approvalStatus === status);
        }
        
        // Update active filter button
        document.querySelectorAll('.candidate-filters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Update candidates display
        const container = document.getElementById('candidateCardsContainer');
        if (container) {
            container.innerHTML = this.renderCandidateCards(filteredCandidates);
        }
    },

    contactCandidate(email, name) {
        const subject = encodeURIComponent(`Job Opportunity - ${name}`);
        const body = encodeURIComponent(`Hello ${name},

I found your profile on NexStaff and would like to discuss a potential job opportunity with you.

Please let me know if you're interested in learning more about this position.

Best regards`);
        
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    },

    viewFullProfile(candidateId) {
        const candidates = this.getAvailableCandidates();
        const candidate = candidates.find(c => c.id === candidateId);
        
        if (!candidate) return;

        const modal = document.createElement('div');
        modal.className = 'candidate-modal-overlay';
        modal.innerHTML = `
            <div class="candidate-modal">
                <div class="modal-header">
                    <h3>${candidate.name}</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="candidate-full-details">
                        <div class="detail-section">
                            <h4>Professional Information</h4>
                            <div class="detail-grid">
                                <div class="detail-row">
                                    <span class="label">Preferred Role:</span>
                                    <span class="value">${candidate.preferredRole}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Experience:</span>
                                    <span class="value">${candidate.experience}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Status:</span>
                                    <span class="value status-${candidate.status.toLowerCase()}">${candidate.status}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Approval:</span>
                                    <span class="value approval-${candidate.approvalStatus}">
                                        ${candidate.approvalStatus.charAt(0).toUpperCase() + candidate.approvalStatus.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Skills & Expertise</h4>
                            <div class="skills-list">
                                ${candidate.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                            </div>
                        </div>
                        
                        ${candidate.appliedJobs && candidate.appliedJobs.length > 0 ? `
                            <div class="detail-section">
                                <h4>Applied Positions</h4>
                                <ul class="applied-jobs-list">
                                    ${candidate.appliedJobs.map(job => `<li>${job}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        <div class="detail-section">
                            <h4>Profile Information</h4>
                            <div class="detail-grid">
                                <div class="detail-row">
                                    <span class="label">Joined:</span>
                                    <span class="value">${new Date(candidate.submissionDate).toLocaleDateString()}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Source:</span>
                                    <span class="value">${candidate.source || 'Direct Registration'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${candidate.approvalStatus === 'approved' ? `
                        <div class="modal-actions">
                            <button class="btn-primary" onclick="AvailableCandidatesDisplay.contactCandidate('${candidate.email}', '${candidate.name}')">
                                <ion-icon name="mail-outline"></ion-icon>
                                Contact ${candidate.name}
                            </button>
                            <a href="jobs.html" class="btn-secondary">
                                <ion-icon name="briefcase-outline"></ion-icon>
                                View Job Openings
                            </a>
                        </div>
                    ` : `
                        <div class="modal-notice">
                            <ion-icon name="information-circle-outline"></ion-icon>
                            <p>This candidate is currently under review. Contact will be available once approved.</p>
                        </div>
                    `}
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

    refreshDisplay() {
        this.loadAvailableCandidates();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other scripts are loaded
    setTimeout(() => {
        AvailableCandidatesDisplay.init();
    }, 500);
});
