// main.js - Main application script
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the modal system
    ProjectModal.init();
    
    // Set up navigation links
    document.getElementById('about-link').addEventListener('click', (e) => {
        e.preventDefault();
        alert('About page would open here');
    });
    
    document.getElementById('contact-link').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Contact page would open here');
    });
    
    // Load project data
    ProjectLoader.loadProjectConfig()
        .then(allData => {
            // Initialize timeline with config
            Timeline.init(allData.config);
            
            // Get all projects
            const allProjects = ProjectLoader.getAllProjects(allData);
            
            // Create timeline nodes
            Timeline.createProjectNodes(allProjects);
            
            // Set up smooth scrolling
            Timeline.setupScrolling();
        })
        .catch(error => {
            console.error('Error initializing timeline:', error);
        });
});