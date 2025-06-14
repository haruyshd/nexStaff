// Job search and filter functionality
document.addEventListener('DOMContentLoaded', () => {
    const jobsGrid = document.querySelector('.jobs-grid');
    const searchInput = document.querySelector('#job-search');
    const locationSelect = document.querySelector('#location-filter');
    const typeSelect = document.querySelector('#type-filter');
    const categorySelect = document.querySelector('#category-filter');

    // Get jobs from centralized data manager
    let jobs = [];
    
    // Initialize data manager if not already loaded
    if (typeof nexStaffData !== 'undefined') {
        jobs = nexStaffData.getJobsForClient();
    } else {
        // Fallback to local data if data manager not available
        jobs = [
            {
                id: 'JOB001',
                title: 'Senior Software Engineer',
                company: 'NexTech Solutions',
                location: 'San Francisco, CA',
                type: 'Full-time',
                category: 'Technology',
                description: 'Looking for an experienced software engineer to join our growing team...',
                requirements: ['5+ years experience', 'Strong JavaScript skills', 'React/Vue.js experience'],
                salary: '$120,000 - $150,000'
            },
            {
                id: 'JOB002',
                title: 'UI/UX Designer',
                company: 'Creative Studios',
                location: 'New York, NY',
                type: 'Full-time',
                category: 'Design',
                description: 'Join our creative team as a UI/UX designer...',
                requirements: ['3+ years experience', 'Figma proficiency', 'Portfolio required'],
                salary: '$80,000 - $100,000'
            },
            {
                id: 'JOB003',
                title: 'Marketing Manager',
                company: 'Global Brands Inc',
                location: 'Austin, TX',
                type: 'Full-time',
                category: 'Marketing',
                description: 'Lead our marketing initiatives...',
                requirements: ['4+ years marketing experience', 'Digital marketing expertise', 'Team management'],
                salary: '$90,000 - $110,000'
            }
        ];
    }    // Render job cards
    function renderJobs(filteredJobs = jobs) {
        if (!jobsGrid) return;
        
        jobsGrid.innerHTML = filteredJobs.map(job => `
            <div class="job-card" data-job-id="${job.id}">
                <div class="job-header">
                    <h3>${job.title}</h3>
                    ${job.salary ? `<div class="salary">${job.salary}</div>` : ''}
                </div>
                <div class="company-info">
                    <ion-icon name="business-outline"></ion-icon>
                    <span class="company">${job.company}</span>
                </div>
                <div class="job-details">
                    <span><ion-icon name="location-outline"></ion-icon> ${job.location}</span>
                    <span><ion-icon name="time-outline"></ion-icon> ${job.type}</span>
                    <span><ion-icon name="briefcase-outline"></ion-icon> ${job.category}</span>
                </div>
                <p class="job-description">${job.description}</p>
                ${job.requirements ? `
                    <ul class="requirements">
                        ${job.requirements.slice(0, 3).map(req => `<li><ion-icon name="checkmark-outline"></ion-icon> ${req}</li>`).join('')}
                        ${job.requirements.length > 3 ? `<li class="more-requirements">+${job.requirements.length - 3} more requirements</li>` : ''}
                    </ul>
                ` : ''}
                ${job.benefits ? `
                    <div class="benefits">
                        <strong>Benefits:</strong>
                        <div class="benefits-list">
                            ${job.benefits.slice(0, 2).map(benefit => `<span class="benefit-tag">${benefit}</span>`).join('')}
                            ${job.benefits.length > 2 ? `<span class="benefit-tag more">+${job.benefits.length - 2} more</span>` : ''}
                        </div>
                    </div>
                ` : ''}
                <div class="job-actions">
                    <button class="apply-btn" onclick="openApplicationModal('${job.id}', '${job.title}', '${job.company}')">
                        <ion-icon name="paper-plane-outline"></ion-icon> Apply Now
                    </button>
                    <button class="save-btn" onclick="saveJob('${job.id}')" title="Save for later">
                        <ion-icon name="bookmark-outline"></ion-icon>
                    </button>
                </div>
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
    }    // Event listeners
    if (searchInput) searchInput.addEventListener('input', filterJobs);
    if (locationSelect) locationSelect.addEventListener('change', filterJobs);
    if (typeSelect) typeSelect.addEventListener('change', filterJobs);
    if (categorySelect) categorySelect.addEventListener('change', filterJobs);

    // Initialize job listings
    renderJobs();

    // Refresh jobs data periodically (simulate real-time updates)
    setInterval(() => {
        if (typeof nexStaffData !== 'undefined') {
            const updatedJobs = nexStaffData.getJobsForClient();
            if (JSON.stringify(updatedJobs) !== JSON.stringify(jobs)) {
                jobs = updatedJobs;
                filterJobs(); // Re-apply current filters
            }
        }
    }, 30000); // Check every 30 seconds
});

// Global functions for job interactions
function openApplicationModal(jobId, jobTitle, companyName) {
    // Store job information for application
    sessionStorage.setItem('applying_job_id', jobId);
    sessionStorage.setItem('applying_job_title', jobTitle);
    sessionStorage.setItem('applying_company_name', companyName);
    
    // Check if user is logged in (you can implement this based on your auth system)
    const isLoggedIn = localStorage.getItem('nexstaff_user_session');
    
    if (!isLoggedIn) {
        // Redirect to login/signup with return URL
        const returnUrl = encodeURIComponent(window.location.href + `#apply-${jobId}`);
        window.location.href = `../login/login.html?return=${returnUrl}&action=apply`;
        return;
    }
    
    // Open application modal or redirect to application page
    const modal = document.getElementById('application-modal') || document.getElementById('applicationModal');
    if (modal) {
        // Update modal content
        const jobTitleElement = modal.querySelector('#modal-job-title') || modal.querySelector('.modal-job-title');
        const companyElement = modal.querySelector('#modal-company-name') || modal.querySelector('.modal-company-name');
        
        if (jobTitleElement) jobTitleElement.textContent = jobTitle;
        if (companyElement) companyElement.textContent = companyName;
        
        // Show modal
        modal.style.display = 'block';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        // Fallback: redirect to application page
        window.location.href = `../apply.html?job=${jobId}`;
    }
}

function saveJob(jobId) {
    // Save job to user's saved jobs
    let savedJobs = JSON.parse(localStorage.getItem('nexstaff_saved_jobs') || '[]');
    
    if (!savedJobs.includes(jobId)) {
        savedJobs.push(jobId);
        localStorage.setItem('nexstaff_saved_jobs', JSON.stringify(savedJobs));
        
        // Show success message
        showNotification('Job saved successfully!', 'success');
        
        // Update button state
        const saveBtn = document.querySelector(`[onclick="saveJob('${jobId}')"]`);
        if (saveBtn) {
            saveBtn.innerHTML = '<ion-icon name="bookmark"></ion-icon>';
            saveBtn.classList.add('saved');
            saveBtn.title = 'Job saved';
        }
    } else {
        // Remove from saved jobs
        savedJobs = savedJobs.filter(id => id !== jobId);
        localStorage.setItem('nexstaff_saved_jobs', JSON.stringify(savedJobs));
        
        showNotification('Job removed from saved list', 'info');
        
        // Update button state
        const saveBtn = document.querySelector(`[onclick="saveJob('${jobId}')"]`);
        if (saveBtn) {
            saveBtn.innerHTML = '<ion-icon name="bookmark-outline"></ion-icon>';
            saveBtn.classList.remove('saved');
            saveBtn.title = 'Save for later';
        }
    }
}

function showNotification(message, type = 'info') {
    // Create and show notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
    
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