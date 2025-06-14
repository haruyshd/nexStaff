// Shared data service for synchronization
const DataService = {
    subscribers: new Set(),

    // Subscribe to data changes
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    },

    // Notify all subscribers of data changes
    notifySubscribers() {
        this.subscribers.forEach(callback => callback());
    },

    // Load employer profiles with teams
    loadEmployerProfiles() {
        try {
            const employers = JSON.parse(localStorage.getItem('employerProfiles')) || [];
            const teams = JSON.parse(localStorage.getItem('teams')) || [];
            
            console.log('DataService: Loading profiles and teams', { employers, teams });

            // Match teams with employers
            const updatedEmployers = employers.map(employer => {
                const employerTeams = teams.filter(team => 
                    team.email && employer.email && 
                    team.email.toLowerCase() === employer.email.toLowerCase()
                );
                return {
                    ...employer,
                    teams: employerTeams,
                    updatedAt: employer.updatedAt || employer.createdAt
                };
            });

            return updatedEmployers;
        } catch (error) {
            console.error('DataService: Error loading data', error);
            return [];
        }
    },

    // Save a new team and update employer profiles
    saveTeam(teamData) {
        try {
            // Load existing data
            const teams = JSON.parse(localStorage.getItem('teams')) || [];
            const employers = JSON.parse(localStorage.getItem('employerProfiles')) || [];

            // Add new team
            teams.push(teamData);
            localStorage.setItem('teams', JSON.stringify(teams));

            // Update employer profiles
            const updatedEmployers = employers.map(employer => {
                if (employer.email && teamData.email && 
                    employer.email.toLowerCase() === teamData.email.toLowerCase()) {
                    return {
                        ...employer,
                        teams: [...(employer.teams || []), teamData],
                        updatedAt: new Date().toISOString()
                    };
                }
                return employer;
            });

            localStorage.setItem('employerProfiles', JSON.stringify(updatedEmployers));
            
            console.log('DataService: Team saved and profiles updated', { teamData, updatedEmployers });
            
            // Notify subscribers of data change
            this.notifySubscribers();
            
            return true;
        } catch (error) {
            console.error('DataService: Error saving team', error);
            return false;
        }
    },

    // Initialize real-time sync
    initSync() {
        console.log('DataService: Initializing sync');
        
        // Listen for storage events (changes from other tabs)
        window.addEventListener('storage', (event) => {
            if (event.key === 'teams' || event.key === 'employerProfiles') {
                console.log('DataService: Storage changed', event.key);
                this.notifySubscribers();
            }
        });

        // Set up periodic sync
        setInterval(() => {
            this.notifySubscribers();
        }, 2000); // Sync every 2 seconds
    }
};
