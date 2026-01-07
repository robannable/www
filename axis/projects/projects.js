async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data || !data.projects || !Array.isArray(data.projects)) {
            throw new Error('Invalid projects data structure');
        }

        const gridDiv = document.querySelector('.projects-grid');
        if (!gridDiv) {
            throw new Error('Projects grid container not found');
        }

        // Clear existing content
        gridDiv.innerHTML = '';

        // Add each project
        data.projects.forEach(project => {
            const projectDiv = document.createElement('a');
            projectDiv.href = `project.html?id=${project.id}`;
            projectDiv.className = `project-item ${project.size}`;

            projectDiv.innerHTML = `
                <img class="project-image" src="${project.image}" alt="${project.title}">
                <div class="project-title">${project.title}</div>
            `;

            gridDiv.appendChild(projectDiv);
        });

        console.log('Successfully loaded projects');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Load projects when the page loads
document.addEventListener('DOMContentLoaded', loadProjects); 