document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load content data with cache-busting
        const response = await fetch('./data/content.json?v=' + new Date().getTime());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Loaded gallery data:', data.gallery.map(item => item.image));
        
        // Initialize gallery
        const gallery = document.querySelector('.gallery-track');
        if (!gallery) {
            throw new Error('Gallery track element not found');
        }
        
        const prevButton = document.querySelector('.gallery-control.prev');
        const nextButton = document.querySelector('.gallery-control.next');
        
        // Clear existing gallery items
        gallery.innerHTML = '';
        
        // Populate gallery with images
        data.gallery.forEach((item, index) => {
            const figure = document.createElement('figure');
            // First 2 images load eagerly (visible), rest lazy load
            const loadingAttr = index < 2 ? 'eager' : 'lazy';
            figure.innerHTML = `
                <img src="images/${item.image}" alt="${item.title}"
                     loading="${loadingAttr}"
                     onerror="this.onerror=null; console.error('Failed to load image: ${item.image}');">
                <div class="image-hover-info">
                    <h3>${item.title}</h3>
                </div>
            `;
            figure.addEventListener('click', () => {
                window.location.href = item.link;
            });
            gallery.appendChild(figure);
            
            // Debug info
            console.log(`Attempting to load image: images/${item.image}`);
        });

        // Gallery scrolling logic
        let scrollPosition = 0;
        const scrollAmount = 300; // Adjust based on image width

        function updateGalleryPosition() {
            gallery.style.transform = `translateX(${scrollPosition}px)`;
            // Update button states
            prevButton.style.opacity = scrollPosition < 0 ? '1' : '0.5';
            nextButton.style.opacity = scrollPosition > -(gallery.scrollWidth - gallery.clientWidth) ? '1' : '0.5';
        }

        prevButton.addEventListener('click', () => {
            scrollPosition = Math.min(scrollPosition + scrollAmount, 0);
            updateGalleryPosition();
        });

        nextButton.addEventListener('click', () => {
            const maxScroll = -(gallery.scrollWidth - gallery.clientWidth);
            scrollPosition = Math.max(scrollPosition - scrollAmount, maxScroll);
            updateGalleryPosition();
        });

        // Populate services
        const servicesSection = document.querySelector('.services');
        if (servicesSection && data.services) {
            servicesSection.innerHTML = data.services.map(service => `
                <div class="service-item">
                    <div class="service-logo">
                        <img src="images/logo.png" alt="${service.title}">
                    </div>
                    <div class="service-text">
                        <span class="highlight">${service.title}:</span> ${service.description}
                    </div>
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('Error loading gallery:', error);
        const gallery = document.querySelector('.gallery-track');
        if (gallery) {
            gallery.innerHTML = `
                <div style="padding: 20px; color: #666;">
                    Error loading gallery content. Please check the console for details.
                </div>
            `;
        }
    }
}); 