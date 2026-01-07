// Enhanced timeline.js with improved hover effects and spline connectors
const Timeline = {
    config: null,
    mousePosition: { x: 0, y: 0 },
    
    // Initialize the timeline
    init: function(timelineConfig) {
        this.config = timelineConfig;
        
        // Create container for SVG splines if it doesn't exist
        const container = document.getElementById('timeline-container');
        if (!document.querySelector('.connector-container')) {
            const connectorContainer = document.createElement('div');
            connectorContainer.className = 'connector-container';
            container.appendChild(connectorContainer);
        }
        
        // Track mouse position for dynamic info box positioning
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            
            // Update any visible info boxes
            this.updateVisibleInfoBoxes();
        });
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
            
            // Create info box - will be positioned dynamically on hover
            const infoBox = document.createElement('div');
            infoBox.className = 'project-info';
            infoBox.innerHTML = `
                <h3>${project.name}</h3>
                <p>${project.shortDescription}</p>
                <div class="project-year">${project.year}</div>
            `;
            
            node.appendChild(infoBox);
            container.appendChild(node);
            
            // Set up mouse events for this node
            this.setupNodeHoverEvents(node);
            
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
    
    // Setup hover events for dynamic info box positioning
    setupNodeHoverEvents: function(node) {
        node.addEventListener('mouseenter', () => {
            const infoBox = node.querySelector('.project-info');
            this.positionInfoBox(node, infoBox);
            this.createSplineConnector(node, infoBox);
        });
        
        node.addEventListener('mousemove', () => {
            const infoBox = node.querySelector('.project-info');
            this.positionInfoBox(node, infoBox);
            this.updateSplineConnector(node, infoBox);
        });
        
        node.addEventListener('mouseleave', () => {
            // Remove any spline connectors
            const spline = document.querySelector(`.spline-connector[data-for="${node.dataset.id}"]`);
            if (spline) {
                spline.remove();
            }
        });
    },
    
    // Position the info box based on mouse position and screen constraints
    positionInfoBox: function(node, infoBox) {
        const nodeRect = node.getBoundingClientRect();
        const containerRect = document.getElementById('timeline-container').getBoundingClientRect();
        const infoBoxWidth = 250; // Should match the CSS width
        const infoBoxHeight = 120; // Approximate height
        
        // Calculate the position relative to the mouse
        let left, top;
        
        // Horizontal positioning
        if (this.mousePosition.x > window.innerWidth / 2) {
            // Mouse is on the right side, position box to the left
            left = this.mousePosition.x - infoBoxWidth - 20;
        } else {
            // Mouse is on the left side, position box to the right
            left = this.mousePosition.x + 20;
        }
        
        // Vertical positioning
        if (this.mousePosition.y > window.innerHeight / 2) {
            // Mouse is on the bottom half, position box above
            top = this.mousePosition.y - infoBoxHeight - 10;
        } else {
            // Mouse is on the top half, position box below
            top = this.mousePosition.y + 10;
        }
        
        // Ensure the box stays within viewport bounds
        left = Math.max(10, Math.min(left, window.innerWidth - infoBoxWidth - 10));
        top = Math.max(10, Math.min(top, window.innerHeight - infoBoxHeight - 10));
        
        // Apply the calculated position
        infoBox.style.position = 'fixed';
        infoBox.style.left = `${left}px`;
        infoBox.style.top = `${top}px`;
        infoBox.style.transform = 'none'; // Clear any transform
    },
    
    // Create SVG spline connector between node and info box
    createSplineConnector: function(node, infoBox) {
        // Remove any existing spline for this node
        const existingSpline = document.querySelector(`.spline-connector[data-for="${node.dataset.id}"]`);
        if (existingSpline) {
            existingSpline.remove();
        }
        
        const connectorContainer = document.querySelector('.connector-container');
        const nodeRect = node.getBoundingClientRect();
        const infoRect = infoBox.getBoundingClientRect();
        const containerRect = document.getElementById('timeline-container').getBoundingClientRect();
        
        // Create SVG element for the spline
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('spline-connector');
        svg.setAttribute('data-for', node.dataset.id);
        svg.style.position = 'fixed';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        
        // Calculate control points for a nice curve
        const startX = nodeRect.left + nodeRect.width/2;
        const startY = nodeRect.top + nodeRect.height/2;
        const endX = (infoRect.left + infoRect.right) / 2;
        const endY = (infoRect.top + infoRect.bottom) / 2;
        
        // Control points for the bezier curve
        const dx = endX - startX;
        const dy = endY - startY;
        const ctrlX1 = startX + dx * 0.3;
        const ctrlY1 = startY + dy * 0.1;
        const ctrlX2 = startX + dx * 0.7;
        const ctrlY2 = startY + dy * 0.9;
        
        // Create the path element
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${startX} ${startY} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${endX} ${endY}`);
        path.setAttribute("stroke", "#555");
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("stroke-dasharray", "4 2");
        path.setAttribute("fill", "none");
        
        svg.appendChild(path);
        document.body.appendChild(svg);
    },
    
    // Update the spline connector position when mouse moves
    updateSplineConnector: function(node, infoBox) {
        const spline = document.querySelector(`.spline-connector[data-for="${node.dataset.id}"]`);
        if (spline) {
            const nodeRect = node.getBoundingClientRect();
            const infoRect = infoBox.getBoundingClientRect();
            
            // Calculate new endpoints and control points
            const startX = nodeRect.left + nodeRect.width/2;
            const startY = nodeRect.top + nodeRect.height/2;
            const endX = (infoRect.left + infoRect.right) / 2;
            const endY = (infoRect.top + infoRect.bottom) / 2;
            
            // Control points for the bezier curve
            const dx = endX - startX;
            const dy = endY - startY;
            const ctrlX1 = startX + dx * 0.3;
            const ctrlY1 = startY + dy * 0.1;
            const ctrlX2 = startX + dx * 0.7;
            const ctrlY2 = startY + dy * 0.9;
            
            // Update the path
            const path = spline.querySelector('path');
            path.setAttribute("d", `M ${startX} ${startY} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${endX} ${endY}`);
        }
    },
    
    // Update any visible info boxes (called on mousemove)
    updateVisibleInfoBoxes: function() {
        const visibleInfoBoxes = document.querySelectorAll('.project-node:hover .project-info');
        visibleInfoBoxes.forEach(infoBox => {
            const node = infoBox.closest('.project-node');
            this.positionInfoBox(node, infoBox);
            this.updateSplineConnector(node, infoBox);
        });
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