// This script modifies the JSON files to use placeholder images for testing
document.addEventListener('DOMContentLoaded', () => {
    // Override fetch to intercept JSON requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (url.endsWith('.json')) {
            return originalFetch(url, options)
                .then(response => response.json())
                .then(data => {
                    // Replace image paths with placeholder images
                    if (url.includes('projects.json')) {
                        return data; // No changes needed to main config
                    } else {
                        // Replace image paths in project collections
                        if (data.projects) {
                            data.projects.forEach(project => {
                                // Replace thumbnails
                                if (project.thumbnailUrl) {
                                    project.thumbnailUrl = `https://via.placeholder.com/150?text=${encodeURIComponent(project.name)}`;
                                }
                                
                                // Replace project images
                                if (project.images && project.images.length) {
                                    project.images = project.images.map((img, i) => 
                                        `https://via.placeholder.com/800x500?text=${encodeURIComponent(project.name + ' ' + (i+1))}`
                                    );
                                }
                            });
                        }
                        return data;
                    }
                })
                .then(data => {
                    // Convert back to a Response object
                    return new Response(JSON.stringify(data), {
                        status: 200,
                        headers: {'Content-Type': 'application/json'}
                    });
                });
        }
        
        // For non-JSON requests, proceed normally
        return originalFetch(url, options);
    };
    
    console.log('Test environment setup complete - using placeholder images');
});