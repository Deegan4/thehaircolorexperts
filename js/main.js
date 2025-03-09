// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Particles Animation
    const particlesContainer = document.querySelector('.particles-container');
    if (particlesContainer) {
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random size between 2px and 6px
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random position
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Random opacity
            particle.style.opacity = Math.random() * 0.5 + 0.3;
            
            // Random animation duration between 10s and 30s
            const duration = Math.random() * 20 + 10;
            
            // Random animation delay
            const delay = Math.random() * 5;
            
            // Apply animation
            particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.getElementById('menu');
    
    if (mobileMenuBtn && menu) {
        mobileMenuBtn.addEventListener('click', function() {
            menu.classList.toggle('active');
            mobileMenuBtn.textContent = menu.classList.contains('active') ? '✕' : '☰';
        });
    }
    
    // Close menu when clicking on a link
    const menuLinks = document.querySelectorAll('#menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            menu.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animate elements on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.result-card, .analytics-overview, .service-card, .portfolio-item');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                if (element.classList.contains('result-card')) {
                    element.style.animation = 'fadeInUp 0.6s ease forwards';
                    element.style.opacity = '1';
                }
                
                if (element.classList.contains('analytics-overview')) {
                    element.style.animation = 'fadeInUp 0.8s ease forwards';
                    element.style.opacity = '1';
                }
            }
        });
        
        // Add parallax effect to background sections
        const parallaxSections = document.querySelectorAll('.section');
        parallaxSections.forEach(section => {
            const top = section.getBoundingClientRect().top;
            const scrollPosition = window.scrollY;
            
            if (section.style.backgroundImage && section.style.backgroundImage !== 'none') {
                section.style.backgroundPosition = `center ${scrollPosition * 0.05}px`;
            }
        });
        
        // Animate result cards when they come into view
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (cardTop < windowHeight * 0.8) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
        
        // Animate analytics overview when it comes into view
        const analyticsOverview = document.querySelector('.analytics-overview');
        if (analyticsOverview) {
            const analyticsTop = analyticsOverview.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (analyticsTop < windowHeight * 0.8) {
                analyticsOverview.style.opacity = '1';
                analyticsOverview.style.transform = 'translateY(0)';
            }
        }
    };
    
    // Set initial opacity for animated elements
    document.querySelectorAll('.result-card, .analytics-overview').forEach(element => {
        element.style.opacity = '0';
    });
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Run once on page load
    animateOnScroll();
    
    // Enhanced counter animation for metrics
    const startCounterAnimation = () => {
        const metricValues = document.querySelectorAll('.metric-value');
        const analyticsValues = document.querySelectorAll('.analytics-value');
        
        const animateCounter = (element, target, suffix = '') => {
            // Parse the target value
            let targetValue;
            if (target.includes('%')) {
                targetValue = parseFloat(target);
                suffix = '%';
            } else if (target.includes('x')) {
                targetValue = parseFloat(target);
                suffix = 'x';
            } else if (target.includes('/')) {
                const parts = target.split('/');
                targetValue = parseFloat(parts[0]);
                suffix = '/' + parts[1];
            } else if (target.includes('K+')) {
                targetValue = parseFloat(target);
                suffix = 'K+';
            } else {
                targetValue = parseFloat(target);
            }
            
            // Set starting value
            let startValue = 0;
            let duration = 2000; // 2 seconds
            let startTime = null;
            
            // Easing function for smooth animation
            const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
            
            const updateCounter = timestamp => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const easedProgress = easeOutQuart(progress);
                
                let currentValue;
                if (suffix === '%' || suffix === 'x' || suffix === 'K+') {
                    currentValue = Math.floor(easedProgress * targetValue);
                    element.textContent = currentValue + suffix;
                } else if (suffix.includes('/')) {
                    currentValue = (easedProgress * targetValue).toFixed(1);
                    element.textContent = currentValue + suffix;
                } else {
                    currentValue = Math.floor(easedProgress * targetValue);
                    element.textContent = currentValue + suffix;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };
            
            requestAnimationFrame(updateCounter);
        };
        
        // Animate metric values
        metricValues.forEach(metric => {
            const target = metric.getAttribute('data-target');
            if (target) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            animateCounter(metric, target);
                            observer.disconnect();
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(metric);
            }
        });
        
        // Animate analytics values
        analyticsValues.forEach(value => {
            const target = value.getAttribute('data-target');
            if (target) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            animateCounter(value, target);
                            observer.disconnect();
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(value);
            }
        });
    };
    
    // Enhanced scroll animations for results section
    const animateResultsSection = () => {
        const resultCards = document.querySelectorAll('.result-card');
        const analyticsOverview = document.querySelector('.analytics-overview');
        
        // Animate result cards
        resultCards.forEach(card => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                        
                        // Animate chart
                        const chart = card.querySelector('.result-chart');
                        if (chart) {
                            setTimeout(() => {
                                chart.style.opacity = '1';
                                chart.style.transform = 'translateY(0)';
                            }, 300);
                        }
                        
                        // Animate summary
                        const summary = card.querySelector('.result-summary');
                        if (summary) {
                            setTimeout(() => {
                                summary.style.opacity = '1';
                            }, 500);
                        }
                        
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.2 });
            
            observer.observe(card);
        });
        
        // Animate analytics overview
        if (analyticsOverview) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        analyticsOverview.style.opacity = '1';
                        analyticsOverview.style.transform = 'translateY(0)';
                        
                        // Animate items
                        const items = analyticsOverview.querySelectorAll('.analytics-item');
                        items.forEach((item, index) => {
                            setTimeout(() => {
                                item.style.opacity = '1';
                            }, 200 * (index + 1));
                        });
                        
                        // Animate note
                        const note = analyticsOverview.querySelector('.analytics-note');
                        if (note) {
                            setTimeout(() => {
                                note.style.opacity = '1';
                            }, 1000);
                        }
                        
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.2 });
            
            observer.observe(analyticsOverview);
        }
    };
    
    // Add interactive hover effects to result cards
    const addResultCardInteractivity = () => {
        const resultCards = document.querySelectorAll('.result-card');
        
        resultCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const metrics = card.querySelectorAll('.metric');
                metrics.forEach((metric, index) => {
                    setTimeout(() => {
                        metric.style.transform = 'translateY(-5px)';
                    }, 100 * index);
                });
            });
            
            card.addEventListener('mouseleave', () => {
                const metrics = card.querySelectorAll('.metric');
                metrics.forEach((metric, index) => {
                    setTimeout(() => {
                        metric.style.transform = 'translateY(0)';
                    }, 100 * index);
                });
            });
        });
    };
    
    // Initialize results section animations
    startCounterAnimation();
    animateResultsSection();
    addResultCardInteractivity();
    
    // Enhanced testimonial slider with fade effect
    const testimonials = [
        {
            text: "Glacier's Edge Media transformed our brand with their exceptional visual storytelling. Their team went above and beyond to understand our vision and bring it to life in ways we couldn't have imagined.",
            author: "Sarah Johnson",
            role: "Marketing Director, Alpine Adventures"
        },
        {
            text: "Working with Glacier's Edge Media has been a game-changer for our business. Their strategic approach to content creation has significantly increased our online engagement and conversion rates.",
            author: "Michael Chen",
            role: "CEO, Summit Outfitters"
        },
        {
            text: "The team at Glacier's Edge Media are true professionals. Their attention to detail and creative vision helped us stand out in a crowded market. We've seen a 200% increase in social media engagement since working with them.",
            author: "Emma Rodriguez",
            role: "Social Media Manager, Everest Expeditions"
        },
        {
            text: "I can't recommend Glacier's Edge Media enough. Their photography and videography work captured the essence of our brand perfectly. Our customers constantly comment on the quality of our visual content.",
            author: "David Thompson",
            role: "Founder, Northern Lights Tours"
        }
    ];
    
    const testimonialSlider = document.querySelector('.testimonial-slider');
    if (testimonialSlider) {
        const testimonialElement = testimonialSlider.querySelector('.testimonial');
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'testimonial-dots';
        testimonialSlider.appendChild(dotsContainer);
        
        // Create dots
        testimonials.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = index === 0 ? 'dot active' : 'dot';
            dot.addEventListener('click', () => showTestimonial(index));
            dotsContainer.appendChild(dot);
        });
        
        let currentTestimonial = 0;
        
        function showTestimonial(index) {
            // Fade out
            testimonialElement.style.opacity = '0';
            
            setTimeout(() => {
                // Update content
                testimonialElement.querySelector('p').textContent = testimonials[index].text;
                testimonialElement.querySelector('.testimonial-author').textContent = testimonials[index].author;
                testimonialElement.querySelector('.testimonial-role').textContent = testimonials[index].role;
                
                // Update active dot
                document.querySelectorAll('.dot').forEach((dot, i) => {
                    dot.className = i === index ? 'dot active' : 'dot';
                });
                
                // Fade in
                testimonialElement.style.opacity = '1';
                
                currentTestimonial = index;
            }, 500);
        }
        
        // Auto-rotate testimonials
        setInterval(() => {
            const nextTestimonial = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(nextTestimonial);
        }, 8000);
    }
    
    // Fade-in animations on scroll
    const fadeElements = document.querySelectorAll('.fade-in-up');
    
    function checkFade() {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('visible');
            }
        });
    }
    
    // Check on initial load
    checkFade();
    
    // Check on scroll
    window.addEventListener('scroll', checkFade);
    
    // Add 3D tilt effect to portfolio items
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.addEventListener('mousemove', e => {
            const { left, top, width, height } = item.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;
            
            item.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${y * -10}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale3d(1, 1, 1)';
        });
    });
    
    // Typing animation for hero section
    const heroText = document.querySelector('.hero-content p');
    if (heroText) {
        const text = heroText.textContent;
        heroText.textContent = '';
        heroText.style.borderRight = '2px solid var(--accent-color)';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroText.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else {
                heroText.style.borderRight = 'none';
            }
        };
        
        setTimeout(typeWriter, 1000);
    }
    
    // Marketing Partner section animations
    const animateMarketingSection = () => {
        const marketingContainer = document.querySelector('.marketing-container');
        
        if (marketingContainer) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        marketingContainer.classList.add('visible');
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.2 });
            
            observer.observe(marketingContainer);
        }
    };
    
    // Add floating elements animation to marketing section
    const animateFloatingElements = () => {
        const floatingElements = document.querySelectorAll('.floating-element');
        
        floatingElements.forEach(element => {
            // Add random blur effect
            const blurAmount = Math.random() * 5 + 2;
            element.style.filter = `blur(${blurAmount}px)`;
            
            // Add random opacity
            const opacity = Math.random() * 0.5 + 0.1;
            element.style.opacity = opacity;
            
            // Add random rotation
            const rotation = Math.random() * 360;
            element.style.transform = `rotate(${rotation}deg)`;
        });
    };
    
    // Initialize marketing section animations
    animateMarketingSection();
    animateFloatingElements();
});

// Scroll event for header styling
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const scrollPosition = window.scrollY;
    
    if (scrollPosition > 50) {
        header.style.background = 'rgba(26, 75, 120, 0.95)';
        header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        header.style.padding = '15px 0';
    } else {
        header.style.background = 'var(--primary-color)';
        header.style.boxShadow = 'var(--box-shadow)';
        header.style.padding = '20px 0';
    }
    
    // Add scroll animations
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            el.classList.add('animated');
        }
    });
});

// Form validation and submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const newsletterForm = document.getElementById('newsletter-form');
    
    // Add animation classes to elements
    document.querySelectorAll('.service-card, .portfolio-item, .section-title').forEach(el => {
        el.classList.add('animate-on-scroll');
    });
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Simple validation
            if (name === '' || email === '' || message === '') {
                showFormMessage(contactForm, 'Please fill in all required fields.', 'error');
                highlightEmptyFields(contactForm);
                return;
            }
            
            if (!isValidEmail(email)) {
                showFormMessage(contactForm, 'Please enter a valid email address.', 'error');
                document.getElementById('email').classList.add('error-field');
                return;
            }
            
            // Simulate form submission (replace with actual form submission)
            showFormMessage(contactForm, 'Sending message...', 'info');
            
            // Simulate API call with timeout
            setTimeout(() => {
                // Reset form
                contactForm.reset();
                showFormMessage(contactForm, 'Your message has been sent successfully!', 'success');
                
                // Remove any error highlighting
                document.querySelectorAll('.error-field').forEach(field => {
                    field.classList.remove('error-field');
                });
            }, 1500);
        });
    }
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get email value
            const email = newsletterForm.querySelector('input[type="email"]').value.trim();
            
            // Simple validation
            if (email === '') {
                showFormMessage(newsletterForm, 'Please enter your email address.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showFormMessage(newsletterForm, 'Please enter a valid email address.', 'error');
                return;
            }
            
            // Simulate form submission
            showFormMessage(newsletterForm, 'Subscribing...', 'info');
            
            // Simulate API call with timeout
            setTimeout(() => {
                // Reset form
                newsletterForm.reset();
                showFormMessage(newsletterForm, 'Thank you for subscribing!', 'success');
            }, 1500);
        });
    }
    
    // Add input event listeners to remove error class when user types
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error-field');
        });
    });
});

// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function to show form messages
function showFormMessage(form, message, type) {
    // Remove any existing message
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;
    
    // Append message to form
    form.appendChild(messageElement);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// Helper function to highlight empty fields
function highlightEmptyFields(form) {
    const emptyFields = form.querySelectorAll('input, textarea');
    emptyFields.forEach(field => {
        if (field.value.trim() === '') {
            field.classList.add('error-field');
        }
    });
}