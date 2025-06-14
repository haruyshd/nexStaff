// Team management functionality
class TeamManagement {
    constructor() {
        console.log('Initializing TeamManagement');
        this.dataService = window.dataService;
        this.initializeEventListeners();
        this.updateTeamsList(); // Initial load
    }

    loadTeams() {
        try {
            return this.dataService.getTeams();
        } catch (error) {
            console.error('Error loading teams:', error);
            return [];
        }
    }

    validateTeamData(data) {
        console.log('Validating team data:', data);

        // Basic data validation
        if (!data || typeof data !== 'object') {
            this.showNotification('Invalid team data format', 'error');
            return false;
        }

        // Check required fields
        const requiredFields = ['teamName', 'department', 'description', 'requirements', 'email', 'phone'];
        const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');

        if (missingFields.length > 0) {
            const message = `Please fill in all required fields: ${missingFields.join(', ')}`;
            this.showNotification(message, 'error');
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }

        // Validate phone format
        const phoneRegex = /^\+?[\d\s-()]+$/;
        if (!phoneRegex.test(data.phone)) {
            this.showNotification('Please enter a valid phone number', 'error');
            return false;
        }

        return true;
    }

    createTeam(data) {
        try {
            console.log('Creating team with data:', data);

            // Validate data first
            if (!this.validateTeamData(data)) {
                return null;
            }

            // Create team through DataService
            if (this.dataService.addTeam(data)) {
                console.log('Team created successfully:', data);
                this.showNotification('Team created successfully!', 'success');
                return true;
            } else {
                this.showNotification('Failed to create team', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error creating team:', error);
            this.showNotification('Failed to create team: ' + error.message, 'error');
            return false;
        }
    }

    updateTeamsList() {
        const teams = this.loadTeams();
        const teamsList = document.getElementById('teamsList');
        if (!teamsList) return;

        teamsList.innerHTML = '';
        teams.forEach(team => {
            const teamCard = this.createTeamCard(team);
            teamsList.appendChild(teamCard);
        });
    }    createTeamCard(team) {
        const card = document.createElement('div');
        card.className = 'team-card';
        card.innerHTML = `
            <h3>${team.teamName}</h3>
            <p><strong>Department:</strong> ${team.department}</p>
            <p><strong>Description:</strong> ${team.description}</p>
            <p><strong>Requirements:</strong> ${team.requirements}</p>
            <p><strong>Contact:</strong> ${team.email} | ${team.phone}</p>
            <div class="team-actions">
                <button class="btn btn-primary" data-team-id="${team.id}">Edit Team</button>
                <button class="btn btn-success" data-team-id="${team.id}">Contact Team</button>
            </div>
        `;
        
        // Add event listeners to the buttons
        setTimeout(() => {
            const editBtn = card.querySelector('.btn-primary');
            const contactBtn = card.querySelector('.btn-success');
            
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleEditTeam(team.id);
                });
            }
            
            if (contactBtn) {
                contactBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleContactTeam(team.id);
                });
            }
        }, 0);
        
        return card;
    }

    initializeEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing team management...');
            const form = document.getElementById('createTeamForm');
            if (form) {
                form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    console.log('Form submitted');
                    this.handleCreateTeam(event);
                });

                // Subscribe to data changes
                this.dataService.subscribe(() => {
                    console.log('Data changed, updating teams list');
                    this.updateTeamsList();
                });
            }
        });
    }

    handleCreateTeam(event) {
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        if (this.createTeam(data)) {
            event.target.reset();
        }
    }

    handleEditTeam(teamId) {
        console.log('Editing team:', teamId);
        const teams = this.dataService.getTeams();
        const team = teams.find(t => t.id == teamId);
        
        if (!team) {
            this.showNotification('Team not found', 'error');
            return;
        }
        
        // Fill the form with team data
        const form = document.getElementById('createTeamForm');
        if (form) {
            form.teamName.value = team.teamName;
            form.department.value = team.department;
            form.description.value = team.description;
            form.requirements.value = team.requirements;
            form.email.value = team.email;
            form.phone.value = team.phone;
            
            // Scroll to the form
            form.scrollIntoView({ behavior: 'smooth' });
            
            // Change submit button to indicate editing
            const submitBtn = form.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.textContent = 'Update Team';
                submitBtn.dataset.editing = teamId;
            }
        }
    }
    
    handleContactTeam(teamId) {
        console.log('Contacting team:', teamId);
        const teams = this.dataService.getTeams();
        const team = teams.find(t => t.id == teamId);
        
        if (!team) {
            this.showNotification('Team not found', 'error');
            return;
        }
        
        // Show contact info modal or redirect to email
        const emailSubject = encodeURIComponent(`Inquiry about ${team.teamName} team`);
        const emailBody = encodeURIComponent(`Hello,\n\nI am interested in your ${team.teamName} team.\n\nBest regards,`);
        window.location.href = `mailto:${team.email}?subject=${emailSubject}&body=${emailBody}`;
        
        this.showNotification(`Opening email to contact ${team.teamName}`, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize team management
window.addEventListener('load', () => {
    window.teamManagement = new TeamManagement();
});
