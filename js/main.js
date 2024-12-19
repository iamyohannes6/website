// Initialize all Swiper instances
const initSwipers = () => {
    const createRandomizedSwiperOptions = () => {
        const baseDelay = 3000; // Base delay of 3 seconds
        const randomVariation = Math.floor(Math.random() * 2000) - 1000; // Random variation of ±1 second
        
        return {
            slidesPerView: 4,
            spaceBetween: 30,
            centeredSlides: true,
            loop: true,
            autoplay: {
                delay: baseDelay + randomVariation, // Randomized delay
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                320: {
                    slidesPerView: 1,
                    spaceBetween: 20
                },
                640: {
                    slidesPerView: 2,
                    spaceBetween: 30
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 30
                }
            }
        };
    };

    // Initialize all swipers with randomized options
    new Swiper('.poster-design-swiper', createRandomizedSwiperOptions());
    new Swiper('.graphic-design-swiper', createRandomizedSwiperOptions());
    new Swiper('.branding-swiper', createRandomizedSwiperOptions());
};

// Initialize zoom modal functionality
const initZoomModal = () => {
    const modal = document.querySelector('.zoom-modal');
    const modalImg = modal.querySelector('img');
    const closeButton = modal.querySelector('.close-button');

    // Function to open modal
    const openModal = (imgSrc) => {
        modal.classList.add('active');
        modalImg.src = imgSrc;
        document.body.style.overflow = 'hidden';
    };

    // Function to close modal
    const closeModal = () => {
        modal.classList.remove('active');
        modalImg.src = '';
        document.body.style.overflow = '';
    };

    // Close modal when clicking close button or outside the image
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target === modalImg) {
            closeModal();
        }
    });

    // Close modal with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    return openModal;
};

// Function to shuffle array
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Function to get dominant color from an image
const getDominantColor = (img) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const width = canvas.width = img.naturalWidth || img.offsetWidth || img.width;
    const height = canvas.height = img.naturalHeight || img.offsetHeight || img.height;
    
    // Scale down image for faster processing
    const scale = Math.min(100 / width, 100 / height);
    const scaledWidth = Math.floor(width * scale);
    const scaledHeight = Math.floor(height * scale);
    
    context.drawImage(img, 0, 0, scaledWidth, scaledHeight);

    try {
        const data = context.getImageData(0, 0, scaledWidth, scaledHeight).data;
        const colorMap = new Map();
        
        // Process every pixel
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 128) continue; // Skip transparent pixels
            
            // Get color values
            const r = Math.floor(data[i] / 32) * 32;     // Quantize to reduce colors
            const g = Math.floor(data[i + 1] / 32) * 32;
            const b = Math.floor(data[i + 2] / 32) * 32;
            
            // Skip very dark or very light colors
            const brightness = (r + g + b) / 3;
            if (brightness < 30 || brightness > 225) continue;
            
            const key = `${r},${g},${b}`;
            colorMap.set(key, (colorMap.get(key) || 0) + 1);
        }
        
        // Find the most common color
        let maxCount = 0;
        let dominantColor = { r: 0, g: 245, b: 212 }; // Default theme color
        
        for (const [key, count] of colorMap.entries()) {
            if (count > maxCount) {
                maxCount = count;
                const [r, g, b] = key.split(',').map(Number);
                dominantColor = { r, g, b };
            }
        }
        
        return dominantColor;
    } catch (e) {
        console.error('Error getting image color:', e);
        return { r: 0, g: 245, b: 212 }; // Default to theme color
    }
};

// Function to apply glow effect
const applyGlowEffect = (img, slide) => {
    img.onload = () => {
        const color = getDominantColor(img);
        // Reduce opacity for subtler glow
        const glowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.15)`;
        slide.style.setProperty('--glow-color', glowColor);
        
        // Store original color for hover state
        slide.style.setProperty('--original-color', `rgb(${color.r}, ${color.g}, ${color.b})`);
    };
};

// Load images for a specific work section
const loadWorkImages = (sectionClass, prefix, count) => {
    const swiperWrapper = document.querySelector(`${sectionClass} .swiper-wrapper`);
    if (!swiperWrapper) return;

    // Create array of image numbers
    const imageNumbers = Array.from({ length: count }, (_, i) => i + 1);
    
    // Shuffle the array for random order
    const shuffledNumbers = shuffleArray(imageNumbers);

    // Clear placeholder
    swiperWrapper.innerHTML = '';

    // Add images to swiper in random order
    shuffledNumbers.forEach(num => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        
        const img = document.createElement('img');
        img.src = `assets/work/${prefix}/${prefix}-${num}.jpg`;
        img.alt = `${prefix.replace('-', ' ')} ${num}`;
        img.loading = 'lazy';
        
        // Add error handling with extension fallback
        img.onerror = function() {
            if (this.src.endsWith('.jpg')) {
                this.src = this.src.replace('.jpg', '.jpeg');
            } else if (this.src.endsWith('.jpeg')) {
                this.src = this.src.replace('.jpeg', '.png');
            } else {
                console.error('Failed to load image:', this.src);
                this.onerror = null;
                this.src = 'https://via.placeholder.com/800x600/1a1a1a/00f5d4?text=Image+Not+Available';
            }
        };

        // Apply glow effect based on image color
        applyGlowEffect(img, slide);

        // Add click handler for zoom
        img.addEventListener('click', () => {
            const modal = document.querySelector('.zoom-modal');
            const modalImg = modal.querySelector('img');
            modalImg.src = img.src;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        slide.appendChild(img);
        swiperWrapper.appendChild(slide);
    });
};

// Load images from a directory
const loadDirectoryImages = async (directory) => {
    try {
        const response = await fetch(`/api/get-images?directory=${directory}`);
        if (!response.ok) throw new Error('Failed to fetch images');
        return await response.json();
    } catch (error) {
        console.error(`Error loading images from ${directory}:`, error);
        return [];
    }
};

// Pinterest Feed Integration
const loadPinterestFeed = async () => {
    const pinterestFeed = document.getElementById('pinterest-feed');
    if (!pinterestFeed) {
        console.error('Pinterest feed element not found');
        return;
    }
    
    // Show loading state
    pinterestFeed.innerHTML = `
        <div class="swiper-slide loading-slide">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading Pinterest feed...</p>
        </div>
    `;

    try {
        console.log('Fetching Pinterest feed...');
        const response = await fetch('/.netlify/functions/pinterest', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });
        
        console.log('Pinterest API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Pinterest API response:', data);
        
        if (!data.success || !data.pins?.length) {
            console.error('No pins available:', data.error || 'Unknown error');
            throw new Error(data.error || 'No pins available');
        }

        // Clear loading state
        pinterestFeed.innerHTML = '';
        
        // Add pins to the carousel
        data.pins.forEach(pin => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            
            // Create the HTML string with proper escaping
            const title = pin.title ? escapeHtml(pin.title) : 'View on Pinterest';
            const description = pin.description ? escapeHtml(pin.description) : '';
            const imageAlt = pin.title ? escapeHtml(pin.title) : 'Pinterest Pin';
            
            slide.innerHTML = `
                <a href="${escapeHtml(pin.link)}" target="_blank" rel="noopener noreferrer" class="pin-link">
                    <div class="pin-image-container">
                        <img src="${escapeHtml(pin.imageUrl)}" 
                             alt="${imageAlt}" 
                             loading="lazy"
                             onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400/1a1a1a/00f5d4?text=Image+Not+Available';">
                        <div class="pin-overlay">
                            <h3>${title}</h3>
                            ${description ? `<p>${description}</p>` : ''}
                        </div>
                    </div>
                </a>
            `;
            pinterestFeed.appendChild(slide);
        });

        console.log('Initializing Swiper...');
        if (typeof Swiper !== 'undefined') {
            initSwipers();
            console.log('Swiper initialized successfully');
        } else {
            console.error('Swiper is not defined');
            throw new Error('Swiper library not loaded');
        }
    } catch (error) {
        console.error('Error loading Pinterest feed:', error);
        loadPlaceholderContent();
    }
};

// Helper function to escape HTML and prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Load placeholder content if Pinterest feed fails
const loadPlaceholderContent = () => {
    const pinterestFeed = document.getElementById('pinterest-feed');
    pinterestFeed.innerHTML = ''; // Clear any existing content
    
    const placeholderImages = [
        { title: 'Graphic Design', image: 'https://via.placeholder.com/600x400/1a1a1a/00f5d4?text=Graphic+Design' },
        { title: 'Brand Design', image: 'https://via.placeholder.com/600x400/1a1a1a/00f5d4?text=Brand+Design' },
        { title: 'UI/UX Design', image: 'https://via.placeholder.com/600x400/1a1a1a/00f5d4?text=UI/UX+Design' },
    ];

    placeholderImages.forEach(item => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `
            <div class="pin-image-container">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="pin-overlay">
                    <h3>${item.title}</h3>
                </div>
            </div>
        `;
        pinterestFeed.appendChild(slide);
    });

    initSwipers();
};

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Contact form handling
const contactForm = document.getElementById('contact-form');
const submitButton = contactForm.querySelector('button[type="submit"]');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable submit button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    try {
        const response = await fetch('/.netlify/functions/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            // Show success message
            showNotification('Message sent successfully! Check your email for confirmation.', 'success');
            contactForm.reset();
        } else {
            showNotification('Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        showNotification('Failed to send message. Please try again.', 'error');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
    }
});

// Notification system
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections and elements that should animate
document.querySelectorAll('section, .skill-category, .tool').forEach(el => {
    observer.observe(el);
});

// Maximum number of images per section
const MAX_IMAGES = {
    poster: 20,    // Maximum 20 poster designs
    graphic: 20,   // Maximum 20 graphic designs
    brand: 20      // Maximum 20 branding designs
};

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initSwipers();
    loadPinterestFeed();
    loadWorkImages('.poster-design-swiper', 'poster', MAX_IMAGES.poster);
    loadWorkImages('.graphic-design-swiper', 'graphic', MAX_IMAGES.graphic);
    loadWorkImages('.branding-swiper', 'brand', MAX_IMAGES.brand);
});

// Handle zoom modal close
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('.zoom-modal');
    const closeBtn = modal.querySelector('.close-button');

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});
