// modal.js - Project detail modal functions
const ProjectModal = {
    // Initialize the modal system
    init: function() {
        // Create a modal container if it doesn't exist
        if (!document.querySelector('.project-modal')) {
            const modalTemplate = document.getElementById('project-modal-template');
            const modalClone = modalTemplate.cloneNode(true);
            modalClone.id = 'project-modal';
            modalClone.style.display = 'none';
            document.body.appendChild(modalClone);
        }
        
        // Add global close handler for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    },
    
    // Show project details in a modal
    showProject: function(project) {
        const modal = document.getElementById('project-modal');
        
        // Set modal content
        modal.querySelector('.project-title').textContent = project.name;
        modal.querySelector('.project-year').textContent = `Year: ${project.year}`;
        
        if (project.location) {
            modal.querySelector('.project-location').textContent = `Location: ${project.location}`;
            modal.querySelector('.project-location').style.display = 'block';
        } else {
            modal.querySelector('.project-location').style.display = 'none';
        }
        
        if (project.client) {
            modal.querySelector('.project-client').textContent = `Client: ${project.client}`;
            modal.querySelector('.project-client').style.display = 'block';
        } else {
            modal.querySelector('.project-client').style.display = 'none';
        }
        
        modal.querySelector('.project-description').textContent = project.fullDescription;
        
        // Set tags
        const tagsContainer = modal.querySelector('.project-tags');
        tagsContainer.innerHTML = '';
        if (project.tags && project.tags.length) {
            project.tags.forEach(tag => {
                const tagElem = document.createElement('span');
                tagElem.className = 'tag';
                tagElem.textContent = tag;
                tagsContainer.appendChild(tagElem);
            });
            tagsContainer.style.display = 'block';
        } else {
            tagsContainer.style.display = 'none';
        }
        
        // Set completion status for current projects
        const completionElem = modal.querySelector('.completion-status');
        if (project.completionPercent) {
            completionElem.textContent = `Completion: ${project.completionPercent}%`;
            completionElem.style.display = 'block';
        } else {
            completionElem.style.display = 'none';
        }
        
        // Set images
        const imagesContainer = modal.querySelector('.project-images');
        imagesContainer.innerHTML = '';
        if (project.images && project.images.length) {
            project.images.forEach(imagePath => {
                const img = document.createElement('img');
                img.src = imagePath;
                img.alt = project.name;
                imagesContainer.appendChild(img);
            });
        }
        
        // Add close button handler
        modal.querySelector('.close-button').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Show the modal
        modal.style.display = 'flex';
    },
    
    // Close the modal
    closeModal: function() {
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
};