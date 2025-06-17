// Authentication and user management using Supabase
const AuthAPI = {
    // Storage keys
    TOKEN_KEY: 'nexstaff_auth_token',
    USER_KEY: 'nexstaff_user',
    REMEMBER_KEY: 'nexstaff_remember',

    // User roles
    ROLES: {
        ADMIN: 'admin',
        HR: 'hr',
        MANAGER: 'manager',
        EMPLOYEE: 'employee'
    },

    // Initialize user session
    async init() {
        console.log('Initializing AuthAPI with Supabase...');
        const session = await this.checkAuth();
        if (!session) {
            console.log('No valid session found');
            return { isAuthenticated: false };
        }
        console.log('Valid session found:', session.user.role);
        return session;
    },

    // Check if user is authenticated
    async checkAuth() {
        try {
            // First check Supabase session
            const { data: sessionData, success } = await SupabaseClient.auth.getSession();
            
            if (success && sessionData.session) {
                const { data: userData, success: userSuccess } = await SupabaseClient.auth.getUser();
                
                if (userSuccess && userData.user) {
                    // Get additional user data from the profiles table
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', userData.user.id)
                        .single();
                    
                    const role = profileData?.role || 'employee';
                    
                    // Store in localStorage for backward compatibility
                    const user = {
                        id: userData.user.id,
                        email: userData.user.email,
                        role: role,
                        ...profileData
                    };
                    
                    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
                    localStorage.setItem(this.TOKEN_KEY, sessionData.session.access_token);
                    
                    return {
                        isAuthenticated: true,
                        user,
                        token: sessionData.session.access_token
                    };
                }
            }
            
            // Fallback to localStorage check for backward compatibility
            const token = localStorage.getItem(this.TOKEN_KEY);
            const userStr = localStorage.getItem(this.USER_KEY);
            const user = userStr ? JSON.parse(userStr) : null;
            
            if (!token || !user || !user.role) {
                console.log('No valid auth data found');
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
    },    // Login user
    async login(credentials) {
        try {
            console.log('🔐 AuthAPI.login called with:', { ...credentials, password: '[HIDDEN]' });
            
            // Validate input
            if (!credentials || !credentials.email || !credentials.password) {
                console.log('❌ Missing credentials');
                return { success: false, message: 'Email and password are required' };
            }
            
            // First try Supabase authentication
            const { data, success, error } = await SupabaseClient.auth.signIn(credentials.email, credentials.password);
            
            if (success && data.session) {
                console.log('✅ Supabase login successful');
                
                // Get user profile data
                const { data: profileResult } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                    
                const profile = profileResult || {};
                
                const user = {
                    id: data.user.id,
                    email: data.user.email,
                    role: profile.role || this.ROLES.EMPLOYEE,
                    name: profile.full_name || data.user.email.split('@')[0],
                    username: data.user.email.split('@')[0]
                };
                
                console.log('💾 Saving auth data...');
                this.setAuth(data.session.access_token, user, credentials.remember);
                
                console.log('✅ Login successful, user authenticated');
                return { success: true, user };
            }
            
            // Fallback to demo credentials for testing during transition
            console.log('⚠️ Supabase login failed, falling back to demo credentials');
            const validCredentials = [
                { email: 'admin@nexstaff.com', password: 'admin123', role: this.ROLES.ADMIN, name: 'Admin User' },
                { email: 'hr@nexstaff.com', password: 'hr123', role: this.ROLES.HR, name: 'HR Manager' },
                { email: 'manager@nexstaff.com', password: 'manager123', role: this.ROLES.MANAGER, name: 'Team Manager' }
            ];
            
            const validUser = validCredentials.find(cred => {
                return cred.email === credentials.email && cred.password === credentials.password;
            });
            
            if (validUser) {
                console.log('✅ Valid demo user found:', validUser.name);
                
                const user = {
                    id: Math.random().toString(36).substr(2, 9),
                    email: validUser.email,
                    role: validUser.role,
                    name: validUser.name,
                    username: validUser.email.split('@')[0]
                };
                
                const token = 'demo_token_' + Date.now();
                
                console.log('💾 Saving auth data...');
                this.setAuth(token, user, credentials.remember);
                
                console.log('✅ Login successful, user authenticated');
                return { success: true, user };
            }
            
            console.log('❌ Invalid credentials provided');
            console.log('💡 Valid emails: admin@nexstaff.com, hr@nexstaff.com, manager@nexstaff.com');
            return { 
                success: false, 
                message: error?.message || 'Invalid email or password. Try: admin@nexstaff.com/admin123' 
            };
        } catch (error) {
            console.error('💥 Login error:', error);
            return { success: false, message: 'Login failed: ' + error.message };
        }
    },

    // Logout user
    async logout() {
        console.log('Logging out...');
        
        // Try to sign out from Supabase first
        await SupabaseClient.auth.signOut();
        
        // Then clear local storage
        this.clearAuth();
        this.redirectToLogin();
    },

    // Clear authentication data
    clearAuth() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.REMEMBER_KEY);
    },    // Set authentication data
    setAuth(token, user, remember = false) {
        try {
            console.log('💾 setAuth called with:', { token: token.substring(0, 20) + '...', user: user.name, remember });
            
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            
            if (remember) {
                localStorage.setItem(this.REMEMBER_KEY, 'true');
                console.log('✅ Remember me enabled');
            } else {
                localStorage.removeItem(this.REMEMBER_KEY);
            }
            
            // Verify data was saved
            const savedToken = localStorage.getItem(this.TOKEN_KEY);
            const savedUser = localStorage.getItem(this.USER_KEY);
            
            console.log('✅ Auth data saved successfully');
            console.log('🔍 Verification - Token saved:', !!savedToken);
            console.log('🔍 Verification - User saved:', !!savedUser);
            
        } catch (error) {
            console.error('💥 Error saving auth data:', error);
        }
    },

    // Check if token is expired (demo implementation)
    isTokenExpired(token) {
        return false; // For demo purposes, tokens never expire
    },

    // Redirect to login page
    redirectToLogin() {
        window.location.href = '../login.html';
    },

    // Check if user has required role
    hasRole(requiredRole) {
        const session = this.checkAuth();
        return session && session.user && session.user.role === requiredRole;
    },

    // Check if user has admin access
    isAdmin() {
        return this.hasRole(this.ROLES.ADMIN);
    },

    // Check if user has HR role
    isHR() {
        return this.hasRole(this.ROLES.HR);
    },

    // Check if user has manager role
    isManager() {
        return this.hasRole(this.ROLES.MANAGER);
    }
};

// Expose AuthAPI globally
window.AuthAPI = AuthAPI;
