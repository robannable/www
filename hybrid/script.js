/**
 * Axis Design Hybrid - Interactive Features
 * Combines functionality from all design iterations
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all interactive components
    initGallery();
    initGridItems();
    initNavigation();
    initSmoothScroll();
});

/**
 * Gallery Carousel
 * Horizontal scrolling image gallery with prev/next controls
 */
function initGallery() {
    const gallery = document.querySelector('.image-gallery');
    if (!gallery) return;

    const track = gallery.querySelector('.gallery-track');
    const prevBtn = gallery.querySelector('.gallery-control.prev');
    const nextBtn = gallery.querySelector('.gallery-control.next');
    const items = gallery.querySelectorAll('.gallery-item');

    if (!track || items.length === 0) return;

    let currentIndex = 0;
    const itemWidth = items[0].offsetWidth;
    const visibleItems = Math.floor(gallery.offsetWidth / itemWidth);
    const maxIndex = Math.max(0, items.length - visibleItems);

    function updateGallery() {
        const offset = currentIndex * itemWidth;
        track.style.transform = `translateX(-${offset}px)`;

        // Update button states
        if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        if (nextBtn) nextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateGallery();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateGallery();
            }
        });
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (diff > swipeThreshold && currentIndex < maxIndex) {
            currentIndex++;
            updateGallery();
        } else if (diff < -swipeThreshold && currentIndex > 0) {
            currentIndex--;
            updateGallery();
        }
    }

    // Recalculate on resize
    window.addEventListener('resize', () => {
        const newItemWidth = items[0].offsetWidth;
        const newVisibleItems = Math.floor(gallery.offsetWidth / newItemWidth);
        const newMaxIndex = Math.max(0, items.length - newVisibleItems);

        if (currentIndex > newMaxIndex) {
            currentIndex = newMaxIndex;
        }
        updateGallery();
    });

    // Initial state
    updateGallery();
}

/**
 * Interactive Grid Items
 * Click-to-expand overlay functionality from axis grid design
 */
function initGridItems() {
    const gridItems = document.querySelectorAll('.grid-item');

    gridItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // If clicking a link inside the overlay, let it work normally
            if (e.target.classList.contains('popup-link') || e.target.tagName === 'A') {
                return;
            }

            // Toggle expanded state
            const wasExpanded = item.classList.contains('expanded');

            // Close all other expanded items
            gridItems.forEach(other => {
                if (other !== item) {
                    other.classList.remove('expanded');
                }
            });

            // Toggle this item
            if (!wasExpanded) {
                item.classList.add('expanded');
            } else {
                item.classList.remove('expanded');
            }
        });

        // Keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
            if (e.key === 'Escape' && item.classList.contains('expanded')) {
                item.classList.remove('expanded');
            }
        });
    });

    // Close expanded items when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.grid-item')) {
            gridItems.forEach(item => item.classList.remove('expanded'));
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            gridItems.forEach(item => item.classList.remove('expanded'));
        }
    });
}

/**
 * Navigation Active States
 * Updates shape nav and text nav based on scroll position
 */
function initNavigation() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const navButtons = document.querySelectorAll('.nav-button');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (sections.length === 0) return;

    function updateActiveNav() {
        const scrollPos = window.scrollY + 150; // Offset for header

        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        // Update shape navigation
        navButtons.forEach(btn => {
            const href = btn.getAttribute('href');
            if (href && href.includes(currentSection)) {
                btn.classList.add('active');
                // Update hamburger spans
                if (btn.classList.contains('nav-hamburger')) {
                    btn.querySelectorAll('span').forEach(span => {
                        span.style.background = 'white';
                    });
                }
            } else {
                btn.classList.remove('active');
                // Reset hamburger spans
                if (btn.classList.contains('nav-hamburger')) {
                    btn.querySelectorAll('span').forEach(span => {
                        span.style.background = '#1a472a';
                    });
                }
            }
        });

        // Update text navigation
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentSection)) {
                link.style.color = '#1a472a';
                link.style.fontWeight = '500';
            } else {
                link.style.color = '';
                link.style.fontWeight = '';
            }
        });
    }

    // Throttle scroll events for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initial state
    updateActiveNav();
}

/**
 * Smooth Scrolling
 * Enhanced smooth scroll for anchor links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const headerOffset = 80; // Account for fixed header
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Update URL without jumping
                history.pushState(null, null, href);
            }
        });
    });
}

/**
 * Timeline Hover Effects
 * Enhanced interactions for timeline section
 */
function initTimelineEffects() {
    const timelineItems = document.querySelectorAll('.timeline-item');

    timelineItems.forEach(item => {
        const node = item.querySelector('.timeline-node');
        const content = item.querySelector('.timeline-content');

        if (node && content) {
            // Add connection line animation on hover
            item.addEventListener('mouseenter', () => {
                node.style.transform = 'translateX(-50%) scale(1.2)';
            });

            item.addEventListener('mouseleave', () => {
                node.style.transform = 'translateX(-50%) scale(1)';
            });
        }
    });
}

// Initialize timeline effects
document.addEventListener('DOMContentLoaded', initTimelineEffects);

/**
 * Lazy Loading Enhancement
 * Adds fade-in animation to lazy-loaded images
 */
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    lazyImages.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';

        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });

        // If already loaded (cached)
        if (img.complete) {
            img.style.opacity = '1';
        }
    });
});

/**
 * Print Styles Helper
 * Expands all collapsed content for printing
 */
window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.grid-item').forEach(item => {
        item.classList.add('expanded');
    });
});

window.addEventListener('afterprint', () => {
    document.querySelectorAll('.grid-item').forEach(item => {
        item.classList.remove('expanded');
    });
});
