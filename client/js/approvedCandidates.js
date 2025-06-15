// Approved Candidates Display System
const ApprovedCandidatesDisplay = {
    init() {
        this.displayApprovedCandidates();
    },

    getApprovedCandidates() {
        // Get approved candidates from storage
        const stored = localStorage.getItem('nexstaff_candidates');
        if (stored) {
            const allCandidates = JSON.parse(stored);
            return allCandidates.filter(candidate => candidate.approvalStatus === 'approved');
        }
        return [];
    },

    displayApprovedCandidates() {
        const container = document.getElementById('approvedCandidatesSection');
        if (!container) return;

        const approvedCandidates = this.getApprovedCandidates();
        
        if (approvedCandidates.length === 0) {
            container.innerHTML = `
                <div class="no-candidates">
                    <ion-icon name="people-outline"></ion-icon>
                    <h3>No approved candidates yet</h3>
                    <p>Check back soon to see our approved talent pool!</p>
                </div>
            `;
            return;
        }

        const candidatesHTML = approvedCandidates.slice(0, 6).map(candidate => `
            <div class="candidate-card">
                <div class="candidate-avatar">
                    <span>${candidate.name.charAt(0).toUpperCase()}</span>
                </div>
                <div class="candidate-info">
                    <h4>${candidate.name}</h4>
                    <p class="candidate-role">${candidate.preferredRole}</p>
                    <p class="candidate-experience">${candidate.experience} experience</p>
                    <div class="candidate-skills">
                        ${candidate.skills.slice(0, 3).map(skill => 
                            `<span class="skill-tag">${skill}</span>`
                        ).join('')}
                        ${candidate.skills.length > 3 ? `<span class="skill-more">+${candidate.skills.length - 3}</span>` : ''}
                    </div>
                </div>
                <div class="candidate-actions">
                    <button class="btn-contact" onclick="ApprovedCandidatesDisplay.contactCandidate('${candidate.email}')">
                        <ion-icon name="mail-outline"></ion-icon>
                        Contact
                    </button>
                    <button class="btn-view" onclick="ApprovedCandidatesDisplay.viewCandidate(${candidate.id})">
                        <ion-icon name="eye-outline"></ion-icon>
                        View Profile
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="section-header">
                <h2>Our Approved Talent Pool</h2>
                <p>Connect with our pre-screened, qualified candidates</p>
                <span class="candidate-count">${approvedCandidates.length} approved candidates</span>
            </div>
            <div class="candidates-grid">
                ${candidatesHTML}
            </div>
            ${approvedCandidates.length > 6 ? `
                <div class="view-all-container">
                    <a href="pages/candidates.html" class="btn-view-all">
                        View All ${approvedCandidates.length} Candidates
                        <ion-icon name="arrow-forward-outline"></ion-icon>
                    </a>
                </div>
            ` : ''}
        `;
    },

    contactCandidate(email) {
        // Open email client
        window.location.href = `mailto:${email}?subject=Job Opportunity from NexStaff&body=Hello,%0D%0A%0D%0AI found your profile on NexStaff and would like to discuss a potential opportunity with you.%0D%0A%0D%0ABest regards`;
    },

    viewCandidate(id) {
        const candidates = this.getApprovedCandidates();
        const candidate = candidates.find(c => c.id === id);
        
        if (candidate) {
            // Create modal to show candidate details
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
                        <div class="candidate-detail">
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
                                <span class="label">Skills:</span>
                                <div class="skills-list">
                                    ${candidate.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="btn-primary" onclick="ApprovedCandidatesDisplay.contactCandidate('${candidate.email}')">
                                <ion-icon name="mail-outline"></ion-icon>
                                Contact Candidate
                            </button>
                            <a href="pages/jobs.html" class="btn-secondary">
                                <ion-icon name="briefcase-outline"></ion-icon>
                                View Job Openings
                            </a>
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
            });
        }
    },

    refreshDisplay() {
        // Call this when candidates are approved/rejected
        this.displayApprovedCandidates();
    }
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ApprovedCandidatesDisplay.init();
});
