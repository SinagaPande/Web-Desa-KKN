// src/components/Global/Slideshow/GlobalSlideshow.js

/**
 * Class GlobalSlideshow
 * Menangani logika slideshow terpusat untuk Pertanian & Pendidikan.
 * Fitur: Autoplay, Navigasi, Lightbox Integration.
 */
export class GlobalSlideshow {
    /**
     * @param {string|HTMLElement} target - ID element atau DOM Element container
     * @param {string[]} images - Array URL gambar
     * @param {Object} options - Konfigurasi tambahan (opsional)
     * @param {number} [options.interval=4000] - Durasi autoplay (ms)
     */
    constructor(target, images, options = {}) {
        // Handle target berupa ID string atau direct element
        this.container = typeof target === 'string' 
            ? document.getElementById(target) 
            : target;

        if (!this.container) {
            console.error(`GlobalSlideshow: Container tidak ditemukan (${target})`);
            return;
        }

        this.images = images || [];
        this.interval = options.interval || 4000;
        
        // State
        this.currentIndex = 0;
        this.timer = null;
        this.slides = []; // Menyimpan referensi ke elemen slide {bg, fg}
        this.dots = [];   // Menyimpan referensi ke elemen dot
        this.isPlaying = true;

        // Bind method agar 'this' tetap terjaga saat dipanggil event listener
        this.handleLightboxOpen = this.handleLightboxOpen.bind(this);
        this.handleLightboxClose = this.handleLightboxClose.bind(this);

        this.init();
    }

    init() {
        // Bersihkan container sebelum render ulang
        this.container.innerHTML = '';
        this.slides = [];
        this.dots = [];

        // 1. Render Slides (Background & Foreground)
        this.images.forEach((imgSrc, index) => {
            // Background (Blur effect)
            const bg = document.createElement('div');
            bg.className = 'vanilla-slide slide-bg';
            bg.style.backgroundImage = `url('${encodeURI(imgSrc)}')`;
            
            // Foreground (Main Image)
            const fg = document.createElement('div');
            fg.className = 'vanilla-slide slide-fg';
            fg.style.backgroundImage = `url('${encodeURI(imgSrc)}')`;
            
            // Integrasi Global Lightbox (Click to Open)
            fg.addEventListener('click', () => {
                // Cek apakah function global tersedia (dari GlobalLightbox.astro)
                // @ts-ignore
                if (typeof window.openGlobalLightbox === 'function') {
                    // @ts-ignore
                    window.openGlobalLightbox({ src: imgSrc });
                }
            });

            // Set slide pertama aktif
            if (index === 0) {
                bg.classList.add('vanilla-active');
                fg.classList.add('vanilla-active');
            }

            this.container.appendChild(bg);
            this.container.appendChild(fg);
            this.slides.push({ bg, fg });
        });

        // 2. Render Controls (Panah & Dots)
        if (this.images.length > 1) {
            this.createControls();
            this.startAutoPlay();
            this.attachGlobalListeners();
        }
    }

    createControls() {
        // Tombol Kiri
        const leftArrow = document.createElement('div');
        leftArrow.className = 'vanilla-arrow vanilla-arrow--left';
        leftArrow.innerHTML = '&#10094;'; // Unicode Left Arrow
        leftArrow.onclick = (e) => { e.stopPropagation(); this.prevSlide(); };

        // Tombol Kanan
        const rightArrow = document.createElement('div');
        rightArrow.className = 'vanilla-arrow vanilla-arrow--right';
        rightArrow.innerHTML = '&#10095;'; // Unicode Right Arrow
        rightArrow.onclick = (e) => { e.stopPropagation(); this.nextSlide(); };

        // Dots Container
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'vanilla-indicators-container';

        this.images.forEach((_, index) => {
            const dot = document.createElement('div');
            // Dot aktif pertama
            dot.className = `vanilla-indicator-dot ${index === 0 ? 'vanilla-active' : ''}`;
            dot.onclick = (e) => { e.stopPropagation(); this.goToSlide(index); };
            
            dotsContainer.appendChild(dot);
            this.dots.push(dot);
        });

        this.container.appendChild(leftArrow);
        this.container.appendChild(rightArrow);
        this.container.appendChild(dotsContainer);
    }

    // --- NAVIGATION LOGIC ---

    goToSlide(index) {
        if (!this.slides[this.currentIndex]) return;

        // Remove active class from current
        this.slides[this.currentIndex].bg.classList.remove('vanilla-active');
        this.slides[this.currentIndex].fg.classList.remove('vanilla-active');
        this.dots[this.currentIndex].classList.remove('vanilla-active');

        // Update index
        this.currentIndex = index;

        // Add active class to new
        this.slides[this.currentIndex].bg.classList.add('vanilla-active');
        this.slides[this.currentIndex].fg.classList.add('vanilla-active');
        this.dots[this.currentIndex].classList.add('vanilla-active');

        this.resetTimer();
    }

    nextSlide() {
        this.goToSlide((this.currentIndex + 1) % this.images.length);
    }

    prevSlide() {
        this.goToSlide((this.currentIndex - 1 + this.images.length) % this.images.length);
    }

    // --- AUTOPLAY LOGIC ---

    startAutoPlay() {
        if (this.timer) clearInterval(this.timer);
        this.isPlaying = true;
        this.timer = setInterval(() => this.nextSlide(), this.interval);
    }

    stopAutoPlay() {
        this.isPlaying = false;
        if (this.timer) clearInterval(this.timer);
    }

    resetTimer() {
        if (this.isPlaying) this.startAutoPlay();
    }

    // --- GLOBAL EVENT HANDLERS (Lightbox Integration) ---

    handleLightboxOpen() {
        this.stopAutoPlay();
    }

    handleLightboxClose() {
        // Resume autoplay hanya jika user belum mematikan manual (opsional), 
        // untuk sekarang kita paksa start sesuai behaviour lama.
        this.startAutoPlay();
    }

    attachGlobalListeners() {
        window.addEventListener('lightbox:opened', this.handleLightboxOpen);
        window.addEventListener('lightbox:closed', this.handleLightboxClose);
    }

    // Method untuk bersih-bersih jika komponen di-unmount (SPA navigation)
    destroy() {
        this.stopAutoPlay();
        window.removeEventListener('lightbox:opened', this.handleLightboxOpen);
        window.removeEventListener('lightbox:closed', this.handleLightboxClose);
        this.container.innerHTML = '';
    }
}