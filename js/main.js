document.addEventListener('DOMContentLoaded', () => {

  // =====================
  // DYNAMIC FOOTER YEAR
  // =====================
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  // =====================
  // MOBILE NAV TOGGLE
  // =====================
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close nav when a link is clicked (mobile)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }


  // =====================
  // HERO SLIDESHOW
  // =====================
  const hero   = document.getElementById('hero');
  const slides = hero ? hero.querySelectorAll('.hero-slide') : [];

  if (slides.length > 1) {
    let currentSlide = 0;
    let slideshowTimer = null;

    function nextSlide() {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }

    function startSlideshow() {
      if (!slideshowTimer) {
        slideshowTimer = setInterval(nextSlide, 5000);
      }
    }

    function stopSlideshow() {
      if (slideshowTimer) {
        clearInterval(slideshowTimer);
        slideshowTimer = null;
      }
    }

    // Pause when hero is off-screen (saves CPU / battery)
    const heroObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startSlideshow();
        } else {
          stopSlideshow();
        }
      });
    }, { threshold: 0.05 });

    heroObserver.observe(hero);
  }


  // =====================
  // FAQ ACCORDION
  // =====================
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

      // Toggle clicked
      if (!isOpen) item.classList.add('open');
    });
  });


  // =====================
  // GALLERY FILTER TABS
  // =====================
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item[data-category]');

  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.dataset.filter;

        galleryItems.forEach(item => {
          if (category === 'all' || item.dataset.category === category) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });

        // Reset carousel position after filter
        goTo(0);
      });
    });
  }


  // =====================
  // GALLERY CAROUSEL + LIGHTBOX
  // =====================
  const track       = document.getElementById('gallery-track');
  const prevBtn     = document.getElementById('gallery-prev');
  const nextBtn     = document.getElementById('gallery-next');
  const dotsContainer = document.getElementById('gallery-dots');
  const lightbox    = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev  = document.getElementById('lightbox-prev');
  const lightboxNext  = document.getElementById('lightbox-next');

  // Make goTo available to filter code above via outer scope
  let goTo = () => {};

  if (track && prevBtn && nextBtn) {
    function getVisibleCount() {
      if (window.innerWidth <= 480)  return 1;
      if (window.innerWidth <= 1025) return 2;
      return 4;
    }

    function getVisibleItems() {
      return Array.from(track.querySelectorAll('.gallery-item')).filter(
        el => el.style.display !== 'none'
      );
    }

    let current = 0;
    let visible = getVisibleCount();

    function buildDots() {
      if (!dotsContainer) return;
      visible = getVisibleCount();
      dotsContainer.innerHTML = '';
      const items = getVisibleItems();
      const pageCount = Math.ceil(items.length / visible);
      for (let i = 0; i < pageCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i * visible));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      const activePage = Math.floor(current / visible);
      dots.forEach((d, i) => d.classList.toggle('active', i === activePage));
    }

    goTo = function(index) {
      const items = getVisibleItems();
      const maxIndex = Math.max(0, items.length - visible);
      current = Math.max(0, Math.min(index, maxIndex));
      const itemWidth = items[0] ? items[0].offsetWidth + 12 : 0;
      track.style.transform = `translateX(-${current * itemWidth}px)`;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current >= maxIndex;
      updateDots();
    };

    prevBtn.addEventListener('click', () => goTo(current - visible));
    nextBtn.addEventListener('click', () => goTo(current + visible));

    window.addEventListener('resize', () => {
      visible = getVisibleCount();
      current = 0;
      buildDots();
      goTo(0);
    });

    buildDots();
    goTo(0);

    // Touch swipe support
    let touchStartX = 0;
    const wrapper = document.querySelector('.gallery-track-wrapper');
    if (wrapper) {
      wrapper.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      wrapper.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          goTo(diff > 0 ? current + visible : current - visible);
        }
      });
    }

    // --- LIGHTBOX ---
    let lightboxIndex = 0;

    function getAllImages() {
      return Array.from(track.querySelectorAll('.gallery-item'))
        .filter(el => el.style.display !== 'none')
        .map(el => el.querySelector('img'));
    }

    function openLightbox(index) {
      const images = getAllImages();
      if (!images[index]) return;
      lightboxIndex = index;
      lightboxImg.src  = images[index].src;
      lightboxImg.alt  = images[index].alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lightboxPrev.disabled = index === 0;
      lightboxNext.disabled = index === images.length - 1;
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    }

    track.querySelectorAll('.gallery-item').forEach((item, i) => {
      item.addEventListener('click', () => {
        const visibleItems = getVisibleItems();
        const visibleIndex = visibleItems.indexOf(item);
        if (visibleIndex !== -1) openLightbox(visibleIndex);
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => {
      if (lightboxIndex > 0) openLightbox(lightboxIndex - 1);
    });
    if (lightboxNext) lightboxNext.addEventListener('click', () => {
      const images = getAllImages();
      if (lightboxIndex < images.length - 1) openLightbox(lightboxIndex + 1);
    });

    document.addEventListener('keydown', e => {
      if (!lightbox || !lightbox.classList.contains('open')) return;
      const images = getAllImages();
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft'  && lightboxIndex > 0) openLightbox(lightboxIndex - 1);
      if (e.key === 'ArrowRight' && lightboxIndex < images.length - 1) openLightbox(lightboxIndex + 1);
    });
  }

});
