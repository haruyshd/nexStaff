// Test and Initialize Supabase Integration
const SupabaseTestManager = {
    async testConnection() {
        console.log('🔍 Testing Supabase Connection...');
        
        try {
            // Check if Supabase client is available
            if (typeof supabase === 'undefined') {
                throw new Error('Supabase client not available');
            }

            // Test connection by fetching departments
            const { data, error } = await supabase
                .from('departments')
                .select('count')
                .limit(1);

            if (error) {
                throw error;
            }

            console.log('✅ Supabase connection successful');
            return true;
        } catch (error) {
            console.error('❌ Supabase connection failed:', error);
            return false;
        }
    },

    async initializeTestData() {
        console.log('🚀 Initializing test data...');
        
        try {
            // Initialize Employee Management API
            if (typeof EmployeeManagementAPI !== 'undefined') {
                await EmployeeManagementAPI.init();
                console.log('✅ Employee Management API initialized');
            }

            // Test creating a sample employee
            const sampleEmployee = {
                personalDetails: {
                    fullName: 'John Doe',
                    email: 'john.doe@nexstaff.com',
                    contactNumber: '+1234567890',
                    residentialAddress: '123 Main St, City, State'
                },
                jobDetails: {
                    jobTitle: 'Software Engineer',
                    department: 'IT',
                    employmentType: 'Full-time',
                    employmentStatus: 'Active'
                }
            };

            if (typeof EmployeeManagementAPI !== 'undefined') {
                const result = await EmployeeManagementAPI.createEmployee(sampleEmployee);
                if (result) {
                    console.log('✅ Sample employee created:', result);
                } else {
                    console.log('ℹ️ Sample employee creation skipped (may already exist)');
                }
            }

            // Test analytics
            if (typeof EmployeeManagementAPI !== 'undefined') {
                const analytics = await EmployeeManagementAPI.getAnalytics();
                console.log('📊 Current analytics:', analytics);
            }

            console.log('✅ Test data initialization complete');
            return true;
        } catch (error) {
            console.error('❌ Test data initialization failed:', error);
            return false;
        }
    },

    async runTests() {
        console.log('🧪 Running Supabase Integration Tests...');
        
        // Test 1: Connection
        const connectionTest = await this.testConnection();
        
        // Test 2: Initialize test data
        const initTest = await this.initializeTestData();
        
        // Test 3: Employee operations
        const employeeTest = await this.testEmployeeOperations();
        
        // Summary
        console.log('\n📋 Test Summary:');
        console.log(`Connection Test: ${connectionTest ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Initialization Test: ${initTest ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Employee Operations Test: ${employeeTest ? '✅ PASS' : '❌ FAIL'}`);
        
        const allTestsPassed = connectionTest && initTest && employeeTest;
        console.log(`\n🎯 Overall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
        
        return allTestsPassed;
    },

    async testEmployeeOperations() {
        console.log('👥 Testing Employee Operations...');
        
        try {
            if (typeof EmployeeManagementAPI === 'undefined') {
                throw new Error('EmployeeManagementAPI not available');
            }

            // Test 1: Get all employees
            const employees = await EmployeeManagementAPI.getEmployees();
            console.log(`📋 Found ${employees.length} employees`);

            // Test 2: Get departments
            const departments = await EmployeeManagementAPI.getDepartments();
            console.log(`🏢 Found ${departments.length} departments`);

            // Test 3: Get analytics
            const analytics = await EmployeeManagementAPI.getAnalytics();
            console.log('📊 Analytics retrieved:', analytics);

            console.log('✅ Employee operations test passed');
            return true;
        } catch (error) {
            console.error('❌ Employee operations test failed:', error);
            return false;
        }
    },

    displayStatus() {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'supabase-status';
        statusDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #fff;
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 12px;
            max-width: 300px;
        `;

        const supabaseAvailable = typeof supabase !== 'undefined';
        const adminClientAvailable = typeof AdminSupabaseClient !== 'undefined';
        const employeeAPIAvailable = typeof EmployeeManagementAPI !== 'undefined';

        statusDiv.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #333;">🔧 Supabase Integration Status</h4>
            <div style="margin: 5px 0;">
                <span style="color: ${supabaseAvailable ? 'green' : 'red'};">
                    ${supabaseAvailable ? '✅' : '❌'} Supabase Client
                </span>
            </div>
            <div style="margin: 5px 0;">
                <span style="color: ${adminClientAvailable ? 'green' : 'red'};">
                    ${adminClientAvailable ? '✅' : '❌'} Admin Supabase Client
                </span>
            </div>
            <div style="margin: 5px 0;">
                <span style="color: ${employeeAPIAvailable ? 'green' : 'red'};">
                    ${employeeAPIAvailable ? '✅' : '❌'} Employee Management API
                </span>
            </div>
            <button onclick="SupabaseTestManager.runTests()" style="
                margin-top: 10px;
                padding: 5px 10px;
                background: #007cba;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            ">Run Tests</button>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 10px;
                margin-left: 5px;
                padding: 5px 10px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            ">Close</button>
        `;

        document.body.appendChild(statusDiv);

        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (statusDiv.parentElement) {
                statusDiv.remove();
            }
        }, 30000);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show status in development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
            SupabaseTestManager.displayStatus();
        }, 2000);
    }
});

// Make it available globally
window.SupabaseTestManager = SupabaseTestManager;
