// Menu Makers Portfolio JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Dark Mode Toggle Functionality
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Set theme function
    function setTheme(theme) {
        body.setAttribute('data-theme', theme);
        if (themeToggle) {
            if (theme === 'dark') {
                themeToggle.setAttribute('aria-label', 'Switch to light mode');
            } else {
                themeToggle.setAttribute('aria-label', 'Switch to dark mode');
            }
        }
    }
    
    // Navigation functionality
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = 80;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation highlighting
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`a[href="#${sectionId}"]`);

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink);

    // Scroll to top button functionality
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    
    function toggleScrollToTopBtn() {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    }

    window.addEventListener('scroll', toggleScrollToTopBtn);

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Scroll progress indicator
    const scrollProgress = document.querySelector('.scroll-progress');
    
    function updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / documentHeight) * 100;
        
        if (scrollProgress) {
            scrollProgress.style.width = progress + '%';
        }
    }

    window.addEventListener('scroll', updateScrollProgress);

    // Navbar background on scroll with modern effects
    const navbar = document.querySelector('.navbar');
    
    function updateNavbarBackground() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateNavbarBackground);

    // Dynamic navbar text color based on current section
    function updateNavbarTextColor() {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;
        
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        const scrollPosition = window.scrollY + 100; // Account for navbar height
        
        if (scrollPosition < heroBottom) {
            // We're in the hero section - use white text
            navbar.classList.add('on-hero');
        } else {
            // We're in other sections - use dark text
            navbar.classList.remove('on-hero');
        }
    }

    window.addEventListener('scroll', updateNavbarTextColor);
    // Initialize on page load
    updateNavbarTextColor();

    // Modern loading animations for elements
    const fadeObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const fadeInObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add staggered animation for children
                const children = entry.target.children;
                Array.from(children).forEach((child, index) => {
                    child.style.animationDelay = `${index * 0.1}s`;
                    child.classList.add('fade-in-up');
                });
            }
        });
    }, fadeObserverOptions);

    // Observe sections for fade-in animations
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        fadeInObserver.observe(section);
    });

    // Enhanced parallax effects
    function modernParallaxScroll() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-graphic, .hero::after');
        
        parallaxElements.forEach(element => {
            const speed = element.classList.contains('hero-graphic') ? 0.3 : 0.1;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });

        // Parallax for other elements
        const aboutSection = document.querySelector('.about');
        if (aboutSection) {
            const aboutOffset = scrolled - aboutSection.offsetTop + window.innerHeight;
            if (aboutOffset > 0 && aboutOffset < aboutSection.offsetHeight) {
                aboutSection.style.backgroundPosition = `center ${aboutOffset * 0.1}px`;
            }
        }
    }

    window.addEventListener('scroll', modernParallaxScroll);

    // Modern cursor follower (optional enhancement)
    function createCursorFollower() {
        const cursor = document.createElement('div');
        cursor.className = 'cursor-follower';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, var(--primary-color), var(--primary-light));
            border-radius: 50%;
            pointer-events: none;
            mix-blend-mode: difference;
            z-index: 9999;
            transition: transform 0.1s ease-out;
            opacity: 0;
        `;
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
            cursor.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });

        // Scale cursor on hover over interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .btn, .team-card, .project-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(2)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
            });
        });
    }

    // Initialize cursor follower only on desktop
    if (window.innerWidth > 1024) {
        createCursorFollower();
    }

    // Contact form functionality
    const contactForm = document.getElementById('contact-form');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close-modal');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');

            try {
                // Get form data
                const formData = new FormData(contactForm);
                const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    subject: formData.get('subject'),
                    message: formData.get('message'),
                    teamMember: formData.get('teamMember')
                };

                // Validate form data
                if (!data.name || !data.email || !data.subject || !data.message) {
                    throw new Error('Please fill in all required fields');
                }

                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(data.email)) {
                    throw new Error('Please enter a valid email address');
                }

                // Submit form data
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Show success modal
                    showModal('success', 'Message Sent!', result.message || 'Thank you for your message! We\'ll get back to you soon.');
                    contactForm.reset();
                } else {
                    throw new Error(result.message || 'Failed to send message');
                }

            } catch (error) {
                console.error('Contact form error:', error);
                showModal('error', 'Error!', error.message || 'An error occurred while sending your message. Please try again.');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
            }
        });
    }

    // Modal functionality
    function showModal(type, title, message) {
        const modalIcon = modal.querySelector('.modal-icon');
        const modalTitle = modal.querySelector('.modal-title');
        const modalMessage = modal.querySelector('.modal-message');

        // Update modal content
        modalTitle.textContent = title;
        modalMessage.textContent = message;

        // Update icon based on type
        modalIcon.className = 'modal-icon fas';
        if (type === 'success') {
            modalIcon.classList.add('fa-check-circle');
            modalIcon.style.color = 'var(--success-color)';
        } else if (type === 'error') {
            modalIcon.classList.add('fa-exclamation-triangle');
            modalIcon.style.color = 'var(--error-color)';
        }

        // Show modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Close modal events
    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            hideModal();
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe elements for animations
    const animatedElements = document.querySelectorAll('.team-card, .project-card, .skill-category, .stat, .feature');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Typing effect for hero title (optional enhancement)
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Add some interactive effects and portfolio navigation
    const teamCards = document.querySelectorAll('.team-card');
    
    // Portfolio URLs for each team member
    const portfolioUrls = {
        'Jatinder Kaur': 'https://www.jatinderkaur.in/',
        'Mansi Keer': 'https://mansi-keer.github.io/myportfolio/',
        'Ramesh Kumawat': 'https://ramesh-portfolio-one.vercel.app/',
        'Madhusudan Mainali': null // No portfolio available
    };
    
    teamCards.forEach(card => {
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add click functionality to redirect to portfolio
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on social media links
            if (e.target.closest('.team-social')) {
                return;
            }
            
            const memberName = this.querySelector('.team-info h3').textContent.trim();
            const portfolioUrl = portfolioUrls[memberName];
            
            if (portfolioUrl) {
                window.open(portfolioUrl, '_blank', 'noopener,noreferrer');
            } else {
                // If no portfolio, show a message or redirect to LinkedIn
                const linkedInLink = this.querySelector('.team-social a[aria-label="LinkedIn"]');
                if (linkedInLink) {
                    window.open(linkedInLink.href, '_blank', 'noopener,noreferrer');
                }
            }
        });
        
        // Add cursor pointer to indicate clickability
        card.style.cursor = 'pointer';
    });

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Form field focus effects
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    // Parallax effect for hero section
    function parallaxScroll() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-graphic');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }

    window.addEventListener('scroll', parallaxScroll);

    // Random color animation for hero graphic
    const heroGraphic = document.querySelector('.hero-graphic');
    if (heroGraphic) {
        const colors = [
            'linear-gradient(135deg, #6366f1, #f59e0b)',
            'linear-gradient(135deg, #10b981, #3b82f6)',
            'linear-gradient(135deg, #8b5cf6, #ec4899)',
            'linear-gradient(135deg, #f59e0b, #ef4444)'
        ];
        
        let currentColorIndex = 0;
        
        setInterval(() => {
            currentColorIndex = (currentColorIndex + 1) % colors.length;
            heroGraphic.style.background = colors[currentColorIndex];
        }, 5000);
    }

    // Enhanced skills hover effect with random colors and animations
    const skillTags = document.querySelectorAll('.skill-tags span');
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];
    
    skillTags.forEach((tag, index) => {
        tag.addEventListener('mouseenter', function() {
            const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
            this.style.background = randomGradient;
            this.style.color = '#ffffff';
            this.style.transform = 'translateY(-5px) scale(1.05)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.background = '';
            this.style.color = '';
            this.style.transform = '';
            this.style.boxShadow = '';
        });
        
        // Add staggered animation on page load
        setTimeout(() => {
            tag.style.animation = 'fadeInUp 0.6s ease-out forwards';
        }, index * 50);
    });

    // Performance optimization: Debounce scroll events
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    const debouncedScroll = debounce(() => {
        updateActiveNavLink();
        toggleScrollToTopBtn();
        updateNavbarBackground();
    }, 16); // ~60fps

    window.addEventListener('scroll', debouncedScroll);

    // Loading animation - Multiple event listeners to ensure loading state clears
    function clearLoadingState() {
        document.body.classList.add('loaded');
        
        // Animate hero elements
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroButtons = document.querySelector('.hero-buttons');
        
        if (heroTitle) {
            setTimeout(() => heroTitle.style.opacity = '1', 100);
        }
        if (heroSubtitle) {
            setTimeout(() => heroSubtitle.style.opacity = '1', 200);
        }
        if (heroButtons) {
            setTimeout(() => heroButtons.style.opacity = '1', 300);
        }
        
        // Remove any loading overlays or spinners
        const loadingElements = document.querySelectorAll('.loading, .spinner, .loader');
        loadingElements.forEach(el => el.remove());
        
        console.log('Loading state cleared');
    }

    // Try multiple approaches to clear loading state
    window.addEventListener('load', clearLoadingState);
    
    // Fallback: Clear loading state after DOM is ready + small delay
    if (document.readyState === 'complete') {
        clearLoadingState();
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(clearLoadingState, 1000); // 1 second fallback
        });
    }
    
    // Additional fallback after 3 seconds regardless of load state
    setTimeout(clearLoadingState, 3000);

    // Touch support for mobile devices
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // Add touch feedback to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            btn.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = '';
                }, 100);
            });
        });
    }

    // Console welcome message
    console.log(`
    🚀 Welcome to Menu Makers Portfolio!
    
    👥 Team Members:
    • Jatinder Kaur - Team Lead & Project Coordinator
    • Mansi Keer - UI/UX Designer  
    • Madhusudan Mainali - Documentation & QA Specialist
    • Ramesh Kumawat - Technical Lead & Developer
    
    💻 Built with: HTML5, CSS3, JavaScript, Node.js, MongoDB
    📧 Contact: Use the contact form or email hello@menumakers.dev
    
    Thanks for visiting! 🎉
    `);

    // Error handling for missing elements
    if (!contactForm) {
        console.warn('Contact form not found');
    }
    if (!modal) {
        console.warn('Modal not found');
    }
    if (!scrollToTopBtn) {
        console.warn('Scroll to top button not found');
    }

    // Initialize tooltips (if needed in the future)
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                // Tooltip functionality can be added here
            });
        });
    }

    initTooltips();

    // Preload images for better performance
    function preloadImages() {
        const imageUrls = [
            '/images/jatinder.jpg',
            '/images/mansi.jpg',
            '/images/madhusudan.jpg',
            '/images/ramesh.jpg',
            '/images/project-1.jpg',
            '/images/project-2.jpg',
            '/images/project-3.jpg',
            '/images/project-4.jpg'
        ];

        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    preloadImages();

    // Service Worker registration disabled for development
    // Uncomment below for production PWA features
    /*
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    }
    */

});
