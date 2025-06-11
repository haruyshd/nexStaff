// Authentication and user management
const AuthAPI = {
    // Token storage key
    TOKEN_KEY: 'nexstaff_auth_token',
    USER_KEY: 'nexstaff_user',

    // User roles
    ROLES: {
        ADMIN: 'admin',
        HR: 'hr',
        MANAGER: 'manager',
        EMPLOYEE: 'employee'
    },

    // Initialize user session    init() {
        try {
            const token = localStorage.getItem(this.TOKEN_KEY);
            const userStr = localStorage.getItem(this.USER_KEY);
            const user = userStr ? JSON.parse(userStr) : null;
            
            // Validate the session
            if (token && user && user.role) {
                return {
                    isAuthenticated: true,
                    user,
                    token
                };
            } else {
                // Clear invalid session data
                this.logout();
                return {
                    isAuthenticated: false,
                    user: null,
                    token: null
                };
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            this.logout();
            return {
                isAuthenticated: false,
                user: null,
                token: null
            };
        }
    },
    
    // Login function with role-based access    async login(email, password) {
        console.log('Login attempt:', { email });
        
        // Clear any existing auth data first
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        
        // This would be replaced with actual API call
        if (email === 'admin@nexstaff.com' && password === 'admin123') {
            console.log('Credentials valid, creating session');
            
            const userData = {
                id: 1,
                email,
                name: 'Admin User',
                role: this.ROLES.ADMIN,
                permissions: ['manage_employees', 'manage_roles', 'view_analytics']
            };
            const token = 'dummy_token_' + Math.random();
            
            // Store auth data
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
            
            console.log('Session created successfully');
            return { success: true, user: userData };
        }
        
        console.log('Invalid credentials');
        return { success: false, error: 'Invalid credentials' };
    },
    
    // Logout function
    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem('nexstaff_remember');
    },    // Check user permissions
    hasPermission(permission) {
        try {
            const session = this.init();
            return session.isAuthenticated && 
                   session.user.permissions && 
                   session.user.permissions.includes(permission);
        } catch (error) {
            console.error('Error checking permissions:', error);
            return false;
        }
    },

    // Check if user has admin role
    isAdmin() {
        try {
            const session = this.init();
            return session.isAuthenticated && session.user.role === this.ROLES.ADMIN;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    },

    // Check if user has HR role
    isHR() {
        try {
            const session = this.init();
            return session.isAuthenticated && session.user.role === this.ROLES.HR;
        } catch (error) {
            console.error('Error checking HR status:', error);
            return false;
        }
    }
};
