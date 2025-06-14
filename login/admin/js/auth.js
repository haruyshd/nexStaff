// Authentication and user management
const AuthAPI = {
<<<<<<< HEAD
    // Token storage key
    TOKEN_KEY: 'nexstaff_auth_token',
    USER_KEY: 'nexstaff_user',
=======
    // Storage keys
    TOKEN_KEY: 'nexstaff_auth_token',
    USER_KEY: 'nexstaff_user',
    REMEMBER_KEY: 'nexstaff_remember',
>>>>>>> 0f9fc2e (Echo again)

    // User roles
    ROLES: {
        ADMIN: 'admin',
        HR: 'hr',
        MANAGER: 'manager',
        EMPLOYEE: 'employee'
    },

<<<<<<< HEAD
    // Initialize user session    init() {
=======
    // Initialize user session
    init() {
        console.log('Initializing AuthAPI...');
        const session = this.checkAuth();
        if (!session) {
            console.log('No valid session found');
            this.redirectToLogin();
            return null;
        }
        console.log('Valid session found:', session.user.role);
        return session;
    },

    // Check if user is authenticated
    checkAuth() {
>>>>>>> 0f9fc2e (Echo again)
        try {
            const token = localStorage.getItem(this.TOKEN_KEY);
            const userStr = localStorage.getItem(this.USER_KEY);
            const user = userStr ? JSON.parse(userStr) : null;
            
<<<<<<< HEAD
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
=======
            if (!token || !user || !user.role) {
                console.log('No valid auth data found');
                return null;
            }
            
            // Check if token is expired
            if (this.isTokenExpired(token)) {
                console.log('Token expired');
                this.clearAuth();
                return null;
            }
            
            return {
                isAuthenticated: true,
                user,
                token
            };
        } catch (error) {
            console.error('Error checking auth:', error);
            return null;
        }
    },

    // Login user
    login(credentials) {
        try {
            // For demo, using hardcoded admin credentials
            if (credentials.username === 'admin' && credentials.password === 'admin123') {
                const user = {
                    id: '1',
                    username: 'admin',
                    role: this.ROLES.ADMIN,
                    name: 'Admin User'
                };
                
                const token = 'demo_token_' + Date.now();
                
                this.setAuth(token, user, credentials.remember);
                return { success: true, user };
            }
            
            return { success: false, message: 'Invalid credentials' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed' };
        }
    },

    // Logout user
    logout() {
        console.log('Logging out...');
        this.clearAuth();
        this.redirectToLogin();
    },

    // Clear authentication data
    clearAuth() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.REMEMBER_KEY);
    },

    // Set authentication data
    setAuth(token, user, remember = false) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        if (remember) {
            localStorage.setItem(this.REMEMBER_KEY, 'true');
        }
    },

    // Check if token is expired (demo implementation)
    isTokenExpired(token) {
        return false; // For demo purposes
    },

    // Redirect to login page
    redirectToLogin() {
        window.location.href = 'login.html';
    },

    // Check if user has required role
    hasRole(requiredRole) {
        const session = this.checkAuth();
        return session && session.user && session.user.role === requiredRole;
    },

    // Check if user has admin access
    isAdmin() {
        return this.hasRole(this.ROLES.ADMIN);
    }
};

// Expose AuthAPI globally
window.AuthAPI = AuthAPI;
>>>>>>> 0f9fc2e (Echo again)
