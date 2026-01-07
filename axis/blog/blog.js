async function loadBlogEntries() {
    try {
        // Get list of blog posts
        const response = await fetch('posts/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentDiv = document.querySelector('.blog-content');
        if (!contentDiv) {
            throw new Error('Blog content container not found');
        }

        // Clear existing content
        contentDiv.innerHTML = '';

        // Get and process each markdown file
        const posts = await Promise.all([
            fetchPost('2024-03-20-cultural-center.md'),
            fetchPost('2024-03-15-sustainable-housing.md'),
            fetchPost('2024-03-10-historic-renovation.md')
        ]);

        // Sort posts by date
        posts.sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date));

        // Add each blog entry
        posts.forEach(post => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'blog-entry';

            const date = new Date(post.metadata.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            entryDiv.innerHTML = `
                <div class="blog-date">${formattedDate}</div>
                <h2 class="blog-title">${post.metadata.title}</h2>
                <div class="blog-text">${marked.parse(post.content)}</div>
            `;

            contentDiv.appendChild(entryDiv);
        });

        console.log('Successfully loaded blog entries');
    } catch (error) {
        console.error('Error loading blog entries:', error);
    }
}

async function fetchPost(filename) {
    try {
        const response = await fetch(`posts/${filename}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        // Find the frontmatter section
        const matches = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
        
        if (!matches) {
            throw new Error(`No valid frontmatter found in ${filename}`);
        }

        // Parse YAML front matter (matches[1] contains the YAML content)
        const metadata = jsyaml.load(matches[1]);
        
        // Get content (matches[2] contains everything after the frontmatter)
        const content = matches[2].trim();

        if (!metadata.title || !metadata.date) {
            throw new Error(`Missing required frontmatter fields in ${filename}`);
        }

        return { metadata, content };
    } catch (error) {
        console.error(`Error processing ${filename}:`, error);
        throw error;
    }
}

// Load blog entries when the page loads
document.addEventListener('DOMContentLoaded', loadBlogEntries); 