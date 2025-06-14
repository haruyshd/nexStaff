// Placeholder data and functionality for profiles
const ProfilesManager = {
    candidates: [
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
    ],

    employers: [
        {
            id: 1,
            companyName: "Tech Solutions Inc.",
            industry: "Technology",
            location: "New York, NY",
            openPositions: ["Senior Software Engineer", "UI/UX Designer"],
            contactPerson: "Michael Johnson",
            email: "m.johnson@techsolutions.com",
            status: "Active",
            activeListings: 2
        },
        {
            id: 2,
            companyName: "Creative Designs Co.",
            industry: "Design & Marketing",
            location: "San Francisco, CA",
            openPositions: ["Graphic Designer", "Marketing Manager"],
            contactPerson: "Sarah Williams",
            email: "s.williams@creativedesigns.com",
            status: "Active",
            activeListings: 3
        }
    ],

    scheduleEvents: [
        {
            id: 1,
            type: "Interview",
            title: "Interview with John Doe for Senior Developer Position",
            date: "2025-06-15",
            time: "10:00 AM",
            candidate: "John Doe",
            employer: "Tech Solutions Inc.",
            position: "Senior Software Engineer",
            status: "Scheduled"
        },
        {
            id: 2,
            type: "Follow-up",
            title: "Follow-up Meeting with Creative Designs Co.",
            date: "2025-06-16",
            time: "2:00 PM",
            employer: "Creative Designs Co.",
            status: "Confirmed"
        }
    ],

    renderCandidateProfiles(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = this.candidates.map(candidate => `
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
                    <button class="btn btn-primary" onclick="ProfilesManager.viewCandidateProfile(${candidate.id})">
                        <ion-icon name="eye-outline"></ion-icon> View Profile
                    </button>
                    <button class="btn btn-secondary" onclick="ProfilesManager.scheduleInterview(${candidate.id})">
                        <ion-icon name="calendar-outline"></ion-icon> Schedule Interview
                    </button>
                </div>
            </div>
        `).join('');
    },

    renderEmployerProfiles(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = this.employers.map(employer => `
            <div class="profile-card employer">
                <div class="profile-header">
                    <h3>${employer.companyName}</h3>
                    <span class="status ${employer.status.toLowerCase()}">${employer.status}</span>
                </div>
                <div class="profile-content">
                    <p><strong>Industry:</strong> ${employer.industry}</p>
                    <p><strong>Location:</strong> ${employer.location}</p>
                    <p><strong>Contact:</strong> ${employer.contactPerson}</p>
                    <p><strong>Email:</strong> ${employer.email}</p>
                    <div class="open-positions">
                        <strong>Open Positions (${employer.activeListings}):</strong>
                        <ul>
                            ${employer.openPositions.map(position => `<li>${position}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="btn btn-primary" onclick="ProfilesManager.viewEmployerProfile(${employer.id})">
                        <ion-icon name="eye-outline"></ion-icon> View Profile
                    </button>
                    <button class="btn btn-secondary" onclick="ProfilesManager.viewOpenings(${employer.id})">
                        <ion-icon name="briefcase-outline"></ion-icon> View Openings
                    </button>
                </div>
            </div>
        `).join('');
    },

    renderSchedule(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = this.scheduleEvents.map(event => `
            <div class="schedule-card ${event.type.toLowerCase()}">
                <div class="schedule-header">
                    <span class="event-type">${event.type}</span>
                    <span class="status ${event.status.toLowerCase()}">${event.status}</span>
                </div>
                <div class="schedule-content">
                    <h3>${event.title}</h3>
                    <div class="schedule-details">
                        <p><ion-icon name="calendar-outline"></ion-icon> ${event.date}</p>
                        <p><ion-icon name="time-outline"></ion-icon> ${event.time}</p>
                        ${event.candidate ? `<p><ion-icon name="person-outline"></ion-icon> Candidate: ${event.candidate}</p>` : ''}
                        <p><ion-icon name="business-outline"></ion-icon> ${event.employer}</p>
                        ${event.position ? `<p><ion-icon name="briefcase-outline"></ion-icon> Position: ${event.position}</p>` : ''}
                    </div>
                </div>
                <div class="schedule-actions">
                    <button class="btn btn-primary" onclick="ProfilesManager.viewEvent(${event.id})">
                        <ion-icon name="eye-outline"></ion-icon> View Details
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Placeholder action handlers
    viewCandidateProfile(id) {
        alert('View candidate profile: ' + id + '\nThis is a placeholder. Implement with actual database.');
    },

    scheduleInterview(id) {
        alert('Schedule interview for candidate: ' + id + '\nThis is a placeholder. Implement with actual database.');
    },

    viewEmployerProfile(id) {
        alert('View employer profile: ' + id + '\nThis is a placeholder. Implement with actual database.');
    },

    viewOpenings(id) {
        alert('View job openings for employer: ' + id + '\nThis is a placeholder. Implement with actual database.');
    },

    viewEvent(id) {
        alert('View event details: ' + id + '\nThis is a placeholder. Implement with actual database.');
    }
};
