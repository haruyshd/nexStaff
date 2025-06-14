// Dashboard Manager
const DashboardManager = {
    init() {
        this.initializeNavigation();
        this.initializeMobileMenu();
        this.updateCurrentTime();
        this.initializeTabContent();
        this.initializeDashboardOverview();
    },

    initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a[data-tab]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = link.getAttribute('data-tab');
                this.switchTab(tabId);
                this.updateActiveLink(link);
            });
        });
    },

    initializeMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const navBackdrop = document.getElementById('navBackdrop');
        const sideNav = document.getElementById('sideNav');

        if (menuToggle && sideNav) {
            menuToggle.addEventListener('click', () => {
                sideNav.classList.toggle('active');
                navBackdrop.classList.toggle('active');
            });
        }

        if (navBackdrop) {
            navBackdrop.addEventListener('click', () => {
                sideNav.classList.remove('active');
                navBackdrop.classList.remove('active');
            });
        }
    },

    updateCurrentTime() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const updateTime = () => {
                const now = new Date();
                const options = { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                };
                timeElement.textContent = now.toLocaleDateString('en-US', options);
            };
            updateTime();
            setInterval(updateTime, 60000); // Update every minute
        }
    },

    switchTab(tabId) {
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Handle mobile menu
        const sideNav = document.getElementById('sideNav');
        const navBackdrop = document.getElementById('navBackdrop');
        if (window.innerWidth < 768 && sideNav && navBackdrop) {
            sideNav.classList.remove('active');
            navBackdrop.classList.remove('active');
        }
    },

    updateActiveLink(activeLink) {
        // Remove active class from all links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });
        // Add active class to clicked link
        activeLink.classList.add('active');
    },

    initializeTabContent() {
        // Initialize tab-specific content
        const currentTab = document.querySelector('.tab-content.active');
        if (currentTab) {
            this.loadTabContent(currentTab.id);
        }
    },

    initializeDashboardOverview() {
        // Get dashboard container
        const dashboardContainer = document.getElementById('dashboard');
        if (!dashboardContainer) return;

        // Create overview sections
        const overviewContent = `
            <div class="dashboard-header">
                <div class="current-time" id="currentTime"></div>
                <div class="quick-actions">
                    <button class="btn btn-primary" id="addEmployeeBtn">
                        <i class="material-icons">add</i> Add Employee
                    </button>
                </div>
            </div>
            <div class="dashboard-grid">
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="material-icons">people</i>
                    </div>
                    <div class="overview-details">
                        <h3>Employees</h3>
                        <p class="count" id="employeeCount">Loading...</p>
                    </div>
                </div>
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="material-icons">person_search</i>
                    </div>
                    <div class="overview-details">
                        <h3>Candidates</h3>
                        <p class="count" id="candidateCount">Loading...</p>
                    </div>
                </div>
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="material-icons">business</i>
                    </div>
                    <div class="overview-details">
                        <h3>Employers</h3>
                        <p class="count" id="employerCount">Loading...</p>
                    </div>
                </div>
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="material-icons">work</i>
                    </div>
                    <div class="overview-details">
                        <h3>Open Positions</h3>
                        <p class="count" id="positionsCount">Loading...</p>
                    </div>
                </div>
            </div>
            <div class="dashboard-sections">
                <div class="section recent-activity">
                    <h3>Recent Activity</h3>
                    <div class="activity-feed" id="activityFeed">
                        <p class="loading">Loading recent activity...</p>
                    </div>
                </div>
                <div class="section upcoming-events">
                    <h3>Upcoming Events</h3>
                    <div class="events-list" id="upcomingEvents">
                        <p class="loading">Loading events...</p>
                    </div>
                </div>
            </div>`;

        // Update dashboard content
        dashboardContainer.innerHTML = overviewContent;
        
        // Update the stats
        this.updateDashboardStats();
        
        // Initialize event handlers
        this.initializeQuickActions();
    },

    updateDashboardStats() {
        // Assuming we have these methods in our APIs
        if (typeof EmployeeManagementAPI !== 'undefined') {
            const employeeCount = EmployeeManagementAPI.getEmployeeCount() || '0';
            document.getElementById('employeeCount').textContent = employeeCount;
        }
        
        if (typeof CandidateProfilesAPI !== 'undefined') {
            const candidateCount = CandidateProfilesAPI.getCandidateCount() || '0';
            document.getElementById('candidateCount').textContent = candidateCount;
        }
        
        if (typeof EmployerProfilesAPI !== 'undefined') {
            const employerCount = EmployerProfilesAPI.getEmployerCount() || '0';
            document.getElementById('employerCount').textContent = employerCount;
            
            const positionsCount = EmployerProfilesAPI.getOpenPositionsCount() || '0';
            document.getElementById('positionsCount').textContent = positionsCount;
        }
    },

    initializeQuickActions() {
        const addEmployeeBtn = document.getElementById('addEmployeeBtn');
        if (addEmployeeBtn) {
            addEmployeeBtn.addEventListener('click', () => {
                if (typeof EmployeeManagementAPI !== 'undefined') {
                    EmployeeManagementAPI.showAddEmployeeModal();
                }
            });
        }
    },

    loadTabContent(tabId) {
        switch(tabId) {
            case 'dashboard':
                this.updateDashboardStats();
                break;
            case 'employees':
                // Initialize employee list
                if (typeof EmployeeManagementAPI !== 'undefined') {
                    EmployeeManagementAPI.refreshEmployeeList();
                }
                break;
            case 'candidates':
                // Initialize candidates view
                if (typeof CandidateProfilesAPI !== 'undefined') {
                    CandidateProfilesAPI.loadCandidateProfiles();
                }
                break;
            case 'employers':
                // Initialize employers view
                if (typeof EmployerProfilesAPI !== 'undefined') {
                    EmployerProfilesAPI.init();
                }
                break;
            case 'schedule':
                // Initialize schedule view
                if (typeof ScheduleAPI !== 'undefined') {
                    ScheduleAPI.loadSchedule();
                }
                break;
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    DashboardManager.init();
});
