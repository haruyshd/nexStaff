// Schedule Management
const ScheduleAPI = {
    init() {
        this.loadSchedule();
        this.initializeCalendar();
    },

    loadSchedule() {
        // Sample data - replace with actual API call
        const events = [
            {
                id: 1,
                type: "Interview",
                title: "Interview with John Doe for Senior Developer Position",
                date: "2025-06-15",
                time: "10:00 AM",
                candidate: "John Doe",
                employer: "Tech Solutions Inc.",
                position: "Senior Software Engineer",
                status: "Scheduled"
            },
            {
                id: 2,
                type: "Follow-up",
                title: "Follow-up Meeting with Creative Designs Co.",
                date: "2025-06-16",
                time: "2:00 PM",
                employer: "Creative Designs Co.",
                status: "Confirmed"
            }
        ];

        this.renderSchedule(events);
    },

    initializeCalendar() {
        // Initialize calendar view - implement with a calendar library
        const calendar = document.getElementById('scheduleCalendar');
        if (!calendar) return;

        // Placeholder for calendar implementation
        calendar.innerHTML = `
            <div class="calendar-placeholder">
                <p>Calendar view will be implemented here</p>
                <p>Consider using libraries like FullCalendar or React Big Calendar</p>
            </div>
        `;
    },

    renderSchedule(events) {
        const container = document.getElementById('scheduleList');
        if (!container) return;

        container.innerHTML = events.map(event => `
            <div class="schedule-card ${event.type.toLowerCase()}">
                <div class="schedule-header">
                    <span class="event-type">${event.type}</span>
                    <span class="status ${event.status.toLowerCase()}">${event.status}</span>
                </div>
                <div class="schedule-content">
                    <h3>${event.title}</h3>
                    <div class="schedule-details">
                        <p><i class="material-icons">event</i> ${event.date}</p>
                        <p><i class="material-icons">schedule</i> ${event.time}</p>
                        ${event.candidate ? `<p><i class="material-icons">person</i> Candidate: ${event.candidate}</p>` : ''}
                        <p><i class="material-icons">business</i> ${event.employer}</p>
                        ${event.position ? `<p><i class="material-icons">work</i> Position: ${event.position}</p>` : ''}
                    </div>
                </div>
                <div class="schedule-actions">
                    <button class="btn btn-primary" onclick="ScheduleAPI.viewEvent(${event.id})">
                        <i class="material-icons">visibility</i> View Details
                    </button>
                    <button class="btn btn-secondary" onclick="ScheduleAPI.editEvent(${event.id})">
                        <i class="material-icons">edit</i> Edit
                    </button>
                </div>
            </div>
        `).join('');
    },

    viewEvent(id) {
        alert('View event details: ' + id); // Replace with actual implementation
    },

    editEvent(id) {
        alert('Edit event: ' + id); // Replace with actual implementation
    }
};
