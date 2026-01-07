async function loadContent() {
    // Get the current page name from the URL
    const path = window.location.pathname;
    let page = path.split('/').pop().replace('.html', '');
    
    // Handle index/home page cases
    if (page === '' || page === 'index') {
        page = 'home';
    }

    try {
        // Fetch the content
        const response = await fetch('content.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Check if we have content for this page
        if (!data || !data[page]) {
            console.error('No content found for page:', page);
            return;
        }

        const content = data[page];
        
        // Check if content has the expected structure
        if (!content.paragraphs || !Array.isArray(content.paragraphs)) {
            console.error('Invalid content structure for page:', page);
            return;
        }

        // Get the content container
        const contentDiv = document.querySelector('.text-content');
        if (!contentDiv) {
            console.error('Could not find .text-content element');
            return;
        }
        
        // Clear existing content
        contentDiv.innerHTML = '';

        // Add each paragraph
        content.paragraphs.forEach(paragraph => {
            const p = document.createElement('p');
            // Replace <em> tags with spans for styling
            p.innerHTML = paragraph.replace(/<em>(.*?)<\/em>/g, '<span class="text-muted">$1</span>');
            contentDiv.appendChild(p);
        });

        console.log(`Successfully loaded content for page: ${page}`);
    } catch (error) {
        console.error('Error loading content:', error);
        console.error('Current page:', page);
    }
}

// Load content when the page loads
document.addEventListener('DOMContentLoaded', loadContent); 