// Simulated database using localStorage
const STORAGE_KEY = 'nexstaff_employees';

// Default employees data
const defaultEmployees = [
    {
        id: 1,
        name: 'Jazz Lee',
        department: 'Admin',
            phone: '+1 404-233-7961',
            email: 'admin@nexstaff.com',
            hireDate: '2019-06-06',
            requests: 1
        },
        {
            id: 2,
            name: 'Yuji Lowe',
            department: 'Hardware',
            phone: '+1 404-233-7962',
            email: 'louis@nexstaff.com',
            hireDate: '2019-01-01'
        },
        {
            id: 3,
            name: 'Marc Cea',
            department: 'Software',
            phone: '+1 404-233-7963',
            email: 'calvin@nexstaff.com',
            hireDate: '2019-01-15'
        },
        {
            id: 4,
            name: 'Jericho DelosReyes',
            department: 'Marketing',
            phone: '+1 404-233-7964',
            email: 'mabel@nexstaff.com',
            hireDate: '2019-04-03',
            requests: 3
        }    ];

// Initialize the API immediately when the script loads
(function() {
    window.EmployeeAPI = {
        resetToDefault: function() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEmployees));
            return defaultEmployees;
        },

        // Create
        createEmployee(employee) {
            let employees = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultEmployees;
            const newId = Math.max(...employees.map(emp => emp.id), 0) + 1;
            const newEmployee = { ...employee, id: newId };
            employees.push(newEmployee);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
            return newEmployee;
        },

        // Read    
        getAllEmployees() {
            try {
                const employees = JSON.parse(localStorage.getItem(STORAGE_KEY));
                if (!employees || !Array.isArray(employees) || employees.length === 0) {
                    return this.resetToDefault();
                }
                return employees;
            } catch (error) {
                console.error('Error reading employees:', error);
                return this.resetToDefault();
            }
        },

        getEmployeeById(id) {
            const employees = this.getAllEmployees();
            return employees.find(emp => emp.id === id);
        },

        // Update    
        updateEmployee(id, updatedData) {
            const employees = this.getAllEmployees();
            const index = employees.findIndex(emp => emp.id === id);
            if (index !== -1) {
                employees[index] = { ...employees[index], ...updatedData };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
                return employees[index];
            }
            return null;
        },

        // Delete    
        deleteEmployee(id) {
            const employees = this.getAllEmployees();
            const filteredEmployees = employees.filter(emp => emp.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEmployees));
            return true;
        }
    };
})();
