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
        
        // Wait for the layout to settle before adding connecting lines
        setTimeout(() => {
            this.drawConnectingLines();
        }, 100);
    },
    
    // Draw all the connecting lines between nodes
    drawConnectingLines: function() {
        const container = document.getElementById('timeline-container');
        
        // Clear existing connecting lines
        const existingLines = container.querySelectorAll('.connecting-line');
        existingLines.forEach(line => line.remove());
        
        // Get all nodes
        const nodes = Array.from(container.querySelectorAll('.project-node'));
        
        // Sort nodes by position for proper connections (using dataset.position)
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
        // Get the positions of the nodes
        const nodeAPos = nodeA.getBoundingClientRect();
        const nodeBPos = nodeB.getBoundingClientRect();
        const containerPos = container.getBoundingClientRect();
        
        // Calculate the relative positions within the container
        const nodeATop = nodeAPos.top + nodeAPos.height / 2 - containerPos.top;
        const nodeALeft = nodeAPos.left + nodeAPos.width / 2 - containerPos.left;
        const nodeBTop = nodeBPos.top + nodeBPos.height / 2 - containerPos.top;
        const nodeBLeft = nodeBPos.left + nodeBPos.width / 2 - containerPos.left;
        
        // Calculate the length and angle of the line
        const length = Math.sqrt(
            Math.pow(nodeBLeft - nodeALeft, 2) + 
            Math.pow(nodeBTop - nodeATop, 2)
        );
        
        const angle = Math.atan2(
            nodeBTop - nodeATop,
            nodeBLeft - nodeALeft
        ) * 180 / Math.PI;
        
        // Create the line element
        const line = document.createElement('div');
        line.className = 'connecting-line';
        
        // Position and style the line
        line.style.width = `${length}px`;
        line.style.left = `${nodeALeft}px`;
        line.style.top = `${nodeATop}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = 'left center';
        
        // Add the line to the container
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
        
        // Add window resize event to redraw connecting lines
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.drawConnectingLines();
            }, 100);
        });
        
        // Initial draw of connecting lines after everything is loaded
        setTimeout(() => {
            this.drawConnectingLines();
        }, 500);
    }
};