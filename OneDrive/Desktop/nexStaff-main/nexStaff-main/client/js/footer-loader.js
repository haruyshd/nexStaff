/**
 * Footer Loader - Dynamically loads the footer template based on the current page location
 * 
 * Usage:
 * 1. Add <div id="footer-container"></div> where you want the footer to appear
 * 2. Include this script: <script src="path/to/footer-loader.js"></script>
 * 
 * Debug Mode:
 * - Add data-debug="true" to the footer container to enable debug mode
 * - Example: <div id="footer-container" data-debug="true"></div>
 */

document.addEventListener("DOMContentLoaded", async function() {
    const footerContainer = document.getElementById("footer-container");
    
    if (!footerContainer) {
        console.error("Footer container element not found. Please add <div id=\"footer-container\"></div> to your page.");
        return;
    }
    
    // Debug mode
    const isDebugMode = footerContainer.getAttribute('data-debug') === 'true';
    
    // Helper function to log debug information
    const debugLog = (message, data = null) => {
        if (isDebugMode) {
            if (data) {
                console.log(`[Footer Loader] ${message}`, data);
            } else {
                console.log(`[Footer Loader] ${message}`);
            }
        }
    };
    
    debugLog('Footer loader initialized');
    
    // Check if Ionicons is loaded or needs to be loaded
    if (!document.querySelector('script[src*="ionicons"]')) {
        debugLog("Ionicons not detected. Adding required scripts for footer icons.");
        const ioniconsEsm = document.createElement('script');
        ioniconsEsm.type = 'module';
        ioniconsEsm.src = 'https://unpkg.com/ionicons@7.2.1/dist/ionicons/ionicons.esm.js';
        document.body.appendChild(ioniconsEsm);
        
        const ioniconsNomodule = document.createElement('script');
        ioniconsNomodule.noModule = true;
        ioniconsNomodule.src = 'https://unpkg.com/ionicons@7.2.1/dist/ionicons/ionicons.js';
        document.body.appendChild(ioniconsNomodule);
    }
    
    // Determine the relative path based on the current page location
    let path = "";
    let templatePath = "";
      // Check current URL to determine the correct path
    const currentPath = window.location.pathname;
    
    if (currentPath.includes("/pages/") || currentPath.includes("/auth/")) {
        // We're in a subdirectory
        path = "../";
        templatePath = "../client/templates/footer-template.html";
    } else if (currentPath.includes("/login/")) {
        // We're in the login directory
        path = "../";
        templatePath = "../client/templates/footer-template.html";
    } else {
        // We're at the root
        path = "";
        templatePath = "client/templates/footer-template.html";
    }    debugLog(`Loading footer with path: ${path} from template: ${templatePath}`);
    
    try {
        // Fetch the footer template
        debugLog(`Fetching template from: ${templatePath}`);
        const response = await fetch(templatePath);
        
        if (!response.ok) {
            throw new Error(`Failed to load footer (${response.status} ${response.statusText}) from ${templatePath}`);
        }
        
        // Get the template content and replace path placeholders
        const html = await response.text();
        debugLog(`Template loaded, length: ${html.length} characters`);
        const processedHtml = html.replace(/\{\{path\}\}/g, path);
        debugLog(`Path placeholders replaced with: "${path}"`);
        
        // Insert the footer HTML
        footerContainer.innerHTML = processedHtml;
        debugLog("Footer loaded and inserted successfully!");
    } catch (error) {
        console.error(`Error loading footer template from ${templatePath}:`, error);
        footerContainer.innerHTML = `
            <footer class="site-footer">
                <div class="footer-content">
                    <div class="footer-section">
                        <p>© 2025 NexStaff. All rights reserved.</p>
                        <p class="error-message" style="color: #ff5757; font-size: 0.8rem;">Error loading footer. Please refresh or contact support.</p>
                    </div>
                </div>
            </footer>
        `;
    }
});
