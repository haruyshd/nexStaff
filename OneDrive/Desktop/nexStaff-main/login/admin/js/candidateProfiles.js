// Candidate Profiles Management
const CandidateProfilesAPI = {
    init() {
        this.loadCandidateProfiles();
    },

    loadCandidateProfiles() {
        // Sample data - replace with actual API call
        const candidates = [
            {
                id: 1,
                name: "John Doe",
                email: "john.doe@email.com",
                skills: ["JavaScript", "React", "Node.js"],
                experience: "5 years",
                preferredRole: "Senior Software Engineer",
                status: "Available",
                appliedJobs: ["Software Engineer", "Full Stack Developer"]
            },
            {
                id: 2,
                name: "Jane Smith",
                email: "jane.smith@email.com",
                skills: ["UI/UX Design", "Figma", "Adobe XD"],
                experience: "3 years",
                preferredRole: "UI/UX Designer",
                status: "Interviewing",
                appliedJobs: ["UI/UX Designer", "Product Designer"]
            }
        ];

        this.renderCandidateProfiles(candidates);
    },

    renderCandidateProfiles(candidates) {
        const container = document.getElementById('candidateProfiles');
        if (!container) return;

        container.innerHTML = candidates.map(candidate => `
            <div class="profile-card candidate">
                <div class="profile-header">
                    <h3>${candidate.name}</h3>
                    <span class="status ${candidate.status.toLowerCase()}">${candidate.status}</span>
                </div>
                <div class="profile-content">
                    <p><strong>Email:</strong> ${candidate.email}</p>
                    <p><strong>Preferred Role:</strong> ${candidate.preferredRole}</p>
                    <p><strong>Experience:</strong> ${candidate.experience}</p>
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
                    <button class="btn btn-primary" onclick="CandidateProfilesAPI.viewProfile(${candidate.id})">
                        <i class="material-icons">visibility</i> View Profile
                    </button>
                    <button class="btn btn-secondary" onclick="CandidateProfilesAPI.scheduleInterview(${candidate.id})">
                        <i class="material-icons">event</i> Schedule Interview
                    </button>
                </div>
            </div>
        `).join('');
    },

    viewProfile(id) {
        alert('View candidate profile: ' + id); // Replace with actual implementation
    },

    scheduleInterview(id) {
        alert('Schedule interview for candidate: ' + id); // Replace with actual implementation
    }
};
