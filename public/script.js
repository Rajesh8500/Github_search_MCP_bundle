// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Add rotating animation
    themeToggle.classList.add('rotating');
    themeIcon.style.transform = 'scale(0.8)';
    
    // Create theme transition particles
    createThemeParticles(themeToggle, newTheme);
    
    // Wait for half rotation before changing icon
    setTimeout(() => {
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        themeIcon.style.transform = 'scale(1)';
    }, 300);
    
    // Remove rotation class after animation completes
    setTimeout(() => {
        themeToggle.classList.remove('rotating');
    }, 600);
}

function createThemeParticles(element, theme) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'theme-particle';
        
        const angle = (Math.PI * 2 * i) / 8;
        const velocity = 50 + Math.random() * 50;
        
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.setProperty('--x', `${Math.cos(angle) * velocity}px`);
        particle.style.setProperty('--y', `${Math.sin(angle) * velocity}px`);
        
        if (theme === 'light') {
            particle.style.background = '#fbbf24';
            particle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            particle.style.background = '#6366f1';
            particle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 800);
    }
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add no-transition class to prevent animations on load
    document.body.classList.add('no-transition');
    
    initTheme();
    
    // Initialize search mode to repo (default)
    switchSearchMode('repo');
    
    // Ensure repository results are hidden on load
    const repoResults = document.getElementById('repoResults');
    if (repoResults) {
        repoResults.classList.add('hidden');
        repoResults.style.display = 'none';
    }
    
    // Initialize interactive icons
    initInteractiveIcons();
    
    // Initialize typing animation for search inputs
    initTypingAnimation();
    
    // Remove no-transition class after a brief delay
    setTimeout(() => {
        document.body.classList.remove('no-transition');
    }, 100);
});

// Interactive Icons System
function initInteractiveIcons() {
    // Parallax effect for floating icons
    const floatingIcons = document.querySelectorAll('.floating-icon');
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        floatingIcons.forEach((icon) => {
            const speed = parseFloat(icon.dataset.speed) || 0.5;
            const x = (mouseX - 0.5) * 100 * speed;
            const y = (mouseY - 0.5) * 100 * speed;
            
            icon.style.transform = `translate(${x}px, ${y}px) scale(1)`;
        });
    });
    
    // Add ripple effect on button clicks
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            createRipple(e, this);
        });
    });
    
    // Add icon trail effect
    let mouseTrailActive = false;
    const iconTypes = ['fa-star', 'fa-heart', 'fa-code', 'fa-bolt', 'fa-fire'];
    
    document.addEventListener('mousedown', () => mouseTrailActive = true);
    document.addEventListener('mouseup', () => mouseTrailActive = false);
    
    document.addEventListener('mousemove', (e) => {
        if (mouseTrailActive && Math.random() > 0.9) {
            createIconTrail(e.clientX, e.clientY, iconTypes[Math.floor(Math.random() * iconTypes.length)]);
        }
    });
    
    // Enhance form interactions
    enhanceFormInteractions();
    
    // Add particle effects on successful actions
    addParticleEffects();
}

function createRipple(event, element) {
    const ripple = document.createElement('span');
    ripple.classList.add('icon-ripple');
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

function createIconTrail(x, y, iconClass) {
    const trail = document.createElement('i');
    trail.className = `fas ${iconClass} icon-trail active`;
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    trail.style.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    
    document.body.appendChild(trail);
    
    setTimeout(() => trail.remove(), 1000);
}

function enhanceFormInteractions() {
    // Add interactive hover effects to form inputs
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            const label = this.parentElement.querySelector('label');
            if (label) {
                const icon = label.querySelector('i');
                if (icon) {
                    icon.style.color = 'var(--accent-primary)';
                }
            }
        });
        
        input.addEventListener('blur', function() {
            const label = this.parentElement.querySelector('label');
            if (label) {
                const icon = label.querySelector('i');
                if (icon) {
                    icon.style.color = '';
                }
            }
        });
    });
    
    // Make labels clickable to focus inputs
    const labels = document.querySelectorAll('.form-group label');
    labels.forEach(label => {
        label.addEventListener('click', function(e) {
            // For integrated search, the input is inside the label
            const inputInside = this.querySelector('input');
            if (inputInside) {
                e.stopPropagation();
                inputInside.focus();
                return;
            }
            
            // For regular labels
            e.preventDefault();
            const input = this.parentElement.querySelector('input, select');
            if (input) {
                input.focus();
                // Create click ripple effect
                createRipple(e, this);
            }
        });
    });
}

function addParticleEffects() {
    // Override the existing showToast to add particles
    const originalShowToast = window.showToast;
    
    window.showToast = function(message, type = 'info') {
        originalShowToast(message, type);
        
        if (type === 'success') {
            createSuccessParticles();
        }
    };
}

function createSuccessParticles() {
    const container = document.createElement('div');
    container.className = 'success-particles';
    container.style.position = 'fixed';
    container.style.left = '50%';
    container.style.top = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.zIndex = '9999';
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const angle = (Math.PI * 2 * i) / 20;
        const velocity = 100 + Math.random() * 100;
        
        particle.style.setProperty('--x', `${Math.cos(angle) * velocity}px`);
        particle.style.setProperty('--y', `${Math.sin(angle) * velocity}px`);
        
        container.appendChild(particle);
    }
    
    document.body.appendChild(container);
    
    setTimeout(() => container.remove(), 1000);
}

// Add dynamic icon to search button when typing
document.addEventListener('DOMContentLoaded', function() {
    const searchInputs = document.querySelectorAll('input[type="text"], input[type="search"]');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchBtn = this.closest('form')?.querySelector('.search-btn');
            if (searchBtn && this.value.length > 0) {
                searchBtn.classList.add('pulse-animation');
            } else if (searchBtn) {
                searchBtn.classList.remove('pulse-animation');
            }
        });
    });
});

// Typing animation for search placeholders
function initTypingAnimation() {
    // Clear any existing animations first
    const existingInputs = document.querySelectorAll('input[data-typing-active]');
    existingInputs.forEach(input => {
        const animId = input.getAttribute('data-anim-id');
        if (animId) {
            clearInterval(animId);
        }
        input.removeAttribute('data-typing-active');
        input.removeAttribute('data-anim-id');
    });
    
    const inputs = document.querySelectorAll('input[data-typed-placeholder]');
    
    inputs.forEach(input => {
        // Skip if input is not visible
        if (input.offsetParent === null) return;
        
        const placeholder = input.getAttribute('data-typed-placeholder');
        if (!placeholder || input.hasAttribute('data-typing-active')) return;
        
        input.setAttribute('data-typing-active', 'true');
        
        let charIndex = 0;
        let isDeleting = false;
        let isPaused = false;
        let animationId = null;
        
        function typeChar() {
            if (input.value || !input.getAttribute('data-typing-active')) {
                clearInterval(animationId);
                return;
            }
            
            if (!isDeleting && charIndex < placeholder.length) {
                input.placeholder = placeholder.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === placeholder.length) {
                    isPaused = true;
                    clearInterval(animationId);
                    setTimeout(() => {
                        if (input.getAttribute('data-typing-active')) {
                            isPaused = false;
                            isDeleting = true;
                            animationId = setInterval(typeChar, 80); // Reduced frequency for performance
                            input.setAttribute('data-anim-id', animationId);
                            input.typingAnimationId = animationId;
                        }
                    }, 2000); // Pause at end
                }
            } else if (isDeleting && charIndex > 0) {
                input.placeholder = placeholder.substring(0, charIndex - 1);
                charIndex--;
                if (charIndex === 0) {
                    clearInterval(animationId);
                    isDeleting = false;
                    setTimeout(() => {
                        if (input.getAttribute('data-typing-active')) {
                            animationId = setInterval(typeChar, 120); // Reduced frequency for performance
                            input.setAttribute('data-anim-id', animationId);
                            input.typingAnimationId = animationId;
                        }
                    }, 500); // Pause before retyping
                }
            }
        }
        
        // Start typing after a delay
        setTimeout(() => {
            if (input.offsetParent !== null && input.getAttribute('data-typing-active')) {
                animationId = setInterval(typeChar, 120); // Reduced frequency for performance
                input.setAttribute('data-anim-id', animationId);
                input.typingAnimationId = animationId;
            }
        }, 500);
        
        // Stop animation when user starts typing
        input.addEventListener('input', function() {
            this.removeAttribute('data-typing-active');
            if (animationId) {
                clearInterval(animationId);
            }
            if (this.typingAnimationId) {
                clearInterval(this.typingAnimationId);
                this.typingAnimationId = null;
            }
            if (this.value) {
                this.placeholder = placeholder; // Show full placeholder
            }
        });
        
        // Store the animation ID on the element for cleanup
        input.typingAnimationId = animationId;
    });
    
    // Use MutationObserver to watch for removed inputs
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.removedNodes.forEach((node) => {
                // Check if the removed node is an input with typing animation
                if (node.nodeType === 1 && node.tagName === 'INPUT' && node.typingAnimationId) {
                    clearInterval(node.typingAnimationId);
                    node.removeAttribute('data-typing-active');
                }
                // Also check child elements
                if (node.nodeType === 1) {
                    const inputs = node.querySelectorAll('input[data-typing-active]');
                    inputs.forEach(input => {
                        if (input.typingAnimationId) {
                            clearInterval(input.typingAnimationId);
                            input.removeAttribute('data-typing-active');
                        }
                    });
                }
            });
        });
    });
    
    // Observe the entire document for removed nodes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

// Global variables
let currentResults = [];
let lastSearchData = null;
let selectedRepository = null;
let isSearching = false;
let currentEventSource = null;
let autoScroll = true;
let currentSearchMode = 'repo';

// Animation and UI enhancement variables
let particleAnimationId = null;
let particles = [];
let isParticleSystemActive = false;

// DOM Elements
const searchForm = document.getElementById('searchForm');
const loadingSpinner = document.getElementById('loadingSpinner');
let resultsModal = null;
let errorToast = null;
let successToast = null;

// Initialize the application with enhanced animations
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements after page load
    resultsModal = document.getElementById('resultsModal');
    errorToast = document.getElementById('errorToast');
    successToast = document.getElementById('successToast');
    
    setupEventListeners();
    initializeAnimations();
    addDynamicInteractions();
    startParticleSystem();
    console.log('GitHub Search MCP Web Interface loaded');
});

// Initialize modern animations and interactions
function initializeAnimations() {
    // Add entrance animations to all major sections
    const sections = document.querySelectorAll('.header, .search-mode-section, .search-section, .quick-actions');
    sections.forEach((section, index) => {
        if (section) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                section.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 200 * (index + 1));
        }
    });

    // Add dynamic focus animations to form inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.closest('.form-group')?.classList.add('focused');
            addFocusAnimation(this);
        });

        input.addEventListener('blur', function() {
            this.closest('.form-group')?.classList.remove('focused');
            removeFocusAnimation(this);
        });

        // Add typing animation
        input.addEventListener('input', function() {
            addTypingAnimation(this);
        });
    });

    // Add hover animations to buttons
    const buttons = document.querySelectorAll('button, .action-btn, .mode-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            addButtonHoverAnimation(this);
        });

        button.addEventListener('mouseleave', function() {
            removeButtonHoverAnimation(this);
        });

        button.addEventListener('click', function() {
            addButtonClickAnimation(this);
        });
    });
}

// Add dynamic particle system for background
function startParticleSystem() {
    if (isParticleSystemActive) return;
    
    isParticleSystemActive = true;
    const particleCount = window.innerWidth < 768 ? 30 : 50;
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.1,
            hue: Math.random() * 60 + 200 // Blue to purple range
        });
    }

    animateParticles();
}

function animateParticles() {
    // Create or update particle canvas
    let canvas = document.getElementById('particleCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'particleCanvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            opacity: 0.6;
        `;
        document.body.insertBefore(canvas, document.body.firstChild);
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Wrap around screen
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;

            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${particle.hue}, 70%, 80%, ${particle.opacity})`;
            ctx.fill();

            // Add glow effect
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${particle.hue}, 70%, 80%, ${particle.opacity * 0.1})`;
            ctx.fill();
        });

        particleAnimationId = requestAnimationFrame(animate);
    }

    animate();
}

// Add modern focus animations
function addFocusAnimation(element) {
    element.style.transform = 'scale(1.02)';
    element.style.boxShadow = '0 0 0 4px rgba(255, 255, 255, 0.15), 0 8px 30px rgba(0, 0, 0, 0.1)';
    
    // Create focus ring animation
    const focusRing = document.createElement('div');
    focusRing.className = 'focus-ring';
    focusRing.style.cssText = `
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 19px;
        pointer-events: none;
        animation: focusRingPulse 2s ease-in-out infinite;
    `;
    
    const formGroup = element.closest('.form-group');
    if (formGroup) {
        formGroup.style.position = 'relative';
        formGroup.appendChild(focusRing);
    }
}

function removeFocusAnimation(element) {
    element.style.transform = '';
    element.style.boxShadow = '';
    
    const focusRing = element.closest('.form-group')?.querySelector('.focus-ring');
    if (focusRing) {
        focusRing.remove();
    }
}

// Add typing animation effects
function addTypingAnimation(element) {
    element.style.borderColor = 'rgba(255, 255, 255, 0.6)';
    setTimeout(() => {
        element.style.borderColor = '';
    }, 150);
}

// Enhanced button animations
function addButtonHoverAnimation(button) {
    button.style.transform = 'translateY(-3px) scale(1.02)';
    button.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
    
    // Add ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'button-ripple';
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

function removeButtonHoverAnimation(button) {
    button.style.transform = '';
    button.style.boxShadow = '';
}

function addButtonClickAnimation(button) {
    button.style.transform = 'translateY(-1px) scale(0.98)';
    setTimeout(() => {
        button.style.transform = '';
    }, 150);
}

// Add dynamic interactions for better UX
function addDynamicInteractions() {
    // Add parallax effect to floating orbs
    document.addEventListener('mousemove', function(e) {
        const orbs = document.querySelectorAll('.orb');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 20;
            const y = (mouseY - 0.5) * speed * 20;
            
            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Add intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.action-btn, .form-group, .mode-btn').forEach(el => {
        observer.observe(el);
    });

    // Add CSS for scroll animations
    if (!document.getElementById('dynamicAnimationStyles')) {
        const style = document.createElement('style');
        style.id = 'dynamicAnimationStyles';
        style.textContent = `
            @keyframes focusRingPulse {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(1.05); }
            }
            
            @keyframes ripple {
                to { transform: scale(4); opacity: 0; }
            }
            
            @keyframes animate-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .animate-in {
                animation: animate-in 0.6s ease-out;
            }
            
            .form-group.focused {
                transform: translateY(-2px);
                transition: transform 0.3s ease;
            }
            
            .button-loading {
                position: relative;
                pointer-events: none;
            }
            
            .button-loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 20px;
                height: 20px;
                border: 2px solid transparent;
                border-top: 2px solid rgba(255, 255, 255, 0.7);
                border-radius: 50%;
                animation: button-spin 1s linear infinite;
            }
            
            @keyframes button-spin {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            
            @keyframes modalFadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            
            @keyframes modalFadeOut {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0.95); }
            }
            
            @keyframes toastSlideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes toastSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
            
            @keyframes toastShake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            @keyframes focusPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    // Add resize handler for particle system
    window.addEventListener('resize', function() {
        const canvas = document.getElementById('particleCanvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
}

// Enhanced loading states with animations
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const searchBtns = document.querySelectorAll('.search-btn');
    
    if (show) {
        spinner.classList.remove('hidden');
        spinner.style.animation = 'slideInFromBottom 0.5s ease-out';
        
        searchBtns.forEach(btn => {
            btn.classList.add('button-loading');
            btn.disabled = true;
        });
    } else {
        spinner.style.animation = 'slideOutToBottom 0.5s ease-out';
        setTimeout(() => {
            spinner.classList.add('hidden');
        }, 500);
        
        searchBtns.forEach(btn => {
            btn.classList.remove('button-loading');
            btn.disabled = false;
        });
    }
}

// Enhanced modal animations
function showModal() {
    if (resultsModal) {
        resultsModal.classList.remove('hidden');
        resultsModal.style.animation = 'modalFadeIn 0.3s ease-out';
        document.body.style.overflow = 'hidden';
        
        // Add backdrop blur animation
        setTimeout(() => {
            resultsModal.style.backdropFilter = 'blur(15px)';
        }, 100);
    }
}

function closeModal() {
    if (resultsModal) {
        resultsModal.style.animation = 'modalFadeOut 0.3s ease-out';
        setTimeout(() => {
            resultsModal.classList.add('hidden');
            resultsModal.style.backdropFilter = '';
            document.body.style.overflow = '';
            
            // Show reopen button if we have search results
            if (window.liveResults && window.liveResults.length > 0) {
                showReopenButton();
            }
        }, 300);
    }
}

// Enhanced modal functions
function toggleModalSize() {
    const modal = document.querySelector('.enhanced-modal');
    if (modal) {
        modal.classList.toggle('fullscreen');
    }
}

// Scroll to top of current tab
function scrollToTop() {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const scrollable = activeTab.querySelector('.content-scrollable');
        if (scrollable) {
            scrollable.scrollTop = 0;
        }
    }
}

// Scroll to bottom of current tab
function scrollToBottom() {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const scrollable = activeTab.querySelector('.content-scrollable');
        if (scrollable) {
            scrollable.scrollTop = scrollable.scrollHeight;
        }
    }
}

function showReopenButton() {
    const reopenButton = document.getElementById('reopenResultsButton');
    const lastSearchInfo = document.getElementById('lastSearchInfo');
    
    if (reopenButton && currentSearchData) {
        if (lastSearchInfo) {
                            lastSearchInfo.textContent = `${window.liveResults.length} results found • ${currentSearchData.repository}`;
        }
        reopenButton.classList.remove('hidden');
    }
}

function hideReopenButton() {
    const reopenButton = document.getElementById('reopenResultsButton');
    if (reopenButton) {
        reopenButton.classList.add('hidden');
    }
}

function reopenResults() {
    hideReopenButton();
    showModal();
    switchTab('results');
}

// Enhanced toast notifications with animations
function showSuccess(message) {
    if (successToast) {
        const messageEl = document.getElementById('successMessage');
        if (messageEl) {
            messageEl.textContent = message;
        }
        successToast.classList.remove('hidden');
        successToast.style.animation = 'toastSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            hideToast();
        }, 4000);
    }
}

function showError(message) {
    if (errorToast) {
        const messageEl = document.getElementById('errorMessage');
        if (messageEl) {
            messageEl.textContent = message;
        }
        errorToast.classList.remove('hidden');
        errorToast.style.animation = 'toastSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Add shake animation for errors
        setTimeout(() => {
            errorToast.style.animation = 'toastShake 0.5s ease-in-out';
        }, 400);
        
        setTimeout(() => {
            hideToast();
        }, 5000);
    }
}

function hideToast() {
    const toasts = document.querySelectorAll('.toast:not(.hidden)');
    toasts.forEach(toast => {
        toast.style.animation = 'toastSlideOut 0.3s ease-in';
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    });
}

// Setup event listeners with enhanced interactions
function setupEventListeners() {
    // Search form submissions
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
    
    const repoSearchForm = document.getElementById('repoSearchForm');
    if (repoSearchForm) {
        repoSearchForm.addEventListener('submit', handleRepoSearch);
    }
    
    // Public/Private search toggle
    const publicSearch = document.getElementById('publicSearch');
    const privateSearch = document.getElementById('privateSearch');
    const orgNameGroup = document.getElementById('orgNameGroup');
    
    if (publicSearch && privateSearch) {
        publicSearch.addEventListener('change', function() {
            if (this.checked && orgNameGroup) {
                orgNameGroup.classList.add('hidden');
                document.getElementById('orgName').removeAttribute('required');
            }
        });
        
        privateSearch.addEventListener('change', function() {
            if (this.checked && orgNameGroup) {
                orgNameGroup.classList.remove('hidden');
                document.getElementById('orgName').setAttribute('required', 'required');
                // Re-initialize typing animation for organization input
                initTypingAnimation();
            }
        });
    }
    
    // Tab switching functionality
    const resultsTabBtn = document.getElementById('resultsTabBtn');
    const progressTabBtn = document.getElementById('progressTabBtn');
    
    if (resultsTabBtn) {
        resultsTabBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            switchTab('results');
        });
    }
    
    if (progressTabBtn) {
        progressTabBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            switchTab('progress');
        });
    }
    
    // Close modal when clicking outside
    if (resultsModal) {
        resultsModal.addEventListener('click', function(e) {
            if (e.target === resultsModal) {
                closeModal();
            }
        });
    }
    
    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            hideToast();
        }
        if (e.ctrlKey && e.key === 'Enter') {
            if (!isSearching) {
                handleSearch(e);
            }
        }
        // Add new shortcuts
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            document.getElementById('keyword')?.focus();
        }
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            document.getElementById('repoKeyword')?.focus();
        }
    });
}

// Switch search mode with smooth transitions
function switchSearchMode(mode) {
    currentSearchMode = mode;
    
    const repoSection = document.getElementById('repoSearchSection');
    const codeSection = document.getElementById('codeSearchSection');
    const repoBtn = document.getElementById('repoSearchMode');
    const directBtn = document.getElementById('directSearchMode');
    const selectedRepoGroup = document.getElementById('selectedRepoGroup');
    const directRepoGroup = document.getElementById('directRepoGroup');
    const repositoryInput = document.getElementById('repository');
    const repoResults = document.getElementById('repoResults');
    
    // Enhanced transition animations
    if (mode === 'repo') {
        if (repoSection) {
            repoSection.style.animation = 'slideInFromLeft 0.5s ease-out';
            setTimeout(() => {
                repoSection.classList.remove('hidden');
                repoSection.style.display = 'block';
                // Re-initialize typing animation for Repository Search inputs
                initTypingAnimation();
            }, 250);
        }
        
        if (codeSection) {
            codeSection.style.animation = 'slideOutToRight 0.5s ease-out';
            setTimeout(() => {
                codeSection.classList.add('hidden');
                codeSection.style.display = 'none';
            }, 250);
        }
        
        // Show repository results only if they have content
        if (repoResults && repoResults.innerHTML.trim() !== '') {
            repoResults.classList.remove('hidden');
            repoResults.style.display = 'block';
        }
        
        repoBtn?.classList.add('active');
        directBtn?.classList.remove('active');
        
        // Reset repository input when switching to repo mode
        if (repositoryInput) {
            repositoryInput.removeAttribute('required');
            repositoryInput.disabled = true;
        }
        
        if (selectedRepoGroup) {
            selectedRepoGroup.style.display = 'none';
        }
        if (directRepoGroup) {
            directRepoGroup.style.display = 'none';
        }
    } else {
        if (codeSection) {
            codeSection.style.animation = 'slideInFromRight 0.5s ease-out';
            setTimeout(() => {
                codeSection.classList.remove('hidden');
                codeSection.style.display = 'block';
                // Re-initialize typing animation for Direct Search inputs
                initTypingAnimation();
            }, 250);
        }
        
        if (repoSection) {
            repoSection.style.animation = 'slideOutToLeft 0.5s ease-out';
            setTimeout(() => {
                repoSection.classList.add('hidden');
                repoSection.style.display = 'none'; // Hide repository search section in direct mode
            }, 250);
        }
        
        // Hide repository results in direct mode
        if (repoResults) {
            repoResults.classList.add('hidden');
            repoResults.style.display = 'none';
        }
        
        directBtn?.classList.add('active');
        repoBtn?.classList.remove('active');
        
        // Handle repository input based on whether a repository is selected
        if (selectedRepository) {
            // Repository is selected - use selected repo
            if (repositoryInput) {
                repositoryInput.value = selectedRepository.full_name;
                repositoryInput.removeAttribute('required');
                repositoryInput.disabled = true;
            }
            if (selectedRepoGroup) {
                selectedRepoGroup.style.display = 'block';
            }
            if (directRepoGroup) {
                directRepoGroup.style.display = 'none';
            }
        } else {
            // No repository selected - show direct input
            if (repositoryInput) {
                repositoryInput.value = '';
                repositoryInput.setAttribute('required', '');
                repositoryInput.disabled = false;
            }
            if (selectedRepoGroup) {
                selectedRepoGroup.style.display = 'none';
            }
            if (directRepoGroup) {
                directRepoGroup.style.display = 'block';
            }
        }
    }
}

// Handle search form submission with enhanced animations
async function handleSearch(e) {
    e.preventDefault();
    
    if (isSearching) {
        showError('Search already in progress. Please wait...');
        return;
    }
    
    if (!searchForm) return;
    
    // Disable HTML5 validation temporarily for better UX
    const originalNoValidate = searchForm.noValidate;
    searchForm.noValidate = true;
    
    const formData = new FormData(searchForm);
    
    // Restore validation setting
    searchForm.noValidate = originalNoValidate;
    const repository = selectedRepository ? 
        selectedRepository.full_name : 
        formData.get('repository')?.trim();
    
    const searchParams = {
        keyword: formData.get('keyword')?.trim() || '',
        repository: repository || '',
        options: {
            searchInFiles: formData.get('searchInFiles') === 'on',
            searchInFilenames: formData.get('searchInFilenames') === 'on',
            maxResults: parseInt(formData.get('maxResults')) || 50,
            fileExtensions: parseFileExtensions(formData.get('fileExtensions'))
        }
    };
    
    console.log('Search parameters:', searchParams);
    console.log('Selected repository:', selectedRepository);
    
    // Validate input
    if (!searchParams.keyword) {
        showError('Please enter a search keyword');
        return;
    }
    
    if (!searchParams.repository) {
        showError('Please enter a repository (owner/repo)');
        return;
    }
    
    if (!isValidRepository(searchParams.repository)) {
        showError('Repository format should be "owner/repository" (e.g., "microsoft/vscode")');
        return;
    }
    
    if (!searchParams.options.searchInFiles && !searchParams.options.searchInFilenames) {
        showError('Please select at least one search option (files or filenames)');
        return;
    }
    
    await performSearch(searchParams);
}

// Handle repository search
async function handleRepoSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const keyword = formData.get('repoKeyword')?.trim();
    const searchScope = formData.get('searchScope');
    const orgName = formData.get('orgName')?.trim();
    
    if (!keyword) {
        showError('Please enter a search keyword for repositories');
        return;
    }
    
    if (searchScope === 'private' && !orgName) {
        showError('Please enter an organization name for organization search');
        return;
    }
    
    // Show loading state
    showLoading(true);
    
    try {
        const requestBody = {
            keyword: keyword,
            scope: searchScope,
            organization: searchScope === 'private' ? orgName : null
        };
        
        const response = await fetch('/api/search/repositories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayRepositoryResults(data.repositories);
        
    } catch (error) {
        console.error('Repository search error:', error);
        showError(`Repository search failed: ${error.message}`);
    } finally {
        // Hide loading state
        showLoading(false);
    }
}

// Display repository results with enhanced animations
function displayRepositoryResults(repositories) {
    const resultsContainer = document.getElementById('repoResults');
    
    if (!resultsContainer) return;
    
    // Ensure we're in repo mode to see the results
    if (currentSearchMode !== 'repo') {
        switchSearchMode('repo');
    }
    
    if (!repositories || repositories.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No repositories found</h3>
                <p>Try different keywords or check your spelling</p>
            </div>
        `;
        resultsContainer.classList.remove('hidden');
        resultsContainer.style.display = 'block';
        return;
    }
    
    const resultsHtml = repositories.map((repo, index) => {
        const html = createRepositoryCard(repo);
        return `<div class="repo-card" style="animation: slideInFromBottom 0.5s ease-out ${index * 0.1}s both">${html}</div>`;
    }).join('');
    
    resultsContainer.innerHTML = `
        <div class="repo-results-header">
            <h3><i class="fab fa-github"></i> Found ${repositories.length} repositories</h3>
            <p>Click on a repository to select it for code search</p>
        </div>
        <div class="repo-grid">
            ${resultsHtml}
        </div>
    `;
    
    resultsContainer.classList.remove('hidden');
    resultsContainer.style.display = 'block';
    
    // Scroll to results with smooth animation
    setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// Create repository card with enhanced styling
function createRepositoryCard(repo) {
    const repoId = 'repo_' + Math.random().toString(36).substr(2, 9);
    const description = repo.description || 'No description available';
    const language = repo.language || 'Unknown';
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    
    window[repoId] = repo;
    
    return `
        <div class="repo-item" onclick="selectRepository('${repoId}')">
            <div class="repo-main-info">
                <div class="repo-name">
                    <i class="fab fa-github"></i>
                    ${escapeHtml(repo.full_name)}
                </div>
                <div class="repo-description">
                    ${escapeHtml(description)}
                </div>
                <div class="repo-stats">
                    <div class="repo-stat">
                        <i class="fas fa-code"></i>
                        ${escapeHtml(language)}
                    </div>
                    <div class="repo-stat">
                        <i class="fas fa-star"></i>
                        ${stars.toLocaleString()}
                    </div>
                    <div class="repo-stat">
                        <i class="fas fa-code-branch"></i>
                        ${forks.toLocaleString()} forks
                    </div>
                </div>
            </div>
            <div class="repo-actions">
                <button class="ai-summarizer-btn" onclick="event.stopPropagation(); openAISummarizer('${repoId}')" title="AI Summary">
                    <i class="fas fa-robot"></i>
                    AI Summary
                </button>
                <button class="repo-select-btn" onclick="event.stopPropagation(); selectRepository('${repoId}')">
                    <i class="fas fa-check"></i>
                    Select
                </button>
            </div>
        </div>
    `;
}

// Select a repository with enhanced animations
function selectRepository(repoId) {
    try {
        selectedRepository = window[repoId];
        
        if (!selectedRepository) {
            throw new Error('Repository data not found');
        }
        
        // Update selected repository display
        const selectedRepoName = document.getElementById('selectedRepoName');
        const selectedRepoDescription = document.getElementById('selectedRepoDescription');
        
        if (selectedRepoName) {
            selectedRepoName.textContent = selectedRepository.full_name;
        }
        
        if (selectedRepoDescription) {
            selectedRepoDescription.textContent = selectedRepository.description || 'No description available';
        }
        
        // Fix form validation issue - disable/hide direct repository input
        const repositoryInput = document.getElementById('repository');
        const directRepoGroup = document.getElementById('directRepoGroup');
        const selectedRepoGroup = document.getElementById('selectedRepoGroup');
        
        if (repositoryInput) {
            repositoryInput.removeAttribute('required');
            repositoryInput.value = selectedRepository.full_name;
            repositoryInput.disabled = true;
        }
        
        if (directRepoGroup) {
            directRepoGroup.style.display = 'none';
        }
        
        if (selectedRepoGroup) {
            selectedRepoGroup.style.display = 'block';
        }
        
        // Generate and display AI summary for selected repository
        generateRepoSummary(selectedRepository);
        
        // Switch to code search section with enhanced animation
        setTimeout(() => {
            switchSearchMode('direct');
            
            // Add success animation
            const selectedDisplay = document.getElementById('selectedRepoDisplay');
            if (selectedDisplay) {
                selectedDisplay.classList.add('pulse-success');
                setTimeout(() => {
                    selectedDisplay.classList.remove('pulse-success');
                }, 1000);
            }
            
            showSuccess(`Repository "${selectedRepository.full_name}" selected for code search`);
        }, 300);
        
    } catch (error) {
        console.error('Error selecting repository:', error);
        showError('Failed to select repository. Please try again.');
    }
}

// Generate AI summary for selected repository
async function generateRepoSummary(repo) {
    const summarySection = document.getElementById('repoSummarySection');
    const summaryText = document.getElementById('repoSummaryText');
    const summaryContent = document.getElementById('repoSummaryContent');
    
    if (!summarySection || !summaryText) return;
    
    summarySection.style.display = 'block';
    summaryContent.querySelector('.summary-loading').classList.remove('hidden');
    summaryText.textContent = '';
    
    try {
        const response = await fetch('/api/ai/repository-summary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                repository: repo.full_name,
                description: repo.description,
                language: repo.language,
                topics: repo.topics || []
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate summary');
        }
        
        const data = await response.json();
        summaryContent.querySelector('.summary-loading').classList.add('hidden');
        summaryText.textContent = data.summary;
        
    } catch (error) {
        console.error('Error generating summary:', error);
        summaryContent.querySelector('.summary-loading').classList.add('hidden');
        summaryText.textContent = 'Unable to generate AI summary at this time.';
    }
}

// Open AI Summarizer Modal
async function openAISummarizer(repoId) {
    const repo = window[repoId];
    if (!repo) {
        showError('Repository data not found');
        return;
    }
    
    const modal = document.getElementById('aiSummarizerModal');
    const repoNameEl = document.getElementById('aiRepoName');
    
    if (!modal) return;
    
    // Update modal title
    if (repoNameEl) {
        repoNameEl.textContent = repo.full_name;
    }
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Reset tabs
    switchAITab('overview');
    
    // Load AI analysis data
    loadAIOverview(repo);
    loadRepositoryStructure(repo);
    loadLanguagesAnalysis(repo);
}

// Close AI Modal
function closeAIModal() {
    const modal = document.getElementById('aiSummarizerModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Toggle AI Modal Size
function toggleAIModalSize() {
    const modalContent = document.querySelector('.ai-summarizer-modal');
    if (modalContent) {
        modalContent.classList.toggle('maximized');
    }
}

// Switch AI Modal Tabs
function switchAITab(tabName) {
    // Hide all tabs
    document.querySelectorAll('#aiSummarizerModal .tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('#aiSummarizerModal .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    const selectedBtn = document.getElementById(tabName + 'TabBtn');
    
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
}

// Load AI Overview
async function loadAIOverview(repo) {
    const loadingEl = document.getElementById('aiOverviewLoading');
    const contentEl = document.getElementById('aiOverviewContent');
    const summaryEl = document.getElementById('aiRepoSummary');
    const featuresEl = document.getElementById('aiKeyFeatures');
    const techDetailsEl = document.getElementById('aiTechnicalDetails');
    
    if (!loadingEl || !contentEl) return;
    
    loadingEl.classList.remove('hidden');
    contentEl.classList.add('hidden');
    
    try {
        const response = await fetch('/api/ai/repository-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                repository: repo.full_name,
                description: repo.description,
                language: repo.language,
                topics: repo.topics || [],
                stars: repo.stargazers_count,
                forks: repo.forks_count
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to analyze repository');
        }
        
        const data = await response.json();
        
        // Display summary
        if (summaryEl) {
            summaryEl.innerHTML = `<p>${data.summary || 'No summary available'}</p>`;
        }
        
        // Display key features
        if (featuresEl && data.features) {
            featuresEl.innerHTML = data.features.map(feature => 
                `<div class="feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>${escapeHtml(feature)}</span>
                </div>`
            ).join('');
        }
        
        // Display technical details
        if (techDetailsEl && data.technicalDetails) {
            techDetailsEl.innerHTML = `
                <div class="tech-detail-grid">
                    ${Object.entries(data.technicalDetails).map(([key, value]) => 
                        `<div class="tech-detail-item">
                            <span class="detail-label">${escapeHtml(key)}:</span>
                            <span class="detail-value">${escapeHtml(value)}</span>
                        </div>`
                    ).join('')}
                </div>
            `;
        }
        
        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading AI overview:', error);
        loadingEl.classList.add('hidden');
        if (summaryEl) {
            summaryEl.innerHTML = '<p class="error-message">Failed to load AI analysis. Please try again later.</p>';
        }
        contentEl.classList.remove('hidden');
    }
}

// Load Repository Structure
async function loadRepositoryStructure(repo) {
    const loadingEl = document.getElementById('aiStructureLoading');
    const contentEl = document.getElementById('aiStructureContent');
    const explorerEl = document.getElementById('fileExplorer');
    
    if (!loadingEl || !contentEl) return;
    
    loadingEl.classList.remove('hidden');
    contentEl.classList.add('hidden');
    
    try {
        const response = await fetch('/api/repository/structure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                repository: repo.full_name
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to load repository structure');
        }
        
        const data = await response.json();
        
        // Display file tree
        if (explorerEl && data.tree) {
            explorerEl.innerHTML = renderFileTree(data.tree, repo.full_name);
        }
        
        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading repository structure:', error);
        loadingEl.classList.add('hidden');
        if (explorerEl) {
            explorerEl.innerHTML = '<p class="error-message">Failed to load repository structure.</p>';
        }
        contentEl.classList.remove('hidden');
    }
}

// Render file tree recursively
function renderFileTree(tree, repoName, path = '') {
    if (!tree || tree.length === 0) return '';
    
    return `
        <ul class="file-tree">
            ${tree.map(item => {
                const fullPath = path ? `${path}/${item.name}` : item.name;
                const itemId = 'tree_' + Math.random().toString(36).substr(2, 9);
                
                if (item.type === 'dir' || item.type === 'tree') {
                    return `
                        <li class="tree-folder">
                            <span class="tree-item" onclick="toggleFolder('${itemId}')">
                                <i class="fas fa-folder"></i>
                                ${escapeHtml(item.name)}
                            </span>
                            <div class="tree-children hidden" id="${itemId}">
                                ${item.children ? renderFileTree(item.children, repoName, fullPath) : ''}
                            </div>
                        </li>
                    `;
                } else {
                    return `
                        <li class="tree-file">
                            <span class="tree-item" onclick="analyzeFile('${escapeHtml(repoName)}', '${escapeHtml(fullPath)}')">
                                <i class="${getFileIcon(item.name)}"></i>
                                ${escapeHtml(item.name)}
                            </span>
                        </li>
                    `;
                }
            }).join('')}
        </ul>
    `;
}

// Get appropriate icon for file type
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
        'js': 'fab fa-js-square',
        'ts': 'fab fa-js-square',
        'jsx': 'fab fa-react',
        'tsx': 'fab fa-react',
        'py': 'fab fa-python',
        'java': 'fab fa-java',
        'html': 'fab fa-html5',
        'css': 'fab fa-css3-alt',
        'json': 'fas fa-file-code',
        'md': 'fas fa-file-alt',
        'txt': 'fas fa-file-alt',
        'yml': 'fas fa-file-code',
        'yaml': 'fas fa-file-code',
        'xml': 'fas fa-file-code'
    };
    return iconMap[ext] || 'fas fa-file';
}

// Toggle folder visibility
function toggleFolder(folderId) {
    const folder = document.getElementById(folderId);
    if (folder) {
        folder.classList.toggle('hidden');
        const icon = folder.previousElementSibling.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-folder');
            icon.classList.toggle('fa-folder-open');
        }
    }
}

// Analyze file with AI
async function analyzeFile(repoName, filePath) {
    const panel = document.getElementById('fileSummaryPanel');
    const fileNameEl = document.getElementById('selectedFileName');
    const contentEl = document.getElementById('fileSummaryContent');
    const loadingEl = panel?.querySelector('.file-summary-loading');
    
    if (!panel || !contentEl) return;
    
    panel.classList.remove('hidden');
    fileNameEl.textContent = filePath;
    loadingEl?.classList.remove('hidden');
    contentEl.innerHTML = '';
    
    try {
        const response = await fetch('/api/ai/file-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                repository: repoName,
                filePath: filePath
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to analyze file');
        }
        
        const data = await response.json();
        
        loadingEl?.classList.add('hidden');
        contentEl.innerHTML = `
            <div class="file-analysis">
                <h5>Purpose</h5>
                <p>${escapeHtml(data.purpose || 'Unable to determine file purpose')}</p>
                
                <h5>Key Components</h5>
                <ul>
                    ${(data.components || []).map(comp => 
                        `<li>${escapeHtml(comp)}</li>`
                    ).join('')}
                </ul>
                
                <h5>Dependencies</h5>
                <p>${escapeHtml(data.dependencies || 'No dependencies identified')}</p>
            </div>
        `;
        
    } catch (error) {
        console.error('Error analyzing file:', error);
        loadingEl?.classList.add('hidden');
        contentEl.innerHTML = '<p class="error-message">Failed to analyze file.</p>';
    }
}

// Load Languages Analysis
async function loadLanguagesAnalysis(repo) {
    const loadingEl = document.getElementById('aiLanguagesLoading');
    const contentEl = document.getElementById('aiLanguagesContent');
    const chartEl = document.getElementById('languageChart');
    const listEl = document.getElementById('languagesList');
    
    if (!loadingEl || !contentEl) return;
    
    loadingEl.classList.remove('hidden');
    contentEl.classList.add('hidden');
    
    try {
        const response = await fetch('/api/repository/languages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                repository: repo.full_name
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to load languages');
        }
        
        const data = await response.json();
        
        // Display language chart
        if (chartEl && data.languages) {
            const total = Object.values(data.languages).reduce((a, b) => a + b, 0);
            const sortedLangs = Object.entries(data.languages)
                .sort((a, b) => b[1] - a[1]);
            
            chartEl.innerHTML = `
                <div class="language-bars">
                    ${sortedLangs.map(([lang, bytes]) => {
                        const percentage = ((bytes / total) * 100).toFixed(1);
                        return `
                            <div class="language-bar-container">
                                <div class="language-info">
                                    <span class="language-name">${escapeHtml(lang)}</span>
                                    <span class="language-percentage">${percentage}%</span>
                                </div>
                                <div class="language-bar-bg">
                                    <div class="language-bar" style="width: ${percentage}%; background-color: ${getLanguageColor(lang)}"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        // Display languages list with details
        if (listEl && data.languages) {
            const sortedLangs = Object.entries(data.languages)
                .sort((a, b) => b[1] - a[1]);
            
            listEl.innerHTML = `
                <div class="languages-grid">
                    ${sortedLangs.map(([lang, bytes]) => `
                        <div class="language-card">
                            <div class="language-icon" style="background-color: ${getLanguageColor(lang)}">
                                <i class="${getLanguageIcon(lang)}"></i>
                            </div>
                            <div class="language-details">
                                <h4>${escapeHtml(lang)}</h4>
                                <p>${formatBytes(bytes)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading languages:', error);
        loadingEl.classList.add('hidden');
        if (chartEl) {
            chartEl.innerHTML = '<p class="error-message">Failed to load language analysis.</p>';
        }
        contentEl.classList.remove('hidden');
    }
}

// Get language color
function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Python': '#3572A5',
        'Java': '#b07219',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'C++': '#f34b7d',
        'C': '#555555',
        'C#': '#178600',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Ruby': '#701516',
        'PHP': '#4F5D95',
        'Swift': '#ffac45',
        'Kotlin': '#F18E33'
    };
    return colors[language] || '#' + Math.floor(Math.random()*16777215).toString(16);
}

// Get language icon
function getLanguageIcon(language) {
    const icons = {
        'JavaScript': 'fab fa-js-square',
        'TypeScript': 'fab fa-js-square',
        'Python': 'fab fa-python',
        'Java': 'fab fa-java',
        'HTML': 'fab fa-html5',
        'CSS': 'fab fa-css3-alt',
        'PHP': 'fab fa-php',
        'Ruby': 'fas fa-gem',
        'Go': 'fas fa-code',
        'Rust': 'fas fa-cog',
        'Swift': 'fab fa-swift'
    };
    return icons[language] || 'fas fa-code';
}

// Format bytes to human readable
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Validate repository format
function isValidRepository(repo) {
    const repoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
    return repoPattern.test(repo);
}

// Parse file extensions from input
function parseFileExtensions(input) {
    if (!input || !input.trim()) return [];
    
    return input.split(',')
        .map(ext => ext.trim())
        .filter(ext => ext.length > 0)
        .map(ext => ext.startsWith('.') ? ext : '.' + ext);
}

// Perform the search with enhanced loading animations
async function performSearch(searchParams) {
    try {
        console.log('🔍 Starting search with params:', searchParams);
        
        // Initialize live results tracking
        currentSearchData = {
            keyword: searchParams.keyword,
            repository: searchParams.repository,
            timestamp: Date.now()
        };
        window.liveResults = []; // Reset results array
        
        console.log('🔧 [DEBUG] Initialized search data:', currentSearchData);
        console.log('🔧 [DEBUG] Reset liveResults array:', window.liveResults.length);
        
        isSearching = true;
        showLoading(true);
        
        // Update initial UI state
        updateResultCounts(); // Reset counts to 0
        updateSearchInfo('Starting search...');
        
        // Show modal and switch to progress tab immediately
        showModal();
        switchTab('progress');
        
        // Add initial progress message
        addProgressMessage('info', `🚀 Starting search for "${searchParams.keyword}" in ${searchParams.repository}...`);
        
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchParams)
        });
        
        console.log('🔍 Search API response:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('🔍 Search response data:', responseData);
        
        if (responseData.success) {
            console.log('🔍 Search started successfully, searchId:', responseData.searchId);
            setupEventStream(responseData);
        } else {
            throw new Error(responseData.error || 'Search failed');
        }
        
    } catch (error) {
        console.error('❌ Search error:', error);
        addProgressMessage('error', `❌ Search failed: ${error.message}`);
        showError(`Search failed: ${error.message}`);
        isSearching = false;
        showLoading(false);
    }
}

// Setup SSE connection for real-time search progress
function setupEventStream(response) {
    const searchId = response.searchId;
    console.log('🔧 Setting up SSE for searchId:', searchId);
    
    showLoading(true);
    
    // Ensure modal is visible
    const modal = document.getElementById('resultsModal');
    if (modal && modal.classList.contains('hidden')) {
        showModal();
        switchTab('progress');
    }
    
    // Connect to SSE endpoint
    const sseUrl = `/api/search/progress/${searchId}`;
    console.log('🔧 Connecting to SSE endpoint:', sseUrl);
    
    const eventSource = new EventSource(sseUrl);
    
    eventSource.onopen = function(event) {
        console.log('✅ SSE connection opened');
        addProgressMessage('success', '🔗 Connected to search progress stream');
    };
    
    eventSource.onmessage = function(event) {
        try {
            console.log('📨 SSE message received:', event.data);
            const data = JSON.parse(event.data);
            console.log('📨 Parsed SSE data:', data);
            
            // Ensure modal is visible for incoming data
            if (modal && modal.classList.contains('hidden')) {
                showModal();
                switchTab('progress');
            }
            
            switch(data.type) {
                case 'connected':
                case 'start':
                    addProgressMessage('success', data.message, data);
                    break;
                case 'info':
                    addProgressMessage('info', data.message, data);
                    break;
                case 'progress':
                    addProgressMessage('progress', data.message, data);
                    break;
                case 'branch':
                    addProgressMessage('branch', data.message, data);
                    if (data.branchIndex && data.totalBranches && data.branchName) {
                        updateSearchStatus(data.branchIndex, data.totalBranches, data.branchName);
                    }
                    break;
                case 'results':
                    addProgressMessage('results', data.message, data);
                    break;
                case 'warning':
                    addProgressMessage('warning', data.message, data);
                    break;
                case 'match':
                    console.log('📄 Processing match result:', data.result);
                    addProgressMessage('match', data.message, data);
                    if (data.result) {
                        addLiveResult(data.result);
                    }
                    break;
                case 'complete':
                    console.log('✅ Search complete, finalizing results...');
                    addProgressMessage('success', data.message, data);
                    finalizeSearchResults();
                    break;
                case 'success':
                    addProgressMessage('success', data.message, data);
                    showLoading(false);
                    isSearching = false;
                    break;
                case 'error':
                    addProgressMessage('error', data.message, data);
                    showLoading(false);
                    isSearching = false;
                    showError(data.message);
                    break;
                case 'close':
                    addProgressMessage('info', data.message, data);
                    eventSource.close();
                    showLoading(false);
                    isSearching = false;
                    break;
                default:
                    console.log('❓ Unknown SSE message type:', data.type);
                    addProgressMessage('info', data.message || 'Unknown message', data);
            }
            
            scrollProgressToBottom();
            
        } catch (error) {
            console.error('❌ Error parsing SSE data:', error);
            console.error('❌ Raw event data:', event.data);
            addProgressMessage('error', `Error parsing progress data: ${error.message}`);
        }
    };
    
    eventSource.onerror = function(error) {
        console.error('❌ SSE connection error:', error);
        addProgressMessage('error', `❌ Connection to progress stream lost`);
        
        if (eventSource.readyState === EventSource.CLOSED) {
            addProgressMessage('error', '💔 SSE connection closed');
            showLoading(false);
            isSearching = false;
        }
    };
    
    // Store for cleanup
    window.currentEventSource = eventSource;
}

// Quick action functions
function fillExample(keyword, repository) {
    switchSearchMode('direct');
    
    setTimeout(() => {
        const keywordInput = document.getElementById('keyword');
        const repositoryInput = document.getElementById('repository');
        
        if (keywordInput) {
            keywordInput.value = keyword;
            keywordInput.style.animation = 'focusPulse 0.5s ease-out';
        }
        
        if (repositoryInput) {
            repositoryInput.value = repository;
            repositoryInput.style.animation = 'focusPulse 0.5s ease-out';
        }
        
        showSuccess(`Example filled: searching for "${keyword}" in ${repository}`);
    }, 300);
}

function searchRepoExample(keyword) {
    switchSearchMode('repo');
    
    setTimeout(() => {
        const repoKeywordInput = document.getElementById('repoKeyword');
        if (repoKeywordInput) {
            repoKeywordInput.value = keyword;
            repoKeywordInput.focus();
            repoKeywordInput.style.animation = 'focusPulse 0.5s ease-out';
        }
        
        showSuccess(`Repository search filled: "${keyword}"`);
    }, 300);
}

function clearForm() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="search"], select');
    inputs.forEach(input => {
        if (input.type !== 'checkbox') {
            input.value = '';
            input.style.animation = 'focusPulse 0.3s ease-out';
            // Reset validation attributes
            input.disabled = false;
            if (input.id === 'repository') {
                input.setAttribute('required', '');
            }
        }
    });
    
    // Clear selected repository
    selectedRepository = null;
    
    // Reset repository input visibility
    const selectedRepoGroup = document.getElementById('selectedRepoGroup');
    const directRepoGroup = document.getElementById('directRepoGroup');
    
    if (selectedRepoGroup) {
        selectedRepoGroup.style.display = 'none';
    }
    
    if (directRepoGroup && currentSearchMode === 'direct') {
        directRepoGroup.style.display = 'block';
    }
    
    // Switch back to repository search mode
    switchSearchMode('repo');
    
    showSuccess('Form cleared');
}

// Clear direct search form data
function clearDirectSearchForm() {
    const form = document.getElementById('searchForm');
    if (form) {
        form.reset();
        
        // Add a pulse animation to the clear button
        const clearBtn = document.querySelector('#codeSearchSection .floating-clear-btn');
        if (clearBtn) {
            clearBtn.style.animation = 'pulse 0.5s ease-out';
            setTimeout(() => {
                clearBtn.style.animation = '';
            }, 500);
        }
        
        // Reset selected repository if any
        selectedRepository = null;
        const selectedRepoGroup = document.getElementById('selectedRepoGroup');
        const directRepoGroup = document.getElementById('directRepoGroup');
        
        if (selectedRepoGroup) {
            selectedRepoGroup.style.display = 'none';
        }
        
        if (directRepoGroup) {
            directRepoGroup.style.display = 'block';
        }
        
        // Focus on the keyword input after clearing
        const keywordInput = document.getElementById('keyword');
        if (keywordInput) {
            keywordInput.focus();
        }
        
        showSuccess('Direct search form cleared');
    }
}

// Simple test function for modal and progress log
function testProgressLog() {
    const modal = document.getElementById('resultsModal');
    const progressLog = document.getElementById('progressLog');
    
    if (!modal || !progressLog) {
        alert('Required elements not found');
        return;
    }
    
    // Open modal
    modal.classList.remove('hidden');
    switchTab('progress');
    
    // Add test messages
    addProgressMessage('info', '🧪 Testing Progress Log functionality');
    addProgressMessage('success', '✅ Modal and Progress Log working');
    addProgressMessage('warning', '⚠️ Sample warning message');
    addProgressMessage('error', '❌ Sample error message');
}

function testBasicModal() {
    testProgressLog();
}

function forceOpenModal() {
    testProgressLog();
}

// Test function for manual testing
window.testAnimations = function() {
    console.log('Testing enhanced animations...');
    showSuccess('Testing success toast');
    setTimeout(() => showError('Testing error toast'), 2000);
    setTimeout(() => {
        showModal();
        setTimeout(() => closeModal(), 3000);
    }, 4000);
};

// Test function to debug progress log UI
window.testProgressLog = function() {
    console.log('🧪 Testing progress log UI...');
    
    // Check if elements exist
    const modal = document.getElementById('modal');
    const progressLog = document.getElementById('progressLog');
    const resultsContainer = document.getElementById('resultsContainer');
    
    console.log('🧪 Modal element:', modal);
    console.log('🧪 Progress log element:', progressLog);
    console.log('🧪 Results container:', resultsContainer);
    
    // Show modal if not visible
    if (modal && !modal.classList.contains('show')) {
        console.log('🧪 Showing modal...');
        showModal();
    }
    
    // Switch to progress tab
    console.log('🧪 Switching to progress tab...');
    switchTab('progress');
    
    // Add test messages
    console.log('🧪 Adding test messages...');
    addProgressMessage('info', '🧪 Test info message');
    addProgressMessage('success', '🧪 Test success message');
    addProgressMessage('warning', '🧪 Test warning message');
    addProgressMessage('error', '🧪 Test error message');
    addProgressMessage('branch', '🧪 Test branch message', { 
        branchIndex: 1, 
        totalBranches: 5, 
        branchName: 'main',
        consoleLog: {
            timestamp: Date.now(),
            level: 'BRANCH',
            message: '[test] [BRANCH] Testing branch message',
            data: { test: 'data', branchName: 'main' }
        }
    });
    
    console.log('🧪 Test complete! Check the progress tab in the modal.');
};

// Test function for SSE connection
window.testSSE = function() {
    console.log('🧪 Testing SSE connection...');
    
    // Show modal and switch to progress tab for testing
    showModal();
    switchTab('progress');
    
    addProgressMessage('info', '🧪 Starting SSE connection test...');
    
    const testId = 'test-' + Date.now();
    const eventSource = new EventSource(`/api/test-sse/${testId}`);
    
    eventSource.onopen = function() {
        console.log('🧪 Test SSE connection opened');
        addProgressMessage('success', '🧪 Test SSE connection opened successfully');
    };
    
    eventSource.onmessage = function(event) {
        console.log('🧪 Test SSE message received:', event.data);
        try {
            const data = JSON.parse(event.data);
            addProgressMessage('info', data.message, data);
            
            if (data.type === 'test-complete') {
                addProgressMessage('success', '🧪 SSE test completed successfully!');
                setTimeout(() => eventSource.close(), 1000);
            }
        } catch (error) {
            console.error('🧪 Error parsing test SSE data:', error);
            addProgressMessage('error', '🧪 Error parsing test SSE data');
        }
    };
    
    eventSource.onerror = function(error) {
        console.log('🧪 Test SSE error:', error);
        addProgressMessage('error', '🧪 Test SSE connection error');
        eventSource.close();
    };
    
    setTimeout(() => {
        if (eventSource.readyState !== EventSource.CLOSED) {
            console.log('🧪 Force closing test SSE connection...');
            eventSource.close();
        }
    }, 10000);
};

// Comprehensive test function for debugging the search flow
window.testSearchFlow = function() {
    console.log('🧪 [TEST] Starting comprehensive search flow test...');
    
    // Show modal and switch to progress tab
    showModal();
    switchTab('progress');
    
    addProgressMessage('info', '🧪 [TEST] Starting search flow test...');
    
    const testSearchParams = {
        keyword: 'test',
        repository: 'microsoft/vscode',
        options: {
            searchInFiles: true,
            searchInFilenames: false,
            maxResults: 5
        }
    };
    
    addProgressMessage('info', '🧪 [TEST] Step 1: Calling /api/search endpoint...');
    console.log('🧪 [TEST] Sending search request:', testSearchParams);
    
    fetch('/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testSearchParams)
    })
    .then(response => {
        console.log('🧪 [TEST] Search API response received:', response);
        addProgressMessage('success', `🧪 [TEST] Search API responded with status ${response.status}`);
        return response.json();
    })
    .then(responseData => {
        console.log('🧪 [TEST] Search response data:', responseData);
        addProgressMessage('info', `🧪 [TEST] Got searchId: ${responseData.searchId}`);
        
        if (responseData.success && responseData.searchId) {
            addProgressMessage('info', '🧪 [TEST] Step 2: Setting up SSE connection...');
            
            // Manual SSE connection test
            const searchId = responseData.searchId;
            const sseUrl = `/api/search/progress/${searchId}`;
            
            addProgressMessage('info', `🧪 [TEST] Connecting to: ${sseUrl}`);
            console.log('🧪 [TEST] Creating EventSource for:', sseUrl);
            
            const eventSource = new EventSource(sseUrl);
            
            eventSource.onopen = function(event) {
                console.log('🧪 [TEST] SSE connection opened!', event);
                addProgressMessage('success', '🧪 [TEST] SSE connection opened successfully!');
            };
            
            eventSource.onmessage = function(event) {
                console.log('🧪 [TEST] SSE message received:', event.data);
                try {
                    const data = JSON.parse(event.data);
                    addProgressMessage('info', `🧪 [TEST] SSE Message: ${data.type} - ${data.message}`, data);
                } catch (error) {
                    addProgressMessage('error', `🧪 [TEST] Error parsing SSE data: ${error.message}`);
                }
            };
            
            eventSource.onerror = function(error) {
                console.error('🧪 [TEST] SSE error:', error);
                addProgressMessage('error', `🧪 [TEST] SSE connection error (readyState: ${eventSource.readyState})`);
            };
            
            // Close connection after 15 seconds
            setTimeout(() => {
                console.log('🧪 [TEST] Closing test SSE connection...');
                addProgressMessage('info', '🧪 [TEST] Closing SSE connection...');
                eventSource.close();
            }, 15000);
            
        } else {
            addProgressMessage('error', '🧪 [TEST] Search API failed or missing searchId');
        }
    })
    .catch(error => {
        console.error('🧪 [TEST] Search API error:', error);
        addProgressMessage('error', `🧪 [TEST] Search API error: ${error.message}`);
    });
};

// Simple connection test without search
window.testDirectSSE = function() {
    console.log('🧪 [TEST] Testing direct SSE connection...');
    
    showModal();
    switchTab('progress');
    
    addProgressMessage('info', '🧪 [TEST] Testing direct SSE connection...');
    
    const testSearchId = 'direct-test-' + Date.now();
    const sseUrl = `/api/search/progress/${testSearchId}`;
    
    console.log('🧪 [TEST] Connecting to SSE endpoint:', sseUrl);
    addProgressMessage('info', `🧪 [TEST] Connecting to: ${sseUrl}`);
    
    const eventSource = new EventSource(sseUrl);
    
    eventSource.onopen = function(event) {
        console.log('🧪 [TEST] Direct SSE opened:', event);
        addProgressMessage('success', '🧪 [TEST] Direct SSE connection opened!');
    };
    
    eventSource.onmessage = function(event) {
        console.log('🧪 [TEST] Direct SSE message:', event.data);
        try {
            const data = JSON.parse(event.data);
            addProgressMessage('info', `🧪 [TEST] Message: ${data.type} - ${data.message}`, data);
        } catch (error) {
            addProgressMessage('error', `🧪 [TEST] Parse error: ${error.message}`);
        }
    };
    
    eventSource.onerror = function(error) {
        console.error('🧪 [TEST] Direct SSE error:', error);
        addProgressMessage('error', `🧪 [TEST] Direct SSE error (readyState: ${eventSource.readyState})`);
    };
    
    setTimeout(() => {
        console.log('🧪 [TEST] Closing direct SSE...');
        eventSource.close();
        addProgressMessage('info', '🧪 [TEST] Direct SSE test completed');
    }, 10000);
};

// Simple DOM test function
window.testDOM = function() {
    console.log('🧪 [DOM-TEST] Testing DOM elements...');
    
    const elements = {
        modal: document.getElementById('modal'),
        progressLog: document.getElementById('progressLog'),
        progressBadge: document.getElementById('progressBadge'),
        resultsContainer: document.getElementById('resultsContainer'),
        searchSummary: document.getElementById('searchSummary'),
        resultsTab: document.getElementById('resultsTab'),
        progressTab: document.getElementById('progressTab')
    };
    
    console.log('🧪 [DOM-TEST] Element check results:');
    for (const [name, element] of Object.entries(elements)) {
        const exists = element !== null;
        const hasClassList = element && typeof element.classList !== 'undefined';
        console.log(`  ${name}: ${exists ? '✅' : '❌'} exists, classList: ${hasClassList ? '✅' : '❌'}`);
        
        if (element) {
            console.log(`    - tagName: ${element.tagName}`);
            console.log(`    - id: ${element.id}`);
            console.log(`    - className: ${element.className}`);
        }
    }
    
    // Test basic modal operations
    console.log('🧪 [DOM-TEST] Testing modal operations...');
    try {
        if (elements.modal) {
            console.log(`  Modal initial classes: ${elements.modal.className}`);
            console.log(`  Modal has 'show' class: ${elements.modal.classList.contains('show')}`);
            
            // Try to show modal
            if (typeof showModal === 'function') {
                console.log('  Attempting to show modal...');
                showModal();
                console.log(`  Modal classes after showModal(): ${elements.modal.className}`);
            } else {
                console.log('  ❌ showModal function not found');
            }
        }
    } catch (error) {
        console.error('❌ [DOM-TEST] Error testing modal:', error);
    }
    
    // Test addProgressMessage
    console.log('🧪 [DOM-TEST] Testing addProgressMessage...');
    try {
        addProgressMessage('info', '🧪 DOM test message');
        console.log('  ✅ addProgressMessage worked');
    } catch (error) {
        console.error('  ❌ addProgressMessage failed:', error);
    }
    
    console.log('🧪 [DOM-TEST] DOM test completed');
};

// Scroll progress log to bottom
function scrollProgressToBottom() {
    const progressLog = document.getElementById('progressLog');
    if (progressLog) {
        progressLog.scrollTop = progressLog.scrollHeight;
    }
}

// Display search results
function displaySearchResults(results, searchData = {}) {
    const resultsContainer = document.getElementById('resultsContainer');
    const searchSummary = document.getElementById('searchSummary');
    
    if (!resultsContainer || !results) return;
    
    // Update search summary
    if (searchSummary) {
        searchSummary.innerHTML = `
            <div class="search-summary-card">
                <h3>🔍 Search Results</h3>
                <div class="summary-stats">
                    <div class="stat">
                        <span class="stat-number">${results.length}</span>
                        <span class="stat-label">Total Results</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${searchData.keyword || 'N/A'}</span>
                        <span class="stat-label">Keyword</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${searchData.repository || 'N/A'}</span>
                        <span class="stat-label">Repository</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>Try different keywords or check your search options</p>
            </div>
        `;
        return;
    }
    
    // Group results by branch
    const resultsByBranch = {};
    results.forEach(result => {
        const branch = result.branch || 'main';
        if (!resultsByBranch[branch]) {
            resultsByBranch[branch] = [];
        }
        resultsByBranch[branch].push(result);
    });
    
    let resultsHtml = '';
    Object.keys(resultsByBranch).forEach(branch => {
        const branchResults = resultsByBranch[branch];
        resultsHtml += `
            <div class="branch-section">
                <div class="branch-header">
                    <h4><i class="fas fa-code-branch"></i> ${escapeHtml(branch)} (${branchResults.length} results)</h4>
                </div>
                <div class="branch-results">
        `;
        
        branchResults.forEach((result, index) => {
            resultsHtml += createResultCard(result, index);
        });
        
        resultsHtml += `
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = resultsHtml;
    
    // Switch to results tab
    switchTab('results');
    
    // Add animation class
    setTimeout(() => {
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-in');
            }, index * 100);
        });
    }, 100);
}

// Create individual result card
function createResultCard(result, index) {
    const fileName = result.fileName || result.file || 'Unknown file';
    const content = result.content || result.match || '';
    const lineNumber = result.lineNumber || result.line || '';
    const url = result.url || '#';
    
    return `
        <div class="result-card" style="animation-delay: ${index * 0.1}s">
            <div class="result-header">
                <div class="result-file">
                    <i class="fas fa-file-code"></i>
                    <span class="file-name">${escapeHtml(fileName)}</span>
                    ${lineNumber ? `<span class="line-number">Line ${lineNumber}</span>` : ''}
                </div>
                <a href="${url}" target="_blank" class="result-link">
                    <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
            <div class="result-content">
                <pre><code>${escapeHtml(content)}</code></pre>
            </div>
        </div>
    `;
}

// Clear progress log
function clearProgressLog() {
    const progressLog = document.getElementById('progressLog');
    if (progressLog) {
        progressLog.innerHTML = '';
    }
    
    const progressBadge = document.getElementById('progressBadge');
    if (progressBadge) {
        progressBadge.style.display = 'none';
    }
}

// Toggle auto scroll
function toggleAutoScroll() {
    autoScroll = !autoScroll;
    const autoScrollBtn = document.getElementById('autoScrollBtn');
    if (autoScrollBtn) {
        if (autoScroll) {
            autoScrollBtn.classList.add('active');
            autoScrollBtn.innerHTML = '<i class="fas fa-arrow-down"></i> Auto Scroll';
        } else {
            autoScrollBtn.classList.remove('active');
            autoScrollBtn.innerHTML = '<i class="fas fa-pause"></i> Manual';
        }
    }
}

// Live result management
window.liveResults = [];
let currentSearchData = {};

// Update search status in the results tab
function updateSearchStatus(branchIndex, totalBranches, branchName) {
    const searchSummary = document.getElementById('searchSummary');
    if (!searchSummary) return;
    
    const progress = Math.round((branchIndex / totalBranches) * 100);
    
    searchSummary.innerHTML = `
        <div class="search-summary-card">
            <h3>🔍 Search in Progress</h3>
            <div class="search-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">
                    Searching branch ${branchIndex}/${totalBranches}: ${branchName}
                </div>
            </div>
            <div class="summary-stats">
                <div class="stat">
                                            <span class="stat-number">${window.liveResults.length}</span>
                    <span class="stat-label">Results Found</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${currentSearchData.keyword || 'N/A'}</span>
                    <span class="stat-label">Keyword</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${currentSearchData.repository || 'N/A'}</span>
                    <span class="stat-label">Repository</span>
                </div>
            </div>
        </div>
    `;
}

// Add individual result as it comes in
function addLiveResult(result) {
    if (!result) {
        console.warn('⚠️ [DEBUG] addLiveResult called with null/undefined result');
        return;
    }
    
    console.log('📄 [DEBUG] Adding live result:', result);
    
    // Add to live results array
    window.liveResults.push(result);
    
    console.log('📄 [DEBUG] Live results count now:', window.liveResults.length);
    
    // Update result counts in real-time
    updateResultCounts();
    
    // Update results count message
    const resultsCount = window.liveResults.length;
    addProgressMessage('results', `📄 Found match: ${result.filePath} in ${result.branch} (${resultsCount} total)`);
    
    // Update search info
    updateSearchInfo(`Found ${resultsCount} results so far...`);
}

// Create result card content
function createResultCardContent(result, index) {
    const fileName = result.filePath || result.file || 'Unknown file';
    const content = result.context || result.match || '';
    const lineNumber = result.lineNumber || result.line || '';
    const url = result.url || '#';
    const branch = result.branch || result.branchInfo?.name || 'unknown';
    
    return `
        <div class="result-header">
            <div class="result-file">
                <i class="fas fa-file-code"></i>
                <span class="file-name">${escapeHtml(fileName)}</span>
                ${lineNumber ? `<span class="line-number">Line ${lineNumber}</span>` : ''}
                <span class="branch-tag">${escapeHtml(branch)}</span>
            </div>
            <a href="${url}" target="_blank" class="result-link" title="Open in GitHub">
                <i class="fas fa-external-link-alt"></i>
            </a>
        </div>
        <div class="result-content">
            <pre><code>${escapeHtml(content)}</code></pre>
        </div>
    `;
}

// Finalize search results when complete
function finalizeSearchResults() {
    console.log('🏁 [DEBUG] Finalizing search results...');
    console.log('🏁 [DEBUG] liveResults:', window.liveResults);
    console.log('🏁 [DEBUG] liveResults length:', window.liveResults ? window.liveResults.length : 'null');
    
    if (!window.liveResults || window.liveResults.length === 0) {
        console.log('❌ [DEBUG] No results to finalize');
        addProgressMessage('info', '📭 No results found');
        updateSearchInfo('No results found');
        updateResultCounts();
        return;
    }

    console.log('✅ [DEBUG] Processing', window.liveResults.length, 'results');
    
    // Group results by branch
    const resultsByBranch = {};
    window.liveResults.forEach(result => {
        if (!resultsByBranch[result.branch]) {
            resultsByBranch[result.branch] = [];
        }
        resultsByBranch[result.branch].push(result);
    });

    console.log('🌿 [DEBUG] Results grouped by branch:', Object.keys(resultsByBranch));
    console.log('🌿 [DEBUG] Branch counts:', Object.entries(resultsByBranch).map(([branch, results]) => `${branch}: ${results.length}`));

    // Display results in the Results tab
    const resultsContainer = document.getElementById('resultsContainer');
    const searchSummary = document.getElementById('searchSummary');
    
    console.log('📦 [DEBUG] Results container found:', !!resultsContainer);
    console.log('📊 [DEBUG] Search summary found:', !!searchSummary);
    
    if (searchSummary) {
        const summaryHTML = `
            <div class="search-summary">
                <div class="summary-header">
                    <h3><i class="fas fa-search-plus"></i> Search Complete</h3>
                    <div class="summary-stats">
                        <div class="stat-item">
                            <span class="stat-number">${window.liveResults.length}</span>
                            <span class="stat-label">Total Matches</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${Object.keys(resultsByBranch).length}</span>
                            <span class="stat-label">Branches</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${currentSearchData?.repository || 'Unknown'}</span>
                            <span class="stat-label">Repository</span>
                        </div>
                    </div>
                </div>
                <div class="search-details">
                    <p><strong>Keyword:</strong> "${currentSearchData?.keyword || 'Unknown'}"</p>
                    <p><strong>Search completed at:</strong> ${new Date().toLocaleTimeString()}</p>
                </div>
            </div>
        `;
        
        console.log('📊 [DEBUG] Setting summary HTML');
        searchSummary.innerHTML = summaryHTML;
    }
    
    if (resultsContainer) {
        console.log('📦 [DEBUG] Building results HTML...');
        let resultsHTML = '';
        
        // Sort branches by result count (descending)
        const sortedBranches = Object.entries(resultsByBranch)
            .sort(([,a], [,b]) => b.length - a.length);
        
        console.log('📦 [DEBUG] Processing', sortedBranches.length, 'branches in order');
        
        for (const [branch, results] of sortedBranches) {
            console.log(`📦 [DEBUG] Processing branch ${branch} with ${results.length} results`);
            resultsHTML += `
                <div class="branch-section">
                    <h4 class="branch-header">
                        🌿 ${branch} 
                        <span class="branch-count">${results.length} matches</span>
                    </h4>
                    <div class="results-list">
            `;
            
            // Sort results by score (descending)
            const sortedResults = results.sort((a, b) => (b.score || 0) - (a.score || 0));
            
            sortedResults.forEach((result, index) => {
                resultsHTML += `
                    <div class="result-item" data-index="${index}">
                        <div class="result-header">
                            <a href="${result.url}" target="_blank" class="result-link" title="Open in GitHub">
                                📄 ${result.filePath}
                            </a>
                            <div class="result-badges">
                                <span class="result-type">${result.matchType}</span>
                                ${result.score ? `<span class="result-score">Score: ${result.score}</span>` : ''}
                            </div>
                        </div>
                        ${result.lineNumber ? `<div class="result-line">📍 Line ${result.lineNumber}</div>` : ''}
                        ${result.context ? `<div class="result-context">${escapeHtml(result.context)}</div>` : ''}
                    </div>
                `;
            });
            
            resultsHTML += `
                    </div>
                </div>
            `;
        }
        
        console.log('📦 [DEBUG] Setting results HTML (length:', resultsHTML.length, ')');
        resultsContainer.innerHTML = resultsHTML;
        console.log('📦 [DEBUG] Results container updated');
    }

    // Update final counts
    updateResultCounts();
    
    // Update search info
    updateSearchInfo(`Search completed • ${window.liveResults.length} results found`);
    
    // Switch to results tab to show the results
    console.log('📑 [DEBUG] Switching to results tab...');
    switchTab('results');
    addProgressMessage('success', `✅ Results displayed: ${window.liveResults.length} matches across ${Object.keys(resultsByBranch).length} branches`);
    
    console.log('🏁 [DEBUG] Finalization complete!');
}

// Enhanced message types for progress log with detailed server console logs
function addProgressMessage(type, message, data = {}) {
    const progressLog = document.getElementById('progressLog');
    if (!progressLog) {
        return;
    }
    
    const timestamp = new Date().toLocaleTimeString();
    const messageDiv = document.createElement('div');
    messageDiv.className = `progress-message ${type}`;
    
    let icon = '';
    switch(type) {
        case 'success': icon = '✅'; break;
        case 'error': icon = '❌'; break;
        case 'info': icon = 'ℹ️'; break;
        case 'progress': icon = '🔄'; break;
        case 'branch': icon = '🌿'; break;
        case 'results': icon = '📋'; break;
        case 'match': icon = '📄'; break;
        case 'warning': icon = '⚠️'; break;
        default: icon = '📌'; break;
    }
    
    // Enhanced message display with data
    let extraInfo = '';
    if (data.rateLimitRemaining !== undefined) {
        const remaining = data.rateLimitRemaining;
        const total = data.rateLimitTotal || '?';
        const resetTime = data.rateLimitReset ? new Date(data.rateLimitReset).toLocaleTimeString() : '';
        const warningClass = remaining < 10 ? 'rate-limit-critical' : remaining < 50 ? 'rate-limit-warning' : 'rate-limit-normal';
        extraInfo = ` <span class="rate-limit-info ${warningClass}">[${remaining}/${total} API calls remaining${resetTime ? `, resets at ${resetTime}` : ''}]</span>`;
    }
    if (data.branchIndex && data.totalBranches) {
        const progress = Math.round((data.branchIndex / data.totalBranches) * 100);
        extraInfo += ` <span class="branch-progress">[${data.branchIndex}/${data.totalBranches} branches (${progress}%)]</span>`;
    }
    if (data.branchName) {
        extraInfo += ` <span class="current-branch">📍 ${data.branchName}</span>`;
    }
    
    messageDiv.innerHTML = `
        <div class="progress-message-main">
            <span class="progress-timestamp">${timestamp}</span>
            <span class="progress-icon">${icon}</span>
            <span class="progress-text">${escapeHtml(message)}${extraInfo}</span>
        </div>
    `;
    
    // Store data with the message element for export
    if (data && Object.keys(data).length > 0) {
        messageDiv.progressData = data;
    }
    
    progressLog.appendChild(messageDiv);
    
    // Show activity indicator
    showProgressActivity();
    
    // Auto scroll to bottom
    if (autoScroll) {
        scrollProgressToBottom();
    }
}

// Show activity indicator for progress
function showProgressActivity() {
    const progressBadge = document.getElementById('progressBadge');
    
    // Only show if not currently viewing progress tab
    const progressTab = document.getElementById('progressTab');
    if (progressTab && !progressTab.classList.contains('active')) {
        if (progressBadge) {
            progressBadge.style.display = 'inline-block';
        }
    }
}

// Function to toggle console log visibility
function toggleConsoleLog(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.toggle-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
        header.classList.add('expanded');
    } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
        header.classList.remove('expanded');
    }
}

// Function to toggle all console logs at once
function toggleAllConsoleLogs() {
    const expandAllBtn = document.getElementById('expandAllBtn');
    const headers = document.querySelectorAll('.console-log-header');
    
    if (!headers.length) return;
    
    // Check if any are expanded
    const anyExpanded = Array.from(headers).some(header => header.classList.contains('expanded'));
    
    headers.forEach(header => {
        const content = header.nextElementSibling;
        const icon = header.querySelector('.toggle-icon');
        
        if (anyExpanded) {
            // Collapse all
            content.style.display = 'none';
            icon.style.transform = 'rotate(0deg)';
            header.classList.remove('expanded');
        } else {
            // Expand all
            content.style.display = 'block';
            icon.style.transform = 'rotate(180deg)';
            header.classList.add('expanded');
        }
    });
    
    // Update button text
    if (expandAllBtn) {
        const icon = expandAllBtn.querySelector('i');
        if (anyExpanded) {
            expandAllBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i> Expand All';
        } else {
            expandAllBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i> Collapse All';
        }
    }
}

// Utility functions
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function clearProgressLog() {
    const progressLog = document.getElementById('progressLog');
    if (progressLog) {
        progressLog.innerHTML = '';
    }
}

// Switch between tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activate selected tab
    if (tabName === 'results') {
        document.getElementById('resultsTabBtn')?.classList.add('active');
        document.getElementById('resultsTab')?.classList.add('active');
    } else if (tabName === 'progress') {
        document.getElementById('progressTabBtn')?.classList.add('active');
        document.getElementById('progressTab')?.classList.add('active');
        
        // Hide badge when viewing progress
        const progressBadge = document.getElementById('progressBadge');
        if (progressBadge) {
            progressBadge.style.display = 'none';
        }
    }
}

function updateSearchInfo(message) {
    const searchInfo = document.getElementById('searchInfo');
    if (searchInfo) {
        searchInfo.textContent = message;
    }
}

function updateResultCounts() {
    const resultCount = window.liveResults ? window.liveResults.length : 0;
    
    console.log('🔢 [DEBUG] Updating result counts to:', resultCount);
    
    // Update tab count only
    const resultsTabCount = document.getElementById('resultsTabCount');
    
    if (resultsTabCount) {
        resultsTabCount.textContent = resultCount;
        console.log('🔢 [DEBUG] Updated tab count to:', resultCount);
    } else {
        console.warn('⚠️ [DEBUG] resultsTabCount element not found');
    }
}

// ========================
// EXPORT FUNCTIONALITY
// ========================

// Global variable to store current search results
let currentSearchResults = [];
let currentSearchMetadata = {};

// Store results when displaying them
const originalDisplaySearchResults = displaySearchResults;
displaySearchResults = function(results, searchData = {}) {
    currentSearchResults = results || [];
    currentSearchMetadata = searchData;
    originalDisplaySearchResults(results, searchData);
};

// Show export modal
function exportResults() {
    const exportModal = document.getElementById('exportModal');
    if (!exportModal) return;
    
    // Check multiple sources for results
    const hasResults = (currentSearchResults && currentSearchResults.length > 0) || 
                      (window.liveResults && window.liveResults.length > 0) ||
                      (document.querySelectorAll('#resultsContainer .result-item').length > 0);
    
    if (!hasResults) {
        showError('No results to export. Please perform a search first.');
        return;
    }
    
    exportModal.classList.remove('hidden');
}

// Close export modal
function closeExportModal() {
    const exportModal = document.getElementById('exportModal');
    if (exportModal) {
        exportModal.classList.add('hidden');
    }
}

// Collect all results from both tabs
function collectAllResults() {
    const results = [];
    
    // Use currentSearchData if currentSearchMetadata is empty
    const metadata = (currentSearchMetadata && currentSearchMetadata.repository) ? 
                    currentSearchMetadata : currentSearchData;
    
    // Collect from Results tab
    currentSearchResults.forEach(result => {
        results.push({
            type: 'search',
            branch: result.branch || result.branchInfo?.name || 'main',
            fileName: result.filePath || result.fileName || result.file || 'Unknown',
            lineNumber: result.lineNumber || result.line || '',
            content: result.context || result.content || result.match || '',
            url: result.url || '',
            repository: metadata.repository || result.repository || '',
            keyword: metadata.keyword || ''
        });
    });
    
    // Also collect results from liveResults array if available
    if (window.liveResults && window.liveResults.length > 0) {
        window.liveResults.forEach(result => {
            // Check if this result is already in currentSearchResults
            const exists = results.some(r => 
                r.url === result.url && 
                r.fileName === (result.filePath || result.fileName)
            );
            
            if (!exists) {
                results.push({
                    type: 'search',
                    branch: result.branch || result.branchInfo?.name || 'main',
                    fileName: result.filePath || result.fileName || result.file || 'Unknown',
                    lineNumber: result.lineNumber || result.line || '',
                    content: result.context || result.content || result.match || '',
                    url: result.url || '',
                    repository: metadata.repository || result.repository || '',
                    keyword: metadata.keyword || ''
                });
            }
        });
    }
    
    // Collect from Progress Log tab - look for match entries with data
    const progressLog = document.getElementById('progressLog');
    if (progressLog) {
        const progressItems = progressLog.querySelectorAll('.progress-message.match');
        progressItems.forEach(item => {
            // Check if this item has stored data
            if (item.progressData && item.progressData.result) {
                const data = item.progressData.result;
                const url = data.url || '';
                
                // Check if this result is already collected
                const exists = results.some(r => r.url === url);
                if (!exists && url) {
                    results.push({
                        type: 'progress',
                        branch: data.branch || data.branchInfo?.name || 'main',
                        fileName: data.filePath || data.fileName || 'Unknown',
                        lineNumber: data.lineNumber || '',
                        content: data.context || data.content || '',
                        url: url,
                        repository: data.repository || metadata.repository || '',
                        keyword: metadata.keyword || ''
                    });
                }
            }
        });
    }
    
    return results;
}

// Export as PDF
function exportAsPDF() {
    closeExportModal();
    
    const results = collectAllResults();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `github-search-results-${timestamp}.pdf`;
    
    // Use currentSearchData if currentSearchMetadata is empty
    const metadata = (currentSearchMetadata && currentSearchMetadata.repository) ? 
                    currentSearchMetadata : currentSearchData;
    
    // Check if jsPDF is available
    if (typeof window.jspdf !== 'undefined') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let yPosition = 20;
        const lineHeight = 7;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 15;
        const maxWidth = pageWidth - (margin * 2);
        
        // Add title
        doc.setFontSize(20);
        doc.text('GitHub Search Results', margin, yPosition);
        yPosition += lineHeight * 2;
        
        // Add metadata
        doc.setFontSize(12);
        doc.text(`Repository: ${metadata.repository || 'N/A'}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Keyword: ${metadata.keyword || 'N/A'}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Date: ${new Date().toLocaleString()}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Total Results: ${results.length}`, margin, yPosition);
        yPosition += lineHeight * 2;
        
        // Group results by branch
        const resultsByBranch = {};
        results.filter(r => r.type === 'search').forEach(result => {
            const branch = result.branch;
            if (!resultsByBranch[branch]) {
                resultsByBranch[branch] = [];
            }
            resultsByBranch[branch].push(result);
        });
        
        // Add results
        Object.keys(resultsByBranch).forEach(branch => {
            // Check if we need a new page
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }
            
            // Branch header
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(`Branch: ${branch}`, margin, yPosition);
            doc.setFont(undefined, 'normal');
            yPosition += lineHeight * 1.5;
            doc.setFontSize(10);
            
            resultsByBranch[branch].forEach((result, index) => {
                // Check if we need a new page
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                // Result number and file name
                doc.setFont(undefined, 'bold');
                const header = `${index + 1}. ${result.fileName}${result.lineNumber ? `:${result.lineNumber}` : ''}`;
                doc.text(header, margin, yPosition);
                yPosition += lineHeight;
                
                // URL
                doc.setFont(undefined, 'normal');
                doc.setTextColor(0, 0, 255);
                const urlLines = doc.splitTextToSize(result.url, maxWidth);
                urlLines.forEach(line => {
                    if (yPosition > pageHeight - 20) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(line, margin, yPosition);
                    yPosition += lineHeight;
                });
                doc.setTextColor(0, 0, 0);
                
                // Content preview
                if (result.content) {
                    doc.setFontSize(9);
                    const contentLines = doc.splitTextToSize(result.content.substring(0, 200) + '...', maxWidth - 10);
                    contentLines.forEach((line, i) => {
                        if (i < 3) { // Limit to 3 lines
                            if (yPosition > pageHeight - 20) {
                                doc.addPage();
                                yPosition = 20;
                            }
                            doc.text(line, margin + 5, yPosition);
                            yPosition += lineHeight * 0.8;
                        }
                    });
                    doc.setFontSize(10);
                }
                
                yPosition += lineHeight;
            });
        });
        
        // Save the PDF
        doc.save(filename);
        showSuccess(`PDF exported: ${filename}`);
        
    } else {
        // Fallback to print dialog
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>GitHub Search Results</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    h2 { color: #666; margin-top: 30px; }
                    .result { margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #007bff; }
                    .result-header { font-weight: bold; color: #333; margin-bottom: 5px; }
                    .result-url { color: #007bff; text-decoration: none; word-break: break-all; }
                    .result-content { margin-top: 10px; padding: 10px; background: #fff; border: 1px solid #ddd; font-family: monospace; white-space: pre-wrap; }
                    .metadata { color: #666; font-size: 0.9em; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <h1>GitHub Search Results</h1>
                <div class="metadata">
                    <p><strong>Repository:</strong> ${escapeHtml(metadata.repository || 'N/A')}</p>
                    <p><strong>Keyword:</strong> ${escapeHtml(metadata.keyword || 'N/A')}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Total Results:</strong> ${results.length}</p>
                </div>
        `;
        
        const resultsByBranch = {};
        results.filter(r => r.type === 'search').forEach(result => {
            const branch = result.branch;
            if (!resultsByBranch[branch]) {
                resultsByBranch[branch] = [];
            }
            resultsByBranch[branch].push(result);
        });
        
        Object.keys(resultsByBranch).forEach(branch => {
            htmlContent += `<h2>Branch: ${escapeHtml(branch)}</h2>`;
            resultsByBranch[branch].forEach((result, index) => {
                htmlContent += `
                    <div class="result">
                        <div class="result-header">${index + 1}. ${escapeHtml(result.fileName)}${result.lineNumber ? `:${result.lineNumber}` : ''}</div>
                        <a href="${result.url}" class="result-url" target="_blank">${result.url}</a>
                        ${result.content ? `<div class="result-content">${escapeHtml(result.content)}</div>` : ''}
                    </div>
                `;
            });
        });
        
        htmlContent += `
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
        
        showSuccess(`PDF export ready. Use browser's print dialog to save as PDF.`);
    }
}

// Export as Excel (CSV format)
function exportAsExcel() {
    closeExportModal();
    
    const results = collectAllResults();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `github-search-results-${timestamp}.csv`;
    
    // Use currentSearchData if currentSearchMetadata is empty
    const metadata = (currentSearchMetadata && currentSearchMetadata.repository) ? 
                    currentSearchMetadata : currentSearchData;
    
    // Create CSV content
    let csvContent = 'Repository,Keyword,Branch,File,Line,URL,Content\n';
    
    results.filter(r => r.type === 'search').forEach(result => {
        const row = [
            metadata.repository || '',
            metadata.keyword || '',
            result.branch || '',
            result.fileName || '',
            result.lineNumber || '',
            result.url || '',
            (result.content || '').replace(/\n/g, ' ').replace(/"/g, '""')
        ];
        
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    showSuccess(`Excel file exported: ${filename}`);
}

// Export as Text
function exportAsText() {
    closeExportModal();
    
    const results = collectAllResults();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `github-search-results-${timestamp}.txt`;
    
    // Use currentSearchData if currentSearchMetadata is empty
    const metadata = (currentSearchMetadata && currentSearchMetadata.repository) ? 
                    currentSearchMetadata : currentSearchData;
    
    // Create text content
    let textContent = `GitHub Search Results
====================

Repository: ${metadata.repository || 'N/A'}
Keyword: ${metadata.keyword || 'N/A'}
Date: ${new Date().toLocaleString()}
Total Results: ${results.length}

====================

`;
    
    // Group results by branch
    const resultsByBranch = {};
    results.filter(r => r.type === 'search').forEach(result => {
        const branch = result.branch;
        if (!resultsByBranch[branch]) {
            resultsByBranch[branch] = [];
        }
        resultsByBranch[branch].push(result);
    });
    
    // Add results to text
    Object.keys(resultsByBranch).forEach(branch => {
        textContent += `\nBRANCH: ${branch}\n`;
        textContent += '=' .repeat(50) + '\n\n';
        
        resultsByBranch[branch].forEach((result, index) => {
            textContent += `${index + 1}. FILE: ${result.fileName}${result.lineNumber ? `:${result.lineNumber}` : ''}\n`;
            textContent += `   URL: ${result.url}\n`;
            if (result.content) {
                textContent += `   CONTENT:\n`;
                textContent += result.content.split('\n').map(line => `      ${line}`).join('\n') + '\n';
            }
            textContent += '\n';
        });
    });
    
    // Add progress log entries
    const progressEntries = results.filter(r => r.type === 'progress');
    if (progressEntries.length > 0) {
        textContent += '\n\nPROGRESS LOG ENTRIES\n';
        textContent += '=' .repeat(50) + '\n\n';
        progressEntries.forEach((entry, index) => {
            textContent += `${index + 1}. ${entry.content}\n`;
            if (entry.url) {
                textContent += `   URL: ${entry.url}\n`;
            }
            textContent += '\n';
        });
    }
    
    // Download text file
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    showSuccess(`Text file exported: ${filename}`);
}

// Add click handler to close export modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const exportModal = document.getElementById('exportModal');
    if (exportModal) {
        exportModal.addEventListener('click', function(e) {
            if (e.target === exportModal) {
                closeExportModal();
            }
        });
    }
});

console.log('Export functionality loaded successfully');

// Test function for toast notifications
window.testToastNotifications = function() {
    showSuccess('✅ Success toast test - This should be visible with good contrast!');
    setTimeout(() => {
        showError('❌ Error toast test - This should also be clearly visible!');
    }, 2000);
};

console.log('Toast notification test function available. Run testToastNotifications() in console.');