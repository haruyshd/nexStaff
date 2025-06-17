// Supabase client for NexStaff
const SUPABASE_URL = 'https://ihgjxasndhuuydyqsdvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZ2p4YXNuZGh1dXlkeXFzZHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODk4MDIsImV4cCI6MjA2NTQ2NTgwMn0.Mvm40VEUbCZeEmyxnA6b6426Wh_CCDYFYkzyIP5tIT4';

// Initialize Supabase client
let supabase;
if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully');
} else {
    console.warn('Supabase client library not loaded yet. Make sure to include the Supabase JS library before this script.');
}

// Helper function to handle errors
function handleError(error, customMessage = 'An error occurred') {
    console.error(`${customMessage}:`, error);
    return { error: error.message || customMessage, success: false };
}

// Expose a clean API for the application
const SupabaseClient = {
    // Auth methods
    auth: {
        // Sign up a new user
        signUp: async (email, password, userData = {}) => {
            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: userData
                    }
                });

                if (error) throw error;
                return { data, success: true };
            } catch (error) {
                return handleError(error, 'Signup failed');
            }
        },

        // Sign in a user
        signIn: async (email, password) => {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;
                return { data, success: true };
            } catch (error) {
                return handleError(error, 'Login failed');
            }
        },

        // Sign out the current user
        signOut: async () => {
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                return { success: true };
            } catch (error) {
                return handleError(error, 'Logout failed');
            }
        },

        // Get the current session
        getSession: async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;
                return { data, success: true };
            } catch (error) {
                return handleError(error, 'Failed to get session');
            }
        },

        // Get the current user
        getUser: async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;
                return { user, success: true };
            } catch (error) {
                return handleError(error, 'Failed to get user');
            }
        },

        // Reset password
        resetPassword: async (email) => {
            try {
                const { data, error } = await supabase.auth.resetPasswordForEmail(email);
                if (error) throw error;
                return { data, success: true };
            } catch (error) {
                return handleError(error, 'Failed to reset password');
            }
        },

        // Update user data
        updateUser: async (userData) => {
            try {
                const { data, error } = await supabase.auth.updateUser(userData);
                if (error) throw error;
                return { data, success: true };
            } catch (error) {
                return handleError(error, 'Failed to update user');
            }
        }
    },

    // Database methods
    db: {
        // Jobs
        jobs: {
            getAll: async () => {
                try {
                    const { data, error } = await supabase
                        .from('jobs')
                        .select('*');
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, 'Failed to fetch jobs');
                }
            },
            
            getById: async (id) => {
                try {
                    const { data, error } = await supabase
                        .from('jobs')
                        .select('*')
                        .eq('id', id)
                        .single();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, `Failed to fetch job with id ${id}`);
                }
            },
            
            create: async (jobData) => {
                try {
                    const { data, error } = await supabase
                        .from('jobs')
                        .insert([jobData])
                        .select();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, 'Failed to create job');
                }
            },
            
            update: async (id, jobData) => {
                try {
                    const { data, error } = await supabase
                        .from('jobs')
                        .update(jobData)
                        .eq('id', id)
                        .select();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, `Failed to update job with id ${id}`);
                }
            },
            
            delete: async (id) => {
                try {
                    const { error } = await supabase
                        .from('jobs')
                        .delete()
                        .eq('id', id);
                    
                    if (error) throw error;
                    return { success: true };
                } catch (error) {
                    return handleError(error, `Failed to delete job with id ${id}`);
                }
            }
        },
        
        // Candidates
        candidates: {
            getAll: async () => {
                try {
                    const { data, error } = await supabase
                        .from('candidates')
                        .select('*');
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, 'Failed to fetch candidates');
                }
            },
            
            getById: async (id) => {
                try {
                    const { data, error } = await supabase
                        .from('candidates')
                        .select('*')
                        .eq('id', id)
                        .single();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, `Failed to fetch candidate with id ${id}`);
                }
            },
            
            create: async (candidateData) => {
                try {
                    const { data, error } = await supabase
                        .from('candidates')
                        .insert([candidateData])
                        .select();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, 'Failed to create candidate');
                }
            },
            
            update: async (id, candidateData) => {
                try {
                    const { data, error } = await supabase
                        .from('candidates')
                        .update(candidateData)
                        .eq('id', id)
                        .select();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, `Failed to update candidate with id ${id}`);
                }
            },
            
            delete: async (id) => {
                try {
                    const { error } = await supabase
                        .from('candidates')
                        .delete()
                        .eq('id', id);
                    
                    if (error) throw error;
                    return { success: true };
                } catch (error) {
                    return handleError(error, `Failed to delete candidate with id ${id}`);
                }
            }
        },
        
        // Employers
        employers: {
            getAll: async () => {
                try {
                    const { data, error } = await supabase
                        .from('employers')
                        .select('*');
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, 'Failed to fetch employers');
                }
            },
            
            getById: async (id) => {
                try {
                    const { data, error } = await supabase
                        .from('employers')
                        .select('*')
                        .eq('id', id)
                        .single();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, `Failed to fetch employer with id ${id}`);
                }
            },
            
            create: async (employerData) => {
                try {
                    const { data, error } = await supabase
                        .from('employers')
                        .insert([employerData])
                        .select();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, 'Failed to create employer');
                }
            },
            
            update: async (id, employerData) => {
                try {
                    const { data, error } = await supabase
                        .from('employers')
                        .update(employerData)
                        .eq('id', id)
                        .select();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, `Failed to update employer with id ${id}`);
                }
            },
            
            delete: async (id) => {
                try {
                    const { error } = await supabase
                        .from('employers')
                        .delete()
                        .eq('id', id);
                    
                    if (error) throw error;
                    return { success: true };
                } catch (error) {
                    return handleError(error, `Failed to delete employer with id ${id}`);
                }
            }
        },
        
        // Applications
        applications: {
            getAll: async () => {
                try {
                    const { data, error } = await supabase
                        .from('applications')
                        .select('*, jobs(*), candidates(*)');
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, 'Failed to fetch applications');
                }
            },
            
            getById: async (id) => {
                try {
                    const { data, error } = await supabase
                        .from('applications')
                        .select('*, jobs(*), candidates(*)')
                        .eq('id', id)
                        .single();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, `Failed to fetch application with id ${id}`);
                }
            },
            
            getByJobId: async (jobId) => {
                try {
                    const { data, error } = await supabase
                        .from('applications')
                        .select('*, candidates(*)')
                        .eq('job_id', jobId);
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, `Failed to fetch applications for job ${jobId}`);
                }
            },
            
            getByCandidateId: async (candidateId) => {
                try {
                    const { data, error } = await supabase
                        .from('applications')
                        .select('*, jobs(*)')
                        .eq('candidate_id', candidateId);
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, `Failed to fetch applications for candidate ${candidateId}`);
                }
            },
            
            create: async (applicationData) => {
                try {
                    const { data, error } = await supabase
                        .from('applications')
                        .insert([applicationData])
                        .select();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, 'Failed to create application');
                }
            },
            
            update: async (id, applicationData) => {
                try {
                    const { data, error } = await supabase
                        .from('applications')
                        .update(applicationData)
                        .eq('id', id)
                        .select();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, `Failed to update application with id ${id}`);
                }
            },
            
            delete: async (id) => {
                try {
                    const { error } = await supabase
                        .from('applications')
                        .delete()
                        .eq('id', id);
                    
                    if (error) throw error;
                    return { success: true };
                } catch (error) {
                    return handleError(error, `Failed to delete application with id ${id}`);
                }
            }
        },
        
        // Employees
        employees: {
            getAll: async () => {
                try {
                    const { data, error } = await supabase
                        .from('employees')
                        .select('*');
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, 'Failed to fetch employees');
                }
            },
            
            getById: async (id) => {
                try {
                    const { data, error } = await supabase
                        .from('employees')
                        .select('*')
                        .eq('id', id)
                        .single();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, `Failed to fetch employee with id ${id}`);
                }
            },
            
            create: async (employeeData) => {
                try {
                    const { data, error } = await supabase
                        .from('employees')
                        .insert([employeeData])
                        .select();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, 'Failed to create employee');
                }
            },
            
            update: async (id, employeeData) => {
                try {
                    const { data, error } = await supabase
                        .from('employees')
                        .update(employeeData)
                        .eq('id', id)
                        .select();
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, `Failed to update employee with id ${id}`);
                }
            },
            
            delete: async (id) => {
                try {
                    const { error } = await supabase
                        .from('employees')
                        .delete()
                        .eq('id', id);
                    
                    if (error) throw error;
                    return { success: true };
                } catch (error) {
                    return handleError(error, `Failed to delete employee with id ${id}`);
                }
            }
        },
        
        // Storage methods
        storage: {
            uploadFile: async (bucket, path, file) => {
                try {
                    const { data, error } = await supabase
                        .storage
                        .from(bucket)
                        .upload(path, file);
                    
                    if (error) throw error;
                    return { data, success: true };
                } catch (error) {
                    return handleError(error, 'Failed to upload file');
                }
            },
            
            getPublicUrl: (bucket, path) => {
                const { data } = supabase
                    .storage
                    .from(bucket)
                    .getPublicUrl(path);
                
                return data.publicUrl;
            },
            
            deleteFile: async (bucket, path) => {
                try {
                    const { error } = await supabase
                        .storage
                        .from(bucket)
                        .remove([path]);
                    
                    if (error) throw error;
                    return { success: true };
                } catch (error) {
                    return handleError(error, 'Failed to delete file');
                }
            }
        }
    }
};
