// Debug helper functions
const DebugHelper = {
    // Initialize debug mode
    init: function() {
        // Add a toggle button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Toggle Debug Info';
        toggleButton.style.position = 'fixed';
        toggleButton.style.bottom = '20px';
        toggleButton.style.right = '20px';
        toggleButton.style.zIndex = '1000';
        toggleButton.style.padding = '8px 12px';
        toggleButton.style.backgroundColor = '#333';
        toggleButton.style.color = 'white';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '4px';
        toggleButton.style.cursor = 'pointer';
        
        toggleButton.addEventListener('click', () => {
            this.toggleDebugInfo();
        });
        
        document.body.appendChild(toggleButton);
        
        // Create debug info container
        const debugContainer = document.createElement('div');
        debugContainer.id = 'debug-info';
        debugContainer.style.position = 'fixed';
        debugContainer.style.bottom = '70px';
        debugContainer.style.right = '20px';
        debugContainer.style.zIndex = '1000';
        debugContainer.style.backgroundColor = 'rgba(0,0,0,0.8)';
        debugContainer.style.color = 'white';
        debugContainer.style.padding = '15px';
        debugContainer.style.borderRadius = '4px';
        debugContainer.style.maxWidth = '300px';
        debugContainer.style.display = 'none';
        
        document.body.appendChild(debugContainer);
        
        console.log('Debug helper initialized');
    },
    
    // Toggle debug info visibility
    toggleDebugInfo: function() {
        const debugInfo = document.getElementById('debug-info');
        const isVisible = debugInfo.style.display !== 'none';
        
        if (isVisible) {
            debugInfo.style.display = 'none';
        } else {
            this.updateDebugInfo();
            debugInfo.style.display = 'block';
        }
    },
    
    // Update debug information
    updateDebugInfo: function() {
        const debugInfo = document.getElementById('debug-info');
        const container = document.getElementById('timeline-container');
        const nodes = container.querySelectorAll('.project-node');
        const lines = container.querySelectorAll('.connecting-line');
        
        let html = '<h3>Debug Information</h3>';
        html += `<p>Project nodes: ${nodes.length}</p>`;
        html += `<p>Connecting lines: ${lines.length}</p>`;
        html += '<h4>Node Positions:</h4>';
        
        nodes.forEach(node => {
            const rect = node.getBoundingClientRect();
            const id = node.dataset.id;
            const pos = node.dataset.position;
            
            html += `<p>${id} (pos: ${pos}): Left: ${Math.round(rect.left)}, Top: ${Math.round(rect.top)}</p>`;
        });
        
        debugInfo.innerHTML = html;
    }
};

// Initialize debug helper when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        DebugHelper.init();
    }, 1000); // Wait for everything else to initialize
});