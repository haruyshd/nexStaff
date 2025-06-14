// Dashboard Analytics Module
const DashboardAnalytics = {
    init() {
        this.updateDashboardStats();
        this.initializeCharts();
        this.setupRefreshInterval();
    },

    async updateDashboardStats() {
        const analytics = EmployeeManagementAPI.getAnalytics();
        this.updateEmployeeStats(analytics);
        this.updateDepartmentChart(analytics.departmentDistribution);
        this.updateAttendanceChart(analytics.attendanceSummary);
        this.updatePerformanceChart(analytics.performanceOverview);
        this.updateTurnoverChart(analytics.turnoverRate);
    },

    updateEmployeeStats(analytics) {
        document.getElementById('totalEmployees').textContent = analytics.totalEmployees;
        document.getElementById('activeEmployees').textContent = 
            analytics.totalEmployees - Object.values(analytics.leaveMetrics).reduce((a, b) => a + b, 0);
        document.getElementById('onLeave').textContent = analytics.leaveMetrics['On Leave'] || 0;
        document.getElementById('turnoverRate').textContent = `${analytics.turnoverRate.toFixed(1)}%`;
    },

    initializeCharts() {
        // Department Distribution Chart
        this.departmentChart = new Chart(
            document.getElementById('departmentChart').getContext('2d'),
            {
                type: 'pie',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981',
                            '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            }
        );

        // Attendance Trend Chart
        this.attendanceChart = new Chart(
            document.getElementById('attendanceChart').getContext('2d'),
            {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Daily Attendance',
                        data: [],
                        borderColor: '#4F46E5',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );

        // Performance Overview Chart
        this.performanceChart = new Chart(
            document.getElementById('performanceChart').getContext('2d'),
            {
                type: 'bar',
                data: {
                    labels: ['Outstanding', 'Good', 'Satisfactory', 'Needs Improvement'],
                    datasets: [{
                        data: [],
                        backgroundColor: ['#10B981', '#6366F1', '#F59E0B', '#EF4444']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );

        // Turnover Rate Trend Chart
        this.turnoverChart = new Chart(
            document.getElementById('turnoverChart').getContext('2d'),
            {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Turnover Rate',
                        data: [],
                        borderColor: '#EF4444',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: value => value + '%'
                            }
                        }
                    }
                }
            }
        );
    },

    updateDepartmentChart(distribution) {
        this.departmentChart.data.labels = Object.keys(distribution);
        this.departmentChart.data.datasets[0].data = Object.values(distribution);
        this.departmentChart.update();
    },

    updateAttendanceChart(summary) {
        const dates = [...new Set(summary.map(s => s.date))].sort();
        const attendance = dates.map(date => 
            summary.filter(s => s.date === date).length
        );

        this.attendanceChart.data.labels = dates;
        this.attendanceChart.data.datasets[0].data = attendance;
        this.attendanceChart.update();
    },

    updatePerformanceChart(overview) {
        this.performanceChart.data.datasets[0].data = [
            overview.Outstanding || 0,
            overview.Good || 0,
            overview.Satisfactory || 0,
            overview['Needs Improvement'] || 0
        ];
        this.performanceChart.update();
    },

    updateTurnoverChart(rate) {
        // Keep last 12 months of data
        if (this.turnoverChart.data.labels.length >= 12) {
            this.turnoverChart.data.labels.shift();
            this.turnoverChart.data.datasets[0].data.shift();
        }

        const date = new Date().toLocaleDateString('en-US', { month: 'short' });
        this.turnoverChart.data.labels.push(date);
        this.turnoverChart.data.datasets[0].data.push(rate);
        this.turnoverChart.update();
    },

    setupRefreshInterval() {
        // Update dashboard every 5 minutes
        setInterval(() => this.updateDashboardStats(), 5 * 60 * 1000);
    }
};
