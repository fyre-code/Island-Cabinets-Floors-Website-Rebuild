document.addEventListener('DOMContentLoaded', () => {

  // =====================
  // DISABLE TEL LINKS ON DESKTOP
  // =====================
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="tel:"]');
    if (link && window.innerWidth > 768) e.preventDefault();
  });


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
  // NAV DROPDOWN
  // =====================
  document.querySelectorAll('.nav-has-dropdown').forEach(item => {
    const toggle = item.querySelector('.nav-dropdown-toggle');
    toggle.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = item.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-has-dropdown')) {
      document.querySelectorAll('.nav-has-dropdown.open').forEach(item => {
        item.classList.remove('open');
        item.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
      });
    }
  });


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
      if (!slideshowTimer) slideshowTimer = setInterval(nextSlide, 5000);
    }

    function stopSlideshow() {
      if (slideshowTimer) { clearInterval(slideshowTimer); slideshowTimer = null; }
    }

    const heroObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) startSlideshow(); else stopSlideshow();
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
      return 1;
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
        dot.addEventListener('click', () => { goTo(i * visible); resetAutoAdvance(); });
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

    // Auto-advance every 15 seconds
    let autoAdvanceTimer = setInterval(() => {
      const items = getVisibleItems();
      const maxIndex = Math.max(0, items.length - visible);
      const next = current + visible > maxIndex ? 0 : current + visible;
      goTo(next);
    }, 15000);

    function resetAutoAdvance() {
      clearInterval(autoAdvanceTimer);
      autoAdvanceTimer = setInterval(() => {
        const items = getVisibleItems();
        const maxIndex = Math.max(0, items.length - visible);
        const next = current + visible > maxIndex ? 0 : current + visible;
        goTo(next);
      }, 15000);
    }

    prevBtn.addEventListener('click', () => { goTo(current - visible); resetAutoAdvance(); });
    nextBtn.addEventListener('click', () => { goTo(current + visible); resetAutoAdvance(); });

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
          resetAutoAdvance();
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


  // =====================
  // BOOKING MODAL
  // =====================
  (function () {
    var modal = document.createElement('div');
    modal.id = 'booking-modal';
    modal.className = 'booking-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Book a Measure');
    modal.innerHTML =
      '<div class="booking-modal-inner">' +
        '<button class="booking-modal-close" id="booking-modal-close" aria-label="Close booking calendar"><i class="fas fa-times"></i></button>' +
        '<iframe src="https://hyppohq.io/book/8f1844f1-5656-463b-ba0b-e71c595e0f7a?embed=true&theme=dark" style="width:100%;min-height:700px;border:none;" allowfullscreen></iframe>' +
      '</div>';
    document.body.appendChild(modal);

    function openModal() {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-booking]');
      if (btn) { e.preventDefault(); openModal(); }
      if (e.target === modal) closeModal();
    });

    document.getElementById('booking-modal-close').addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  })();




  // =====================
  // REVIEW MODAL
  // =====================
  (function () {
    var modal = document.createElement('div');
    modal.id = 'review-modal';
    modal.className = 'booking-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Leave a Review');
    modal.innerHTML =
      '<div class="booking-modal-inner">' +
        '<button class="booking-modal-close" id="review-modal-close" aria-label="Close review form"><i class="fas fa-times"></i></button>' +
        '<iframe src="https://hyppohq.io/w/leave-a-review?embed=true" style="width:100%;min-height:400px;border:none;" allowfullscreen></iframe>' +
      '</div>';
    document.body.appendChild(modal);

    function openModal() {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-review]');
      if (btn) { e.preventDefault(); openModal(); }
      if (e.target === modal) closeModal();
    });

    document.getElementById('review-modal-close').addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  })();

});
