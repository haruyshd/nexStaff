# NexStaff Project - Quick Start Guide

## 🚀 How to Run the Project

### Option 1: Using Live Server (Recommended)
1. **Open the correct folder**: Open `nexStaff-main/nexStaff-main/` in VS Code (the inner folder)
2. **Right-click** on `index.html` 
3. **Select** "Open with Live Server"
4. The project will open at `http://localhost:5500`

### Option 2: From Root Directory
1. **Open** the root `nexStaff-main/` folder in VS Code
2. **Right-click** on the root `index.html` (the redirect page)
3. **Select** "Open with Live Server"
4. You'll be automatically redirected to the main application

## 📁 Project Structure
```
nexStaff-main/                    ← Root directory
├── index.html                    ← Redirect page (created to fix live server issue)
├── .vscode/settings.json         ← Live Server configuration
└── nexStaff-main/               ← Actual project folder
    ├── index.html               ← Main application
    ├── client/                  ← CSS, JS, Images
    ├── auth/                    ← Authentication pages
    ├── login/                   ← Admin dashboard
    └── pages/                   ← Other pages
```

## 🔧 What Was Fixed

### The Problem
- You had a nested folder structure (`nexStaff-main/nexStaff-main/`)
- Live Server was trying to serve from the outer folder instead of the inner folder
- This caused a blank page when going live

### The Solution
1. **Created a redirect page** in the root directory that automatically redirects to the correct location
2. **Added proper Live Server configuration** to handle the nested structure
3. **Set up automatic redirect** with a nice loading screen

## 🎯 Best Practice
For future projects, avoid nested folders with the same name. Consider renaming the inner folder to something like `src/` or `app/` to avoid confusion.

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
