// Global variables for infinite scroll
let allPosts = [];
let currentDisplayCount = 3; // Show 3 posts initially
const postsPerLoad = 3; // Load 3 more posts each time

// Function to truncate text to approximately n words
function truncateWords(text, n) {
    const words = text.split(/\s+/);
    if (words.length <= n) return text;
    return words.slice(0, n).join(' ') + '...';
}

// Function to generate permalink from title
function generatePermalink(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Function to parse front matter from markdown content
function parseFrontMatter(content) {
    const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
        return {
            title: 'Untitled',
            date: new Date().toISOString().split('T')[0],
            content: content.trim()
        };
    }

    const [, frontMatter, postContent] = match;
    const metadata = {};
    
    frontMatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            metadata[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        }
    });

    return {
        ...metadata,
        content: postContent.trim()
    };
}

// Function to convert markdown to HTML (simplified version)
function markdownToHtml(markdown) {
    // Split the content into lines
    const lines = markdown.split('\n');
    let html = '';
    let inList = false;
    let inBlockquote = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Handle headings
        if (line.startsWith('### ')) {
            html += `<h3>${line.substring(4)}</h3>\n\n`;
            continue;
        }
        if (line.startsWith('## ')) {
            html += `<h2>${line.substring(3)}</h2>\n\n`;
            continue;
        }

        // Handle blockquotes
        if (line.startsWith('> ')) {
            if (!inBlockquote) {
                html += '<blockquote>';
                inBlockquote = true;
            }
            html += line.substring(2) + '\n';
            if (i === lines.length - 1 || !lines[i + 1].startsWith('> ')) {
                html += '</blockquote>\n\n';
                inBlockquote = false;
            }
            continue;
        }

        // Handle lists
        if (line.startsWith('- ')) {
            if (!inList) {
                html += '<ul>\n';
                inList = true;
            }
            html += `<li>${line.substring(2)}</li>\n`;
            if (i === lines.length - 1 || !lines[i + 1].startsWith('- ')) {
                html += '</ul>\n\n';
                inList = false;
            }
            continue;
        }

        // Handle empty lines
        if (line === '') {
            if (i > 0 && lines[i - 1].trim() !== '') {
                html += '\n';
            }
            continue;
        }

        // Handle regular paragraphs
        if (!inList && !inBlockquote) {
            // Check if this is the start of a new paragraph
            if (i === 0 || lines[i - 1].trim() === '') {
                html += '<p>';
            }
            
            // Add the line content
            html += line;
            
            // Check if this is the end of a paragraph
            if (i === lines.length - 1 || lines[i + 1].trim() === '') {
                html += '</p>\n\n';
            } else {
                html += ' ';
            }
        }
    }

    // Handle inline formatting
    html = html
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');

    return html;
}

// Function to truncate markdown content to approximately n words
function truncateMarkdown(markdown, n) {
    // Split into lines to preserve structure
    const lines = markdown.split('\n');
    let wordCount = 0;
    let result = [];
    
    for (const line of lines) {
        if (line.trim() === '') {
            result.push(line);
            continue;
        }
        
        // Skip front matter
        if (line.startsWith('---')) {
            continue;
        }
        
        // Handle headings, lists, and blockquotes
        if (line.startsWith('#') || line.startsWith('-') || line.startsWith('>')) {
            result.push(line);
            continue;
        }
        
        // Count words in regular text
        const words = line.trim().split(/\s+/);
        if (wordCount + words.length > n) {
            const remainingWords = n - wordCount;
            result.push(words.slice(0, remainingWords).join(' ') + '...');
            break;
        }
        
        wordCount += words.length;
        result.push(line);
    }
    
    return result.join('\n');
}

// Function to load and display blog posts
async function loadBlogPosts(limit = null) {
    try {
        // Get list of markdown files from manifest
        const manifestResponse = await fetch('blog/manifest.json');
        const manifest = await manifestResponse.json();
        const files = manifest.posts;

        // Load and parse each markdown file
        const posts = await Promise.all(files.map(async file => {
            const response = await fetch(`blog/${file}`);
            const content = await response.text();
            const { title, date, timestamp, content: postContent } = parseFrontMatter(content);
            return {
                title,
                date,
                timestamp,
                content: postContent,
                filename: file,
                permalink: generatePermalink(title)
            };
        }));

        // Sort posts by timestamp (newest first)
        posts.sort((a, b) => {
            // Convert DD-MM-YYYY HH:MM to Date object for comparison
            const dateA = new Date(a.timestamp.split(' ')[0].split('-').reverse().join('-') + 'T' + a.timestamp.split(' ')[1]);
            const dateB = new Date(b.timestamp.split(' ')[0].split('-').reverse().join('-') + 'T' + b.timestamp.split(' ')[1]);
            return dateB - dateA;
        });
        
        // Store all posts globally for infinite scroll
        allPosts = posts;
        
        // Try both main page and blog page containers
        const blogContainer = document.querySelector('.blog-preview .blog-entries') || document.querySelector('.blog-entries');
        if (!blogContainer) return;

        const isMainPage = document.querySelector('.blog-preview');
        
        if (isMainPage) {
            // On main page, show only first post with truncated content
            const post = posts[0];
            if (post) {
                // Truncate markdown first, then convert to HTML
                const truncatedMarkdown = truncateMarkdown(post.content, 50);
                const truncatedHtml = markdownToHtml(truncatedMarkdown);
                blogContainer.innerHTML = `
                    <article class="blog-entry">
                        <h2><a href="blog.html#${post.permalink}" class="blog-title-link">${post.title}</a></h2>
                        <time datetime="${post.date}">${new Date(post.date.split('-').reverse().join('-')).toLocaleDateString()}</time>
                        <div class="blog-content">${truncatedHtml}</div>
                        <a href="blog.html#${post.permalink}" class="read-more">Read full post &rarr;</a>
                    </article>
                `;
            }
        } else {
            // On blog page, implement infinite scroll
            displayBlogPosts();
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

// Function to display blog posts with infinite scroll
function displayBlogPosts() {
    const blogContainer = document.querySelector('.blog-entries');
    if (!blogContainer) return;

    const displayPosts = allPosts.slice(0, currentDisplayCount);
    
    blogContainer.innerHTML = displayPosts.map((post, index) => `
        <article class="blog-entry" id="${post.permalink}">
            <h2><a href="#${post.permalink}" class="blog-title-link">${post.title}</a></h2>
            <time datetime="${post.date}">${new Date(post.date.split('-').reverse().join('-')).toLocaleDateString()}</time>
            <div class="blog-content">${markdownToHtml(post.content)}</div>
        </article>
        ${index < displayPosts.length - 1 ? '<hr class="post-divider">' : ''}
    `).join('');

    // Add load more button if there are more posts to show
    if (currentDisplayCount < allPosts.length) {
        const loadMoreButton = document.createElement('div');
        loadMoreButton.className = 'load-more-container';
        loadMoreButton.innerHTML = `
            <button class="load-more-btn" onclick="loadMorePosts()">
                Load More Posts
            </button>
        `;
        blogContainer.appendChild(loadMoreButton);
    }
}

// Function to load more posts
function loadMorePosts() {
    currentDisplayCount += postsPerLoad;
    displayBlogPosts();
    
    // Smooth scroll to the new content
    const newPosts = document.querySelectorAll('.blog-entry');
    if (newPosts.length > 0) {
        const lastNewPost = newPosts[newPosts.length - postsPerLoad];
        if (lastNewPost) {
            lastNewPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Function to truncate HTML content to approximately n words
function truncateHtml(html, n) {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get all text nodes
    const textNodes = [];
    const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.trim()) {
            textNodes.push(node);
        }
    }
    
    // Count words and truncate
    let wordCount = 0;
    let truncated = false;
    
    for (const node of textNodes) {
        const words = node.textContent.trim().split(/\s+/);
        if (wordCount + words.length > n) {
            const remainingWords = n - wordCount;
            node.textContent = words.slice(0, remainingWords).join(' ') + '...';
            truncated = true;
            break;
        }
        wordCount += words.length;
    }
    
    // If we truncated, remove any remaining content
    if (truncated) {
        let currentNode = tempDiv;
        let foundTruncated = false;
        
        const removeAfterTruncation = (node) => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.endsWith('...')) {
                foundTruncated = true;
                return;
            }
            
            if (foundTruncated) {
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
                return;
            }
            
            for (let i = node.childNodes.length - 1; i >= 0; i--) {
                removeAfterTruncation(node.childNodes[i]);
            }
        };
        
        removeAfterTruncation(currentNode);
    }
    
    return tempDiv.innerHTML;
}

// Load blog posts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the main page (show 1 post) or blog page (show all)
    const isMainPage = document.querySelector('.blog-preview');
    loadBlogPosts(isMainPage ? 1 : null);
    
    // Handle hash navigation for permalinks
    if (window.location.hash && !isMainPage) {
        setTimeout(() => {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 500); // Small delay to ensure content is loaded
    }
}); 