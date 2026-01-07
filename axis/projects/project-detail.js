async function loadProjectDetails() {
    try {
        // Get project ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        if (!projectId) {
            throw new Error('No project ID specified');
        }

        // Load project data
        const response = await fetch('projects.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Find the project
        const project = data.projects.find(p => p.id === projectId);
        if (!project) {
            throw new Error(`Project ${projectId} not found`);
        }

        // Load project details
        const detailsDiv = document.querySelector('.project-details');
        if (!detailsDiv) {
            throw new Error('Project details container not found');
        }

        // Add project content
        detailsDiv.innerHTML = `
            <h2 class="project-title">${project.title}</h2>
            <p class="project-subtitle">${project.id} - ${project.date}</p>
            <p class="project-description">${project.description || 'Project details coming soon.'}</p>
        `;

        // Load gallery if it exists
        const galleryDiv = document.querySelector('.project-gallery');
        if (galleryDiv) {
            if (project.gallery) {
                project.gallery.forEach(image => {
                    const img = document.createElement('img');
                    // Use placeholder for now
                    img.src = 'images/placeholder.svg';
                    img.alt = image.caption || project.title;
                    img.className = 'gallery-image';
                    galleryDiv.appendChild(img);
                });
            } else {
                // Add at least one placeholder image
                const img = document.createElement('img');
                img.src = 'images/placeholder.svg';
                img.alt = project.title;
                img.className = 'gallery-image';
                galleryDiv.appendChild(img);
            }
        }

        console.log('Successfully loaded project details');
    } catch (error) {
        console.error('Error loading project details:', error);
    }
}

// Load project details when the page loads
document.addEventListener('DOMContentLoaded', loadProjectDetails); 