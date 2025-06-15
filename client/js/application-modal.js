// Application Modal Functions and Event Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Initialize file upload handling
    initializeFileUpload();
    
    // Initialize character counter
    initializeCharacterCounter();
    
    // Initialize form submission
    initializeFormSubmission();
});

function openApplicationModal(jobId, jobTitle, companyName) {
    const modal = document.getElementById('applicationModal');
    const form = document.getElementById('applicationForm');
    
    // Set job information
    document.getElementById('jobId').value = jobId || '';
    document.getElementById('jobTitle').value = jobTitle || '';
    document.getElementById('companyName').value = companyName || '';
    document.getElementById('modal-job-title').textContent = jobTitle || 'Job Application';
    document.getElementById('modal-company-name').textContent = companyName || '';
    
    // Reset form
    form.reset();
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'none';
    
    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

function closeApplicationModal() {
    const modal = document.getElementById('applicationModal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

function initializeFileUpload() {
    const resumeInput = document.getElementById('resume');
    const fileInfo = document.getElementById('fileInfo');
    const uploadArea = document.getElementById('resumeUploadArea');
    
    if (!resumeInput || !fileInfo || !uploadArea) return;
    
    // File input change
    resumeInput.addEventListener('change', function(e) {
        handleFileSelect(e.target.files[0]);
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#8B5CF6';
        uploadArea.style.background = '#f3e8ff';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#d1d5db';
        uploadArea.style.background = '#f8fafc';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#d1d5db';
        uploadArea.style.background = '#f8fafc';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    function handleFileSelect(file) {
        if (!file) return;
        
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PDF, DOC, or DOCX file.');
            return;
        }
        
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB.');
            return;
        }
        
        // Show file info
        fileInfo.style.display = 'flex';
        fileInfo.querySelector('.file-name').textContent = file.name;
        fileInfo.querySelector('.file-size').textContent = formatFileSize(file.size);
        
        // Set file to input
        const dt = new DataTransfer();
        dt.items.add(file);
        resumeInput.files = dt.files;
    }
}

function initializeCharacterCounter() {
    const coverLetter = document.getElementById('coverLetter');
    const charCount = document.querySelector('.char-count');
    
    if (!coverLetter || !charCount) return;
    
    coverLetter.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/500 characters`;
        
        if (length > 500) {
            charCount.style.color = '#dc2626';
        } else {
            charCount.style.color = '#6b7280';
        }
    });
}

function initializeFormSubmission() {
    const form = document.getElementById('applicationForm');
    if (!form) return;
    
    form.addEventListener('submit', handleApplicationSubmit);
}

async function handleApplicationSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('submitApplication');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> Submitting...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(form);
        
        // Get job information
        const jobId = formData.get('jobId');
        const jobTitle = formData.get('jobTitle');
        const companyName = formData.get('companyName');
        
        const applicationData = {
            jobId: jobId,
            jobTitle: jobTitle,
            companyName: companyName,
            candidateName: formData.get('fullName'),
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            coverLetter: formData.get('coverLetter'),
            expectedSalary: formData.get('expectedSalary'),
            availability: formData.get('availability'),
            portfolioLinks: [formData.get('portfolio')].filter(Boolean),
            referenceContact: formData.get('reference')
        };
        
        // Handle resume file
        const resumeFile = formData.get('resume');
        if (resumeFile && resumeFile.size > 0) {
            const base64Resume = await fileToBase64(resumeFile);
            applicationData.resumeUrl = base64Resume;
            applicationData.resumeName = resumeFile.name;
        }
        
        // Submit application
        let success = false;
        if (typeof nexStaffData !== 'undefined') {
            const application = nexStaffData.submitJobApplication(applicationData);
            success = !!application;
            console.log('Application submitted through data manager:', application);
        } else {
            // Fallback to localStorage
            const applications = JSON.parse(localStorage.getItem('nexstaff_applications') || '[]');
            const newApplication = {
                ...applicationData,
                id: `APP${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                status: 'New',
                submittedAt: new Date().toISOString(),
                source: 'landing_page'
            };
            applications.push(newApplication);
            localStorage.setItem('nexstaff_applications', JSON.stringify(applications));
            success = true;
            console.log('Application submitted to localStorage:', newApplication);
        }
        
        if (success) {
            // Show success message
            document.getElementById('successMessage').style.display = 'flex';
            
            // Dispatch event for real-time updates
            document.dispatchEvent(new CustomEvent('applicationSubmitted', {
                detail: applicationData
            }));
            
            console.log('Application submission successful');
        } else {
            throw new Error('Failed to submit application');
        }
        
    } catch (error) {
        console.error('Error submitting application:', error);
        showNotification('There was an error submitting your application. Please try again.', 'error');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function removeFile() {
    const resumeInput = document.getElementById('resume');
    const fileInfo = document.getElementById('fileInfo');
    
    if (resumeInput) resumeInput.value = '';
    if (fileInfo) fileInfo.style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-size: 14px;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('applicationModal');
    if (event.target === modal) {
        closeApplicationModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('applicationModal');
        if (modal && modal.classList.contains('active')) {
            closeApplicationModal();
        }
    }
});

// Make functions globally available
window.openApplicationModal = openApplicationModal;
window.closeApplicationModal = closeApplicationModal;
window.removeFile = removeFile;
