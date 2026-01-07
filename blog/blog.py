import os
import markdown
from datetime import datetime
import xml.etree.ElementTree as ET
from pathlib import Path
import yaml
from feedgen.feed import FeedGenerator

class SimpleBlogEngine:
    def __init__(self, content_dir="content", output_dir="output", css_file=None):
        self.content_dir = content_dir
        self.output_dir = output_dir
        self.css_file = css_file
        self.posts = []
        
    def read_post(self, file_path):
        """Read a post file and extract content with YAML frontmatter"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Split YAML frontmatter from content
        if content.startswith('---'):
            _, fm, content = content.split('---', 2)
            metadata = yaml.safe_load(fm)
        else:
            metadata = {
                'title': Path(file_path).stem,
                'date': datetime.fromtimestamp(os.path.getctime(file_path))
            }
            
        return {
            'content': content,
            'metadata': metadata,
            'category': os.path.basename(os.path.dirname(file_path)),
            'path': file_path
        }
    
    def generate_html(self, post):
        """Convert markdown to HTML and wrap in template"""
        html_content = markdown.markdown(post['content'])
        
        template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{post['metadata']['title']}</title>
            <link rel="stylesheet" href="/style.css">
            <meta charset="utf-8">
        </head>
        <body>
            <article>
                <header>
                    <h1>{post['metadata']['title']}</h1>
                    <time datetime="{post['metadata']['date'].isoformat()}">
                        {post['metadata']['date'].strftime('%B %d, %Y')}
                    </time>
                    <div class="category">{post['category']}</div>
                </header>
                {html_content}
            </article>
        </body>
        </html>
        """
        return template
    
    def generate_index(self):
        """Generate index page with list of all posts"""
        posts_html = ""
        for post in sorted(self.posts, key=lambda x: x['metadata']['date'], reverse=True):
            posts_html += f"""
            <li>
                <time datetime="{post['metadata']['date'].isoformat()}">
                    {post['metadata']['date'].strftime('%Y-%m-%d')}
                </time>
                <a href="{post['output_path']}">{post['metadata']['title']}</a>
                <span class="category">{post['category']}</span>
            </li>
            """
            
        index = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>My Blog</title>
            <link rel="stylesheet" href="/style.css">
            <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/feed.xml">
            <meta charset="utf-8">
        </head>
        <body>
            <h1>My Blog</h1>
            <ul class="post-list">
                {posts_html}
            </ul>
        </body>
        </html>
        """
        
        with open(os.path.join(self.output_dir, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(index)
    
    def generate_rss(self):
        """Generate RSS feed"""
        fg = FeedGenerator()
        fg.title('My Blog')
        fg.link(href='http://example.com', rel='alternate')
        fg.description('My Blog Feed')
        
        for post in sorted(self.posts, key=lambda x: x['metadata']['date'], reverse=True):
            fe = fg.add_entry()
            fe.title(post['metadata']['title'])
            fe.link(href=f"http://example.com/{post['output_path']}")
            fe.description(markdown.markdown(post['content']))
            fe.published(post['metadata']['date'])
            
        fg.rss_file(os.path.join(self.output_dir, 'feed.xml'))
    
    def copy_css(self):
        """Copy CSS file to output directory"""
        if self.css_file and os.path.exists(self.css_file):
            with open(self.css_file, 'r', encoding='utf-8') as src:
                with open(os.path.join(self.output_dir, 'style.css'), 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
        else:
            # Fallback to default CSS if no file provided or file doesn't exist
            self.generate_default_css()
    
    def generate_default_css(self):
        """Generate a basic CSS file as fallback"""
        css = """
        body {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
        }
        
        article {
            margin: 2rem 0;
        }
        
        .post-list {
            list-style: none;
            padding: 0;
        }
        
        .post-list li {
            margin: 1rem 0;
        }
        
        .category {
            display: inline-block;
            padding: 0.2rem 0.5rem;
            background: #eee;
            border-radius: 3px;
            margin-left: 1rem;
        }
        
        time {
            color: #666;
        }
        """
        
        with open(os.path.join(self.output_dir, 'style.css'), 'w', encoding='utf-8') as f:
            f.write(css)
    
    def build(self):
        """Build the entire blog"""
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Walk through content directory
        for root, dirs, files in os.walk(self.content_dir):
            for file in files:
                if file.endswith('.txt') or file.endswith('.md'):
                    file_path = os.path.join(root, file)
                    post = self.read_post(file_path)
                    
                    # Create output path
                    relative_path = os.path.relpath(file_path, self.content_dir)
                    output_path = os.path.splitext(relative_path)[0] + '.html'
                    full_output_path = os.path.join(self.output_dir, output_path)
                    
                    # Create directory if it doesn't exist
                    os.makedirs(os.path.dirname(full_output_path), exist_ok=True)
                    
                    # Generate and save HTML
                    html = self.generate_html(post)
                    with open(full_output_path, 'w', encoding='utf-8') as f:
                        f.write(html)
                    
                    # Store post info for index and RSS
                    post['output_path'] = output_path
                    self.posts.append(post)
        
        # Generate index and RSS
        self.generate_index()
        self.generate_rss()
        self.copy_css()

# Example usage
if __name__ == "__main__":
    blog = SimpleBlogEngine(
        content_dir="content",
        output_dir="output",
        css_file="themes/default.css"  # Optional custom CSS file
    )
    blog.build()