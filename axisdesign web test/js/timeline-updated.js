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
        
        // Clear existing connecting lines
        const existingLines = container.querySelectorAll('.connecting-line');
        existingLines.forEach(line => line.remove());
        
        // Create all nodes first
        projects.forEach(project => {
            const node = document.createElement('div');
            node.className = `project-node size-${project.size} position-${project.horizontalPosition}`;
            node.dataset.id = project.id;
            node.dataset.collection = project.collection;
            node.dataset.position = project.position;
            
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
        
        // Now add connecting lines between nodes
        const nodes = Array.from(container.querySelectorAll('.project-node'));
        
        // Sort nodes by position for proper connections
        nodes.sort((a, b) => {
            return parseInt(b.dataset.position) - parseInt(a.dataset.position);
        });
        
        // Create connecting lines between adjacent nodes
        for (let i = 0; i < nodes.length - 1; i++) {
            const currentNode = nodes[i];
            const nextNode = nodes[i + 1];
            
            // Create a line connecting the two nodes
            this.createConnectingLine(container, currentNode, nextNode);
        }
    },
    
    // Create a connecting line between two project nodes
    createConnectingLine: function(container, nodeA, nodeB) {
        // Create the line element
        const line = document.createElement('div');
        line.className = 'connecting-line';
        
        // Calculate positions for both nodes
        const rectA = nodeA.getBoundingClientRect();
        const rectB = nodeB.getBoundingClientRect();
        
        // Get container position for relative calculations
        const containerRect = container.getBoundingClientRect();
        
        // Calculate the center points relative to the container
        const centerAX = (rectA.left + rectA.right) / 2 - containerRect.left;
        const centerAY = (rectA.top + rectA.bottom) / 2 - containerRect.top;
        const centerBX = (rectB.left + rectB.right) / 2 - containerRect.left;
        const centerBY = (rectB.top + rectB.bottom) / 2 - containerRect.top;
        
        // Calculate length and angle of the line
        const deltaX = centerBX - centerAX;
        const deltaY = centerBY - centerAY;
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        // Position and rotate the line
        line.style.width = `${length}px`;
        line.style.left = `${centerAX}px`;
        line.style.top = `${centerAY}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = 'left center';
        
        // Add the line to the container (before the nodes to ensure they're on top)
        container.appendChild(line);
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
        
        // Redraw connecting lines on window resize or scroll
        window.addEventListener('resize', this.updateConnectingLines.bind(this));
        window.addEventListener('scroll', this.updateConnectingLines.bind(this));
    },
    
    // Update all connecting lines (on resize or scroll)
    updateConnectingLines: function() {
        const container = document.getElementById('timeline-container');
        
        // Clear existing connecting lines
        const existingLines = container.querySelectorAll('.connecting-line');
        existingLines.forEach(line => line.remove());
        
        // Get all nodes
        const nodes = Array.from(container.querySelectorAll('.project-node'));
        
        // Sort nodes by position
        nodes.sort((a, b) => {
            return parseInt(b.dataset.position) - parseInt(a.dataset.position);
        });
        
        // Create connecting lines between adjacent nodes
        for (let i = 0; i < nodes.length - 1; i++) {
            const currentNode = nodes[i];
            const nextNode = nodes[i + 1];
            
            // Create a line connecting the two nodes
            this.createConnectingLine(container, currentNode, nextNode);
        }
    }
};