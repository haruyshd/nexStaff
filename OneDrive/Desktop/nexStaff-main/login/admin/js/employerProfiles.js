// Employer Profiles Management
const EmployerProfilesAPI = {
    init() {
        console.log('Initializing EmployerProfilesAPI');
        this.dataService = window.dataService;
        
        if (!this.dataService) {
            console.error('DataService not found! EmployerProfilesAPI initialization failed.');
            this.showError('System Error: Data service not available');
            return;
        }
        
        // Subscribe to data changes
        this.unsubscribe = this.dataService.subscribe(({ profiles }) => {
            console.log('Data changed, updating employer profiles');
            this.renderEmployerProfiles(profiles);
        });
        
        // Initial load
        this.loadInitialData();
    },

    loadInitialData() {
        const container = document.getElementById('employerProfiles');
        if (!container) {
            console.error('Employer profiles container not found');
            return;
        }

        // Show loading state
        container.innerHTML = '<div class="loading">Loading employer profiles...</div>';
        
        try {
            const profiles = this.dataService.getEmployerProfiles();
            this.renderEmployerProfiles(profiles);
        } catch (error) {
            console.error('Error loading initial profiles:', error);
            this.showError('Failed to load employer profiles');
        }
    },

    renderEmployerProfiles(employers) {
        const container = document.getElementById('employerProfiles');
        if (!container) {
            console.error('Employer profiles container not found');
            return;
        }

        try {
            console.log('Rendering employer profiles:', employers);
            
            container.innerHTML = employers.map(employer => `
                <div class="profile-card employer" data-id="${employer.id}">
                    <div class="profile-header">
                        <h3>${employer.companyName || 'Company Name Not Set'}</h3>
                        <span class="status ${(employer.status || 'pending').toLowerCase()}">${employer.status || 'Pending'}</span>
                    </div>
                    <div class="profile-content">
                        <p><strong>Industry:</strong> ${employer.industry || 'Not specified'}</p>
                        <p><strong>Location:</strong> ${employer.location || 'Not specified'}</p>
                        <p><strong>Contact:</strong> ${employer.contactPerson || 'Not specified'}</p>
                        <p><strong>Email:</strong> ${employer.email || 'Not specified'}</p>
                        
                        ${this.renderTeamsSection(employer.teams)}
                        
                        <div class="open-positions">
                            <strong>Open Positions (${employer.activeListings || 0}):</strong>
                            <ul>
                                ${(employer.openPositions || [])
                                    .map(position => `<li>${position}</li>`)
                                    .join('') || '<li>No open positions</li>'}
                            </ul>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button class="btn btn-primary" onclick="EmployerProfilesAPI.viewProfile('${employer.id}')">
                            <i class="material-icons">visibility</i> View Profile
                        </button>
                        <button class="btn btn-secondary" onclick="EmployerProfilesAPI.manageListings('${employer.id}')">
                            <i class="material-icons">work</i> Manage Listings
                        </button>
                    </div>
                </div>
            `).join('') || '<p class="no-profiles">No employer profiles found.</p>';

            this.addStyles();
        } catch (error) {
            console.error('Error rendering employer profiles:', error);
            container.innerHTML = '<p class="error">Error loading profiles. Please try again.</p>';
        }
    },

    renderTeamsSection(teams = []) {
        if (!teams || teams.length === 0) {
            return '<div class="teams-section"><p>No teams created yet.</p></div>';
        }

        return `
            <div class="teams-section">
                <h4>Teams (${teams.length})</h4>
                <div class="teams-grid">
                    ${teams.map(team => `
                        <div class="team-card mini">
                            <h5>${team.teamName}</h5>
                            <p class="department">${team.department}</p>
                            <div class="team-details">
                                <p class="requirements-count">${
                                    team.requirements ? 
                                    team.requirements.split(',').length + ' Requirements' : 
                                    'No requirements'
                                }</p>
                                <p class="members-count">${team.members ? team.members.length : 0} Members</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    addStyles() {
        // Add any required styles that aren't in CSS
        const styles = document.createElement('style');
        styles.textContent = `
            .profile-card.employer {
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 20px;
                padding: 20px;
            }
            .profile-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            .status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.9em;
            }
            .status.active { background: #e6ffe6; color: #006600; }
            .status.pending { background: #fff3e6; color: #cc7700; }
            .teams-section {
                margin: 15px 0;
                padding-top: 15px;
                border-top: 1px solid #eee;
            }
            .teams-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 10px;
            }
            .team-card.mini {
                background: #f8f9fa;
                padding: 10px;
                border-radius: 6px;
            }
            .team-card.mini h5 {
                margin: 0 0 5px 0;
                font-size: 1em;
            }
            .team-card.mini .department {
                color: #666;
                font-size: 0.9em;
                margin: 5px 0;
            }
            .team-details {
                display: flex;
                justify-content: space-between;
                font-size: 0.8em;
                color: #777;
            }
            .error-message {
                background: #fff3f3;
                color: #d8000c;
                border: 1px solid #d8000c;
                padding: 10px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .error-message i {
                margin-right: 10px;
            }
            .loading {
                text-align: center;
                padding: 20px;
                font-size: 1.2em;
                color: #555;
            }
        `;
        document.head.appendChild(styles);
    },

    showError(message) {
        const container = document.getElementById('employerProfiles');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `
                <i class="material-icons">error</i>
                <span>${message}</span>
                <button onclick="EmployerProfilesAPI.loadInitialData()">
                    <i class="material-icons">refresh</i> Retry
                </button>
            `;
            container.innerHTML = '';
            container.appendChild(errorDiv);
        }
    },

    viewProfile(employerId) {
        console.log('Viewing employer profile:', employerId);
        // Implement profile view logic
    },

    manageListings(employerId) {
        console.log('Managing listings for employer:', employerId);
        // Implement listings management logic
    },

    getEmployerCount() {
        try {
            const profiles = this.dataService.getEmployerProfiles();
            return profiles.length;
        } catch (error) {
            console.error('Error getting employer count:', error);
            return 0;
        }
    },

    getOpenPositionsCount() {
        try {
            const profiles = this.dataService.getEmployerProfiles();
            return profiles.reduce((total, employer) => {
                return total + (employer.activeListings || 0);
            }, 0);
        } catch (error) {
            console.error('Error getting open positions count:', error);
            return 0;
        }
    },

    destroy() {
        // Cleanup when switching away from employers tab
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
};

// Initialize on page load
window.addEventListener('load', () => {
    EmployerProfilesAPI.init();
});
