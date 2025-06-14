// Job search and filter functionality
document.addEventListener('DOMContentLoaded', () => {
    const jobsGrid = document.querySelector('.jobs-grid');
    const searchInput = document.querySelector('#job-search');
    const locationSelect = document.querySelector('#location-filter');
    const typeSelect = document.querySelector('#type-filter');
    const categorySelect = document.querySelector('#category-filter');

    // Mock job data - In production, this would come from an API
    const jobs = [
        {
            title: 'Senior Software Engineer',
            company: 'NexTech Solutions',
            location: 'Manila',
            type: 'Full-time',
            category: 'Technology',
            description: 'Looking for an experienced software engineer to join our growing team...',
            requirements: ['5+ years experience', 'Strong JavaScript skills', 'React/Vue.js experience']
        },
        {
            title: 'UI/UX Designer',
            company: 'Creative Studios',
            location: 'Cebu',
            type: 'Remote',
            category: 'Design',
            description: 'Join our creative team as a UI/UX designer...',
            requirements: ['3+ years experience', 'Figma proficiency', 'Portfolio required']
        },
        {
            title: 'Marketing Manager',
            company: 'Global Brands Inc',
            location: 'Makati',
            type: 'Full-time',
            category: 'Marketing',
            description: 'Lead our marketing initiatives...',
            requirements: ['4+ years marketing experience', 'Digital marketing expertise', 'Team management']
        }
    ];

    // Render job cards
    function renderJobs(filteredJobs = jobs) {
        jobsGrid.innerHTML = filteredJobs.map(job => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <div class="company-info">
                    <ion-icon name="business-outline"></ion-icon>
                    <span>${job.company}</span>
                </div>
                <div class="job-details">
                    <span><ion-icon name="location-outline"></ion-icon> ${job.location}</span>
                    <span><ion-icon name="time-outline"></ion-icon> ${job.type}</span>
                    <span><ion-icon name="briefcase-outline"></ion-icon> ${job.category}</span>
                </div>
                <p>${job.description}</p>
                <ul class="requirements">
                    ${job.requirements.map(req => `<li><ion-icon name="checkmark-outline"></ion-icon> ${req}</li>`).join('')}
                </ul>
                <button class="apply-btn" onclick="openApplicationModal('${job.title}')">
                    <ion-icon name="paper-plane-outline"></ion-icon> Apply Now
                </button>
            </div>
        `).join('');
    }

    // Filter jobs
    function filterJobs() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedLocation = locationSelect.value;
        const selectedType = typeSelect.value;
        const selectedCategory = categorySelect.value;

        const filteredJobs = jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchTerm) ||
                                job.company.toLowerCase().includes(searchTerm) ||
                                job.description.toLowerCase().includes(searchTerm);
            const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;
            const matchesType = selectedType === 'all' || job.type === selectedType;
            const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;

            return matchesSearch && matchesLocation && matchesType && matchesCategory;
        });

        renderJobs(filteredJobs);
    }

    // Event listeners
    searchInput.addEventListener('input', filterJobs);
    locationSelect.addEventListener('change', filterJobs);
    typeSelect.addEventListener('change', filterJobs);
    categorySelect.addEventListener('change', filterJobs);

    // Initialize job listings
    renderJobs();
});

// Application modal functionality
function openApplicationModal(jobTitle) {
    const modal = document.getElementById('application-modal');
    const jobTitleElement = document.getElementById('modal-job-title');
    
    jobTitleElement.textContent = jobTitle;
    modal.style.display = 'block';
}

function closeApplicationModal() {
    const modal = document.getElementById('application-modal');
    modal.style.display = 'none';
}

// Handle application form submission
document.getElementById('application-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const applicationData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        resume: formData.get('resume'),
        coverLetter: formData.get('cover-letter')
    };

    // In production, this would send the data to an API
    console.log('Application submitted:', applicationData);
    
    // Show success message
    alert('Application submitted successfully!');
    closeApplicationModal();
});