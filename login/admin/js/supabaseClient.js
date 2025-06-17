// Supabase client for NexStaff Admin
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

// Admin-specific Supabase API wrapper
const AdminSupabaseClient = {
    // Employee Management
    employees: {
        // Get all employees
        getAll: async (filters = {}) => {
            try {
                let query = supabase
                    .from('employees')
                    .select(`
                        *,
                        departments (
                            id,
                            name,
                            code
                        ),
                        positions (
                            id,
                            name,
                            level
                        )
                    `);

                // Apply filters
                if (filters.departmentId) {
                    query = query.eq('department_id', filters.departmentId);
                }
                if (filters.status) {
                    query = query.eq('employment_status', filters.status);
                }
                if (filters.search) {
                    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
                }

                const { data, error } = await query;
                if (error) throw error;
                return { data, success: true };
            } catch (error) {
                return handleError(error, 'Failed to fetch employees');
            }
        },

        // Get employee by ID
        getById: async (id) => {
            try {
                const { data, error } = await supabase
                    .from('employees')
                    .select(`
                        *,
                        departments (
                            id,
                            name,
                            code
                        ),
                        positions (
                            id,
                            name,
                            level
                        )
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return { data, success: true };
            } catch (error) {
                return handleError(error, 'Failed to fetch employee');
            }
        },

        // Create new employee
        create: async (employeeData) => {
            try {
                // Prepare data for Supabase
                const supabaseData = {
                    full_name: employeeData.personalDetails?.fullName || employeeData.fullName,
                    role: employeeData.jobDetails?.jobTitle || employeeData.role,
                    email: employeeData.personalDetails?.email || employeeData.email,
                    phone: employeeData.personalDetails?.contactNumber || employeeData.phone,
                    photo: employeeData.personalDetails?.profilePicture || employeeData.photo,
                    join_date: employeeData.jobDetails?.joiningDate || new Date().toISOString().split('T')[0],
                    department_id: employeeData.jobDetails?.department || employeeData.departmentId,
                    position_id: employeeData.jobDetails?.jobTitle || employeeData.positionId,
                    manager_id: employeeData.jobDetails?.reportingManager || null,
                    employment_status: employeeData.jobDetails?.employmentStatus || 'Active',
                    address: employeeData.personalDetails?.residentialAddress || employeeData.address,
                    emergency_contact: JSON.stringify(employeeData.personalDetails?.emergencyContacts || {}),
                    documents: JSON.stringify(employeeData.documents || {}),
                    job_details: JSON.stringify(employeeData.jobDetails || {}),
                    salary_info: JSON.stringify(employeeData.salary || {}),
                    attendance: JSON.stringify(employeeData.attendance || {}),
                    performance: JSON.stringify(employeeData.performance || {})
                };

                const { data, error } = await supabase
                    .from('employees')
                    .insert([supabaseData])
                    .select();

                if (error) throw error;
                return { data: data[0], success: true };
            } catch (error) {
                return handleError(error, 'Failed to create employee');
            }
        },

        // Update employee
        update: async (id, employeeData) => {
            try {
                // Prepare data for Supabase
                const supabaseData = {
                    full_name: employeeData.personalDetails?.fullName || employeeData.fullName,
                    role: employeeData.jobDetails?.jobTitle || employeeData.role,
                    email: employeeData.personalDetails?.email || employeeData.email,
                    phone: employeeData.personalDetails?.contactNumber || employeeData.phone,
                    photo: employeeData.personalDetails?.profilePicture || employeeData.photo,
                    department_id: employeeData.jobDetails?.department || employeeData.departmentId,
                    position_id: employeeData.jobDetails?.jobTitle || employeeData.positionId,
                    manager_id: employeeData.jobDetails?.reportingManager || null,
                    employment_status: employeeData.jobDetails?.employmentStatus || employeeData.status,
                    address: employeeData.personalDetails?.residentialAddress || employeeData.address,
                    emergency_contact: JSON.stringify(employeeData.personalDetails?.emergencyContacts || {}),
                    documents: JSON.stringify(employeeData.documents || {}),
                    job_details: JSON.stringify(employeeData.jobDetails || {}),
                    salary_info: JSON.stringify(employeeData.salary || {}),
                    attendance: JSON.stringify(employeeData.attendance || {}),
                    performance: JSON.stringify(employeeData.performance || {}),
                    updated_at: new Date().toISOString()
                };

                const { data, error } = await supabase
                    .from('employees')
                    .update(supabaseData)
                    .eq('id', id)
                    .select();

                if (error) throw error;
                return { data: data[0], success: true };
            } catch (error) {
                return handleError(error, 'Failed to update employee');
            }
        },

        // Delete employee
        delete: async (id) => {
            try {
                const { error } = await supabase
                    .from('employees')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return { success: true };
            } catch (error) {
                return handleError(error, 'Failed to delete employee');
            }
        }
    },

    // Attendance Management
    attendance: {
        // Record attendance
        record: async (employeeId, attendanceData) => {
            try {
                // First, check if employee exists
                const { data: employee, error: empError } = await supabase
                    .from('employees')
                    .select('attendance')
                    .eq('id', employeeId)
                    .single();

                if (empError) throw empError;

                // Parse existing attendance or initialize
                const existingAttendance = typeof employee.attendance === 'string' 
                    ? JSON.parse(employee.attendance) 
                    : employee.attendance || { records: [] };

                // Add new attendance record
                const newRecord = {
                    id: Date.now(),
                    date: new Date().toISOString().split('T')[0],
                    checkIn: attendanceData.checkIn,
                    checkOut: attendanceData.checkOut,
                    status: attendanceData.status || 'present',
                    overtime: attendanceData.overtime || 0,
                    timestamp: new Date().toISOString()
                };

                existingAttendance.records = existingAttendance.records || [];
                existingAttendance.records.push(newRecord);

                // Update employee record
                const { data, error } = await supabase
                    .from('employees')
                    .update({ attendance: JSON.stringify(existingAttendance) })
                    .eq('id', employeeId)
                    .select();

                if (error) throw error;
                return { data: newRecord, success: true };
            } catch (error) {
                return handleError(error, 'Failed to record attendance');
            }
        },

        // Get attendance records
        get: async (employeeId, startDate, endDate) => {
            try {
                const { data: employee, error } = await supabase
                    .from('employees')
                    .select('attendance')
                    .eq('id', employeeId)
                    .single();

                if (error) throw error;

                const attendance = typeof employee.attendance === 'string' 
                    ? JSON.parse(employee.attendance) 
                    : employee.attendance || { records: [] };

                let records = attendance.records || [];

                // Filter by date range if provided
                if (startDate || endDate) {
                    records = records.filter(record => {
                        const recordDate = new Date(record.date);
                        return (!startDate || recordDate >= new Date(startDate)) &&
                               (!endDate || recordDate <= new Date(endDate));
                    });
                }

                return { data: records, success: true };
            } catch (error) {
                return handleError(error, 'Failed to fetch attendance');
            }
        }
    },

    // Performance Management
    performance: {
        // Add performance review
        addReview: async (employeeId, reviewData) => {
            try {
                const { data: employee, error: empError } = await supabase
                    .from('employees')
                    .select('performance')
                    .eq('id', employeeId)
                    .single();

                if (empError) throw empError;

                const existingPerformance = typeof employee.performance === 'string' 
                    ? JSON.parse(employee.performance) 
                    : employee.performance || { reviews: [] };

                const newReview = {
                    id: Date.now(),
                    ...reviewData,
                    createdAt: new Date().toISOString()
                };

                existingPerformance.reviews = existingPerformance.reviews || [];
                existingPerformance.reviews.push(newReview);

                const { data, error } = await supabase
                    .from('employees')
                    .update({ performance: JSON.stringify(existingPerformance) })
                    .eq('id', employeeId)
                    .select();

                if (error) throw error;
                return { data: newReview, success: true };
            } catch (error) {
                return handleError(error, 'Failed to add performance review');
            }
        },

        // Get performance reviews
        getReviews: async (employeeId) => {
            try {
                const { data: employee, error } = await supabase
                    .from('employees')
                    .select('performance')
                    .eq('id', employeeId)
                    .single();

                if (error) throw error;

                const performance = typeof employee.performance === 'string' 
                    ? JSON.parse(employee.performance) 
                    : employee.performance || { reviews: [] };

                return { data: performance.reviews || [], success: true };
            } catch (error) {
                return handleError(error, 'Failed to fetch performance reviews');
            }
        }
    },

    // Document Management
    documents: {
        // Upload document (metadata)
        upload: async (employeeId, documentData) => {
            try {
                const { data: employee, error: empError } = await supabase
                    .from('employees')
                    .select('documents')
                    .eq('id', employeeId)
                    .single();

                if (empError) throw empError;

                const existingDocuments = typeof employee.documents === 'string' 
                    ? JSON.parse(employee.documents) 
                    : employee.documents || {};

                const newDocument = {
                    id: Date.now(),
                    ...documentData,
                    uploadedAt: new Date().toISOString()
                };

                // Organize documents by type
                const docType = documentData.type || 'general';
                existingDocuments[docType] = existingDocuments[docType] || [];
                existingDocuments[docType].push(newDocument);

                const { data, error } = await supabase
                    .from('employees')
                    .update({ documents: JSON.stringify(existingDocuments) })
                    .eq('id', employeeId)
                    .select();

                if (error) throw error;
                return { data: newDocument, success: true };
            } catch (error) {
                return handleError(error, 'Failed to upload document');
            }
        },

        // Get documents
        get: async (employeeId) => {
            try {
                const { data: employee, error } = await supabase
                    .from('employees')
                    .select('documents')
                    .eq('id', employeeId)
                    .single();

                if (error) throw error;

                const documents = typeof employee.documents === 'string' 
                    ? JSON.parse(employee.documents) 
                    : employee.documents || {};

                return { data: documents, success: true };
            } catch (error) {
                return handleError(error, 'Failed to fetch documents');
            }
        }
    },

    // Departments and Positions
    departments: {
        getAll: async () => {
            try {
                const { data, error } = await supabase
                    .from('departments')
                    .select('*')
                    .eq('is_active', true);

                if (error) throw error;
                return { data, success: true };
            } catch (error) {
                return handleError(error, 'Failed to fetch departments');
            }
        }
    },

    positions: {
        getAll: async (departmentId = null) => {
            try {
                let query = supabase
                    .from('positions')
                    .select('*')
                    .eq('is_active', true);

                if (departmentId) {
                    query = query.eq('department_id', departmentId);
                }

                const { data, error } = await query;
                if (error) throw error;
                return { data, success: true };
            } catch (error) {
                return handleError(error, 'Failed to fetch positions');
            }
        }
    },

    // Analytics
    analytics: {
        getEmployeeStats: async () => {
            try {
                const { data: employees, error: empError } = await supabase
                    .from('employees')
                    .select('employment_status, department_id, departments(name)');

                if (empError) throw empError;

                const { data: departments, error: deptError } = await supabase
                    .from('departments')
                    .select('*');

                if (deptError) throw deptError;

                const stats = {
                    totalEmployees: employees.length,
                    byDepartment: departments.map(dept => ({
                        department: dept.name,
                        count: employees.filter(emp => emp.department_id === dept.id).length
                    })),
                    byStatus: {
                        Active: employees.filter(emp => emp.employment_status === 'Active').length,
                        'On Leave': employees.filter(emp => emp.employment_status === 'On Leave').length,
                        Terminated: employees.filter(emp => emp.employment_status === 'Terminated').length,
                        Resigned: employees.filter(emp => emp.employment_status === 'Resigned').length
                    }
                };

                return { data: stats, success: true };
            } catch (error) {
                return handleError(error, 'Failed to fetch analytics');
            }
        }
    }
};

// Make it available globally
window.AdminSupabaseClient = AdminSupabaseClient;
