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

    // Initialize user session
    init() {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const user = localStorage.getItem(this.USER_KEY);
        return {
            isAuthenticated: !!token,
            user: user ? JSON.parse(user) : null,
            token
        };
    },

    // Login function with role-based access
    async login(email, password) {
        // This would be replaced with actual API call
        if (email === 'admin@nexstaff.com' && password === 'admin123') {
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
            
            return { success: true, user: userData };
        }
        
        return { success: false, error: 'Invalid credentials' };
    },

    // Logout function
    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        window.location.href = 'login.html';
    },

    // Check user permissions
    hasPermission(permission) {
        const user = JSON.parse(localStorage.getItem(this.USER_KEY));
        return user && user.permissions && user.permissions.includes(permission);
    },

    // Check if user has admin role
    isAdmin() {
        const user = JSON.parse(localStorage.getItem(this.USER_KEY));
        return user && user.role === this.ROLES.ADMIN;
    }
};
