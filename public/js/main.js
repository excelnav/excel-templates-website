/**
 * Main JavaScript for Excel Templates Website
 * Enhances user experience with smooth interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile menu toggle functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (mobileMenuToggle && navbarMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('.newsletter-input').value;
            
            if (email) {
                // Here you would typically send the email to your backend
                alert('Thank you for subscribing! We\'ll keep you updated with new templates.');
                this.querySelector('.newsletter-input').value = '';
            }
        });
    }
    
    // Search functionality
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = this.querySelector('.search-input').value;
            
            if (query.trim()) {
                // Redirect to search results page
                window.location.href = `/search/?q=${encodeURIComponent(query)}`;
            }
        });
    }
    
    // Download tracking (for analytics)
    const downloadLinks = document.querySelectorAll('.download-link, a[download]');
    downloadLinks.forEach(link => {
        link.addEventListener('click', function() {
            const templateName = this.closest('.template-card')?.querySelector('.template-title')?.textContent || 'Unknown Template';
            
            // Track download event (you can integrate with Google Analytics here)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'download', {
                    'event_category': 'Template',
                    'event_label': templateName,
                    'value': 1
                });
            }
            
            console.log(`Template downloaded: ${templateName}`);
        });
    });
    
    // Lazy loading for images
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Add scroll effect to header
    const header = document.querySelector('.site-header');
    if (header) {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Hide header on scroll down, show on scroll up
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
    // Add animation on scroll for elements
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.template-card, .category-card, .feature');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    };
    
    // Initialize animations
    animateOnScroll();
    
    // Copy to clipboard functionality for template URLs
    const copyButtons = document.querySelectorAll('.copy-url-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = 'Copy URL';
                }, 2000);
            });
        });
    });
    
    // Template preview modal (if needed)
    const previewButtons = document.querySelectorAll('.preview-btn');
    previewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const imageUrl = this.dataset.image;
            
            if (imageUrl) {
                showImageModal(imageUrl);
            }
        });
    });
    
    function showImageModal(imageUrl) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <img src="${imageUrl}" alt="Template Preview" class="modal-image">
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Close modal functionality
        const closeModal = () => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        };
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-backdrop').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        }, { once: true });
    }
});

/**
 * 模板筛选和搜索功能
 * Template filtering and search functionality
 */
function initTemplateFilters() {
    const searchInput = document.getElementById('template-search');
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const activeFiltersContainer = document.getElementById('active-filters');
    const resultsCount = document.getElementById('results-count');
    const templatesGrid = document.getElementById('templates-grid');
    
    if (!templatesGrid) return; // 如果不在模板页面则退出
    
    const templateCards = Array.from(templatesGrid.querySelectorAll('.template-card'));
    const totalTemplates = templateCards.length;
    let activeFilters = {
        search: '',
        category: '',
        sort: 'newest'
    };
    
    /**
     * 更新筛选结果显示
     * Update filter results display
     */
    function updateResults() {
        let filteredCards = [...templateCards];
        
        // 搜索筛选
        if (activeFilters.search) {
            filteredCards = filteredCards.filter(card => {
                const title = card.dataset.title.toLowerCase();
                const category = card.dataset.category.toLowerCase();
                const searchTerm = activeFilters.search.toLowerCase();
                return title.includes(searchTerm) || category.includes(searchTerm);
            });
        }
        
        // 分类筛选
        if (activeFilters.category) {
            filteredCards = filteredCards.filter(card => {
                return card.dataset.category.includes(activeFilters.category);
            });
        }
        
        // 排序
        filteredCards.sort((a, b) => {
            switch(activeFilters.sort) {
                case 'name-asc':
                    return a.dataset.title.localeCompare(b.dataset.title);
                case 'name-desc':
                    return b.dataset.title.localeCompare(a.dataset.title);
                case 'oldest':
                    return new Date(a.dataset.date) - new Date(b.dataset.date);
                case 'newest':
                default:
                    return new Date(b.dataset.date) - new Date(a.dataset.date);
            }
        });
        
        // 显示/隐藏模板卡片
        templateCards.forEach(card => {
            card.style.display = filteredCards.includes(card) ? 'block' : 'none';
        });
        
        // 重新排列显示的卡片
        filteredCards.forEach(card => {
            templatesGrid.appendChild(card);
        });
        
        // 更新结果计数
        if (resultsCount) {
            resultsCount.innerHTML = `Showing <strong>${filteredCards.length}</strong> of <strong>${totalTemplates}</strong> templates`;
        }
        
        // 更新活跃筛选标签
        updateActiveFilters();
        
        // 显示/隐藏清除筛选按钮
        const hasActiveFilters = activeFilters.search || activeFilters.category || activeFilters.sort !== 'newest';
        if (clearFiltersBtn) {
            clearFiltersBtn.style.display = hasActiveFilters ? 'flex' : 'none';
        }
    }
    
    /**
     * 更新活跃筛选标签
     * Update active filter tags
     */
    function updateActiveFilters() {
        if (!activeFiltersContainer) return;
        
        const tags = [];
        
        if (activeFilters.search) {
            tags.push({
                type: 'search',
                label: `Search: "${activeFilters.search}"`,
                value: activeFilters.search
            });
        }
        
        if (activeFilters.category) {
            tags.push({
                type: 'category',
                label: `Category: ${activeFilters.category}`,
                value: activeFilters.category
            });
        }
        
        if (activeFilters.sort !== 'newest') {
            const sortLabels = {
                'oldest': 'Oldest First',
                'name-asc': 'Name A-Z',
                'name-desc': 'Name Z-A'
            };
            tags.push({
                type: 'sort',
                label: `Sort: ${sortLabels[activeFilters.sort]}`,
                value: activeFilters.sort
            });
        }
        
        if (tags.length > 0) {
            activeFiltersContainer.innerHTML = tags.map(tag => `
                <span class="filter-tag">
                    ${tag.label}
                    <button class="remove-filter" data-type="${tag.type}" data-value="${tag.value}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </span>
            `).join('');
            activeFiltersContainer.style.display = 'flex';
        } else {
            activeFiltersContainer.style.display = 'none';
        }
    }
    
    /**
     * 清除所有筛选
     * Clear all filters
     */
    function clearAllFilters() {
        activeFilters = {
            search: '',
            category: '',
            sort: 'newest'
        };
        
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (sortFilter) sortFilter.value = 'newest';
        
        updateResults();
    }
    
    // 事件监听器
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            activeFilters.search = this.value;
            updateResults();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            activeFilters.category = this.value;
            updateResults();
        });
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            activeFilters.sort = this.value;
            updateResults();
        });
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    
    // 移除单个筛选标签
    if (activeFiltersContainer) {
        activeFiltersContainer.addEventListener('click', function(e) {
            if (e.target.closest('.remove-filter')) {
                const button = e.target.closest('.remove-filter');
                const type = button.dataset.type;
                
                switch(type) {
                    case 'search':
                        activeFilters.search = '';
                        if (searchInput) searchInput.value = '';
                        break;
                    case 'category':
                        activeFilters.category = '';
                        if (categoryFilter) categoryFilter.value = '';
                        break;
                    case 'sort':
                        activeFilters.sort = 'newest';
                        if (sortFilter) sortFilter.value = 'newest';
                        break;
                }
                
                updateResults();
            }
        });
    }
    
    // 初始化结果显示
    updateResults();
}

// 初始化模板筛选功能
initTemplateFilters();

// Add CSS for modal and animations
const additionalStyles = `
    .site-header {
        transition: transform 0.3s ease;
    }
    
    .site-header.scrolled {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .image-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
    }
    
    .modal-backdrop {
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }
    
    .modal-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
    }
    
    .modal-close {
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        z-index: 1001;
    }
    
    .modal-image {
        max-width: 100%;
        max-height: 100%;
        border-radius: 8px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    @media (max-width: 768px) {
        .navbar-menu.active {
            display: flex;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-top: 1px solid #e5e7eb;
        }
        
        .navbar-nav {
            flex-direction: column;
            width: 100%;
            gap: 0;
        }
        
        .nav-item {
            width: 100%;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .nav-link {
            display: block;
            padding: 1rem 0;
            width: 100%;
        }
        
        .search-box {
            margin-top: 1rem;
            width: 100%;
        }
        
        .search-input {
            width: 100%;
        }
        
        .mobile-menu-toggle.active .hamburger-line:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-toggle.active .hamburger-line:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-toggle.active .hamburger-line:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);