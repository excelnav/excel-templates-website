/**
 * 模板详情页交互功能
 * Template Detail Page Interactive Features
 */

// 全局变量
let currentImageIndex = 0;
let screenshots = [];

/**
 * 缩放相关变量
 * Zoom related variables
 */
let currentZoom = 1;
let minZoom = 0.5;
let maxZoom = 3;
let zoomStep = 0.1;



/**
 * 打开全屏模式
 * Open fullscreen mode
 */
function openFullscreen() {
    console.log('=== openFullscreen 函数被调用 ===');
    console.log('screenshots数组:', screenshots);
    console.log('currentImageIndex:', currentImageIndex);
    
    if (screenshots && screenshots.length > 0) {
        console.log('screenshots数组有效，长度:', screenshots.length);
        
        const modal = document.getElementById('fullscreen-modal');
        const fullscreenImage = document.getElementById('fullscreen-image');
        
        console.log('modal元素:', modal);
        console.log('fullscreenImage元素:', fullscreenImage);
        
        if (modal && fullscreenImage) {
            const imagePath = screenshots[currentImageIndex];
            console.log('设置图片路径:', imagePath);
            
            fullscreenImage.src = imagePath;
            console.log('图片src设置后:', fullscreenImage.src);
            console.log('图片完整URL:', fullscreenImage.src);
            
            // 添加图片加载事件监听
            fullscreenImage.onload = function() {
                console.log('图片加载成功:', this.src);
                console.log('图片尺寸:', this.naturalWidth, 'x', this.naturalHeight);
            };
            
            fullscreenImage.onerror = function() {
                console.error('图片加载失败:', this.src);
            };
            
            modal.classList.add('active');
            console.log('模态框active类已添加');
            console.log('模态框当前类名:', modal.className);
            
            // 重置缩放状态
            currentZoom = 1;
            applyZoom(fullscreenImage);
            
            document.body.style.overflow = 'hidden';
            initWheelZoom(fullscreenImage);
        } else {
            console.error('找不到必要的DOM元素');
            console.error('modal:', modal);
            console.error('fullscreenImage:', fullscreenImage);
        }
    } else {
        console.error('screenshots数组无效或为空');
        console.error('screenshots:', screenshots);
    }
}

/**
 * 关闭全屏模式
 * Close fullscreen mode
 */
function closeFullscreen() {
    const modal = document.getElementById('fullscreen-modal');
    const fullscreenImage = document.getElementById('fullscreen-image');
    
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // 移除滚轮事件监听器
        modal.removeEventListener('wheel', handleWheelZoom);
        
        // 重置缩放状态
        currentZoom = 1;
        if (fullscreenImage) {
            fullscreenImage.style.transform = '';
            fullscreenImage.style.transition = '';
        }
        
        // 移除缩放指示器
        const zoomIndicator = document.querySelector('.zoom-indicator');
        if (zoomIndicator) {
            zoomIndicator.remove();
        }
    }
}

/**
 * 全屏模式下的上一张图片
 * Previous image in fullscreen mode
 */
function previousImageFullscreen() {
    previousImage();
}

/**
 * 全屏模式下的下一张图片
 * Next image in fullscreen mode
 */
function nextImageFullscreen() {
    nextImage();
}

document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initScreenshotGallery();
    initDownloadTracking();
    initCopyURL();
    initSmoothScrolling();
    initTooltips();
    initKeyboardNavigation();
});

/**
 * 初始化截图画廊功能
 * Initialize screenshot gallery functionality
 */
function initScreenshotGallery() {
    // 获取缩略图
    const thumbnails = document.querySelectorAll('.thumbnail-nav img');
    const mainImage = document.querySelector('#main-screenshot');
    
    // 如果没找到缩略图，尝试备用选择器
    const altThumbnails = document.querySelectorAll('.thumbnail-nav img, .screenshot-thumbnails img, img[src*="templates"]');
    const altMainImage = document.querySelector('#main-screenshot, .main-screenshot img, .screenshot-image');
    
    if (altThumbnails.length > 0) {
        const screenshotList = [];
        altThumbnails.forEach((thumb, index) => {
            screenshotList.push(thumb.src);
        });
        
        if (screenshotList.length > 0) {
            setupScreenshotGallery(screenshotList, 0);
        }
    } else if (thumbnails.length > 0) {
        const screenshotList = [];
        thumbnails.forEach((thumb, index) => {
            screenshotList.push(thumb.src);
        });
        
        if (screenshotList.length > 0) {
            setupScreenshotGallery(screenshotList, 0);
        }
    }
}

/**
 * 设置截图画廊
 * Setup screenshot gallery
 */
function setupScreenshotGallery(screenshotList, currentIndex) {
    if (!screenshotList || screenshotList.length === 0) return;
    
    screenshots = screenshotList;
    currentImageIndex = currentIndex;
    
    // 为主截图添加点击事件
    const mainScreenshot = document.querySelector('.main-screenshot img');
    const altMainScreenshot = document.querySelector('#main-screenshot');
    
    if (altMainScreenshot) {
        altMainScreenshot.addEventListener('click', function() {
            openFullscreen();
        });
        altMainScreenshot.style.cursor = 'pointer';
    } else if (mainScreenshot) {
        mainScreenshot.addEventListener('click', function() {
            openFullscreen();
        });
        mainScreenshot.style.cursor = 'pointer';
    }
    
    // 初始化键盘事件
    initKeyboardNavigation();
}

/**
 * 显示指定索引的图片
 * Show image at specified index
 * @param {number} index - 图片索引
 */
function showImage(index) {
    if (index < 0 || index >= screenshots.length) {
        return;
    }
    
    currentImageIndex = index;
    
    // 更新主图片
    const mainImage = document.getElementById('main-screenshot');
    if (mainImage) {
        mainImage.src = screenshots[index];
        mainImage.alt = `Screenshot ${index + 1}`;
    }
    
    // 更新缩略图状态
    const thumbnails = document.querySelectorAll('.thumbnail-nav img, .screenshot-thumbnails img, img[src*="templates"]');
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    // 更新全屏图片
    const fullscreenImage = document.getElementById('fullscreen-image');
    if (fullscreenImage) {
        fullscreenImage.src = screenshots[index];
    }
}

/**
 * 显示上一张图片
 * Show previous image
 */
function previousImage() {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : screenshots.length - 1;
    showImage(newIndex);
}

/**
 * 显示下一张图片
 * Show next image
 */
function nextImage() {
    const newIndex = currentImageIndex < screenshots.length - 1 ? currentImageIndex + 1 : 0;
    showImage(newIndex);
}



/**
 * 初始化键盘导航
 * Initialize keyboard navigation
 */
function initKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('fullscreen-modal');
        const isFullscreen = modal && modal.classList.contains('active');
        
        switch(e.key) {
            case 'ArrowLeft':
                if (isFullscreen || screenshots.length > 1) {
                    e.preventDefault();
                    previousImage();
                }
                break;
            case 'ArrowRight':
                if (isFullscreen || screenshots.length > 1) {
                    e.preventDefault();
                    nextImage();
                }
                break;
            case 'Escape':
                if (isFullscreen) {
                    e.preventDefault();
                    closeFullscreen();
                }
                break;
            case ' ':
                if (isFullscreen) {
                    e.preventDefault();
                    nextImage();
                }
                break;
        }
    });
    
    // 点击模态框背景关闭
    const modal = document.getElementById('fullscreen-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeFullscreen();
            }
        });
    }
}

/**
 * 下载跟踪功能
 * Download tracking functionality
 */
function initDownloadTracking() {
    const downloadBtns = document.querySelectorAll('.download-btn');
    
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const templateName = document.querySelector('.template-title')?.textContent || 'Unknown Template';
            
            // 这里可以添加分析跟踪代码
            console.log(`Template downloaded: ${templateName}`);
            
            // 显示下载提示
            showNotification('Download started! Thank you for using our template.', 'success');
        });
    });
}

/**
 * 复制URL功能
 * Copy URL functionality
 */
function initCopyURL() {
    const copyBtns = document.querySelectorAll('.copy-url-btn');
    
    copyBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 复制当前页面URL
            navigator.clipboard.writeText(window.location.href).then(() => {
                showNotification('URL copied to clipboard!', 'success');
                
                // 临时改变按钮文本
                const originalText = this.innerHTML;
                this.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Copied!
                `;
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            }).catch(() => {
                showNotification('Failed to copy URL', 'error');
            });
        });
    });
}

/**
 * 平滑滚动功能
 * Smooth scrolling functionality
 */
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * 工具提示功能
 * Tooltips functionality
 */
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltipText = this.dataset.tooltip;
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            
            setTimeout(() => tooltip.classList.add('visible'), 10);
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.classList.remove('visible');
                setTimeout(() => {
                    if (tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 200);
            }
        });
    });
}

/**
 * 显示通知消息
 * Show notification message
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 (success, error, info)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 页面加载完成后的额外初始化
window.addEventListener('load', function() {
    // 添加页面加载完成的动画效果
    const templateDetail = document.querySelector('.template-detail');
    if (templateDetail) {
        templateDetail.style.opacity = '0';
        templateDetail.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            templateDetail.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            templateDetail.style.opacity = '1';
            templateDetail.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // 预加载关键图片
    const previewImage = document.querySelector('.preview-image');
    if (previewImage && previewImage.src) {
        const img = new Image();
        img.src = previewImage.src;
    }
});

/**
 * 初始化滚轮缩放功能
 * Initialize wheel zoom functionality
 * @param {HTMLImageElement} imageElement - 图片元素
 */
function initWheelZoom(imageElement) {
    const modal = document.getElementById('fullscreen-modal');
    
    if (!modal || !imageElement) return;
    
    // 移除之前的事件监听器（如果存在）
    modal.removeEventListener('wheel', handleWheelZoom);
    
    // 添加滚轮事件监听器
    modal.addEventListener('wheel', handleWheelZoom, { passive: false });
}

/**
 * 处理滚轮缩放事件
 * Handle wheel zoom event
 * @param {WheelEvent} event - 滚轮事件
 */
function handleWheelZoom(event) {
    event.preventDefault();
    
    const fullscreenImage = document.getElementById('fullscreen-image');
    if (!fullscreenImage) return;
    
    // 获取滚轮方向
    const delta = event.deltaY > 0 ? -zoomStep : zoomStep;
    
    // 计算新的缩放比例
    const newZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + delta));
    
    if (newZoom !== currentZoom) {
        currentZoom = newZoom;
        applyZoom(fullscreenImage);
        
        // 显示缩放提示
        showZoomIndicator(Math.round(currentZoom * 100));
    }
}

/**
 * 应用缩放效果
 * Apply zoom effect
 * @param {HTMLImageElement} imageElement - 图片元素
 */
function applyZoom(imageElement) {
    if (!imageElement) return;
    
    imageElement.style.transform = `scale(${currentZoom})`;
    imageElement.style.transformOrigin = 'center center';
    imageElement.style.transition = 'transform 0.1s ease-out';
}

/**
 * 显示缩放指示器
 * Show zoom indicator
 * @param {number} zoomPercent - 缩放百分比
 */
function showZoomIndicator(zoomPercent) {
    // 移除现有的缩放指示器
    const existingIndicator = document.querySelector('.zoom-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // 创建新的缩放指示器
    const indicator = document.createElement('div');
    indicator.className = 'zoom-indicator';
    indicator.textContent = `${zoomPercent}%`;
    
    // 添加到模态框中
    const modal = document.getElementById('fullscreen-modal');
    if (modal) {
        modal.appendChild(indicator);
        
        // 自动隐藏指示器
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 1000);
    }
}