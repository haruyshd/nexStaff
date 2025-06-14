# NexStaff Project - Quick Start Guide

## 🚀 How to Run the Project

### Using Live Server (Simple!)
1. **Right-click** on `index.html` in the root directory
2. **Select** "Open with Live Server"
3. The project will open at `http://localhost:5500`

## 📁 Project Structure (FIXED!)
```
nexStaff-main/                    ← Root directory (clean structure!)
├── index.html                    ← Main application entry point
├── .vscode/settings.json         ← Live Server configuration
├── client/                       ← Frontend assets
│   ├── css/                      ← Stylesheets
│   ├── js/                       ← JavaScript files
│   ├── img/                      ← Images and icons
│   └── templates/                ← HTML templates
├── auth/                         ← Authentication pages
│   ├── login.html
│   └── signup.html
├── login/                        ← Admin dashboard
│   ├── dashboard.html
│   ├── admin/                    ← Admin-specific pages
│   ├── css/                      ← Admin styles
│   ├── js/                       ← Admin JavaScript
│   └── img/                      ← Admin images
├── pages/                        ← Public pages
│   ├── about.html
│   ├── candidates.html
│   ├── employers.html
│   └── jobs.html
└── docs/                         ← Documentation files
    ├── ADMIN_README.md
    ├── README.md
    └── other .md files
```

## 🔧 What Was Fixed

### The Problem ❌
- **Nested folder structure**: `nexStaff-main/nexStaff-main/`
- **Confusing navigation**: Hard to find the actual project files
- **Live Server issues**: Served from wrong directory
- **Development complexity**: Extra navigation steps

### The Solution ✅
1. **Flattened structure**: All project files now in root directory
2. **Direct access**: No more nested folders with same name
3. **Clean organization**: Logical folder structure
4. **Easy Live Server**: Just right-click index.html and go live!

## 🎯 Benefits of New Structure
- ✅ **Simpler**: One-click Live Server setup
- ✅ **Cleaner**: No more confusing nested folders
- ✅ **Faster**: Direct access to all files
- ✅ **Professional**: Industry-standard folder structure
- ✅ **Maintainable**: Easy to navigate and understand

## 📱 Features
- **Responsive Design**: Works on all devices
- **Modern UI**: macOS-inspired design with purple theme
- **Dynamic Footer**: Loads automatically on all pages
- **Mobile Navigation**: Collapsible menu for mobile devices
- **Admin Dashboard**: Complete management system

## 🛠️ Technologies Used
- HTML5, CSS3, JavaScript
- Ionicons for icons
- Live Server for development
- Modern CSS features (CSS Grid, Flexbox, CSS Variables)

---
*Last updated: June 15, 2025*
