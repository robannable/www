// timeline.js - Timeline-specific functions
const Timeline = {
    config: null,
    
    // Initialize the timeline
    init: function(timelineConfig) {
        this.config = timelineConfig;
    },
    
    // Create project nodes on the timeline
    createProjectNodes: function(projects) {
        const container = document.getElementById('timeline-container');
        
        // Clear existing project nodes
        const existingNodes = container.querySelectorAll('.project-node');
        existingNodes.forEach(node => node.remove());
        
        projects.forEach(project => {
            const node = document.createElement('div');
            node.className = `project-node size-${project.size} position-${project.horizontalPosition}`;
            node.dataset.id = project.id;
            node.dataset.collection = project.collection;
            
            // Calculate vertical position based on project.position
            const verticalPosition = this.config.baseOffset - (project.position * this.config.spacing);
            node.style.top = `${verticalPosition}vh`;
            
            // Add project number label
            node.textContent = project.position;
            
            // Create info box
            const infoBox = document.createElement('div');
            infoBox.className = `project-info info-${project.infoAlignment || this.config.defaultInfoAlignment}`;
            infoBox.innerHTML = `
                <h3>${project.name}</h3>
                <p>${project.shortDescription}</p>
                <div class="project-year">${project.year}</div>
            `;
            
            // Create connector line
            const connector = document.createElement('div');
            connector.className = `connector connector-${project.infoAlignment || this.config.defaultInfoAlignment}`;
            
            infoBox.appendChild(connector);
            node.appendChild(infoBox);
            container.appendChild(node);
            
            // Add click event to open project details
            node.addEventListener('click', () => {
                ProjectModal.showProject(project);
            });
        });
    },
    
    // Handle smooth scrolling
    setupScrolling: function() {
        window.addEventListener('wheel', (e) => {
            const delta = e.deltaY;
            window.scrollBy({
                top: delta,
                behavior: 'smooth'
            });
        });
    }
};