// Function to load content from JSON
async function loadContent() {
    try {
        const response = await fetch('data/content.json');
        const data = await response.json();
        
        // Update top quote
        const quote = document.querySelector('.quote');
        if (quote) {
            quote.textContent = data.topQuote;
        }

        // Update current project
        const currentProject = document.querySelector('.current-project .content');
        if (currentProject) {
            currentProject.textContent = data.currentProject.description;
        }

        // Update current project image caption
        const caption = document.querySelector('.current-project-image .caption');
        if (caption) {
            caption.textContent = data.currentProject.imageCaption;
        }

        // Update latest news
        const latestNews = document.querySelector('.blog-preview .content');
        if (latestNews) {
            // Remove all content - just keep the section title "latest news:"
            latestNews.textContent = '';
        }

        // Update footer text
        const footerText = document.querySelector('.footer-text');
        if (footerText) {
            footerText.textContent = data.footerText;
        }
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Load content when the page loads
document.addEventListener('DOMContentLoaded', loadContent); 