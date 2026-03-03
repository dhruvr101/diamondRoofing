// animations.ts — Scroll-triggered reveals, typewriter, counters

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ---------- TYPEWRITER ----------
const LINES = [
  'Premier Roofing & Solar in San Diego County',
  'Licensed, Bonded & Fully Insured',
  'Residential · Commercial · Emergency · Solar',
  'Free Estimates — Call 760-410-2340',
];

export function initTypewriter(): void {
  const el = document.getElementById('typewriter') as HTMLElement;
  if (!el) return;

  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let pauseTimer = 0;

  function type() {
    const currentLine = LINES[lineIndex];

    if (!isDeleting) {
      charIndex++;
      el.textContent = currentLine.slice(0, charIndex);

      if (charIndex === currentLine.length) {
        isDeleting = true;
        pauseTimer = 2400;
        setTimeout(type, pauseTimer);
        return;
      }
      setTimeout(type, 42);
    } else {
      charIndex--;
      el.textContent = currentLine.slice(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        lineIndex = (lineIndex + 1) % LINES.length;
        setTimeout(type, 400);
        return;
      }
      setTimeout(type, 22);
    }
  }

  setTimeout(type, 1200);
}

// ---------- SCROLL REVEAL ----------
export function initScrollReveal(): void {
  // Generic reveal elements
  document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      }
    );
  });

  // Staggered cards
  const cardGroups = [
    '.services-grid',
    '.solar-grid',
  ];

  cardGroups.forEach((selector) => {
    const container = document.querySelector<HTMLElement>(selector);
    if (!container) return;
    const cards = container.querySelectorAll('.reveal-card');

    gsap.fromTo(
      cards,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          once: true,
        },
      }
    );
  });

  // City badges stagger
  const cityBadges = document.querySelectorAll('.city-badge');
  if (cityBadges.length) {
    gsap.fromTo(
      cityBadges,
      { opacity: 0, scale: 0.85 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.5)',
        stagger: 0.03,
        scrollTrigger: {
          trigger: '.city-badges',
          start: 'top 85%',
          once: true,
        },
      }
    );
  }

  // Check items stagger in solar CTA
  const checkItems = document.querySelectorAll('.check-item');
  if (checkItems.length) {
    gsap.fromTo(
      checkItems,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: '.solar-cta',
          start: 'top 80%',
          once: true,
        },
      }
    );
  }

  // Hero animations are handled by CSS keyframes (fadeInDown/fadeInUp)
  // No GSAP duplication needed here
}

// ---------- ANIMATED COUNTERS ----------
export function initCounters(): void {
  const counters = document.querySelectorAll<HTMLElement>('.stat-number');

  counters.forEach((counter) => {
    const target = parseInt(counter.dataset.target || '0', 10);
    const suffix = counter.dataset.suffix || '';

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          counter,
          { textContent: '0' },
          {
            textContent: target,
            duration: 1.8,
            ease: 'power2.out',
            snap: { textContent: 1 },
            onUpdate() {
              const val = Math.round(parseFloat(counter.textContent || '0'));
              counter.textContent = val.toLocaleString() + suffix;
            },
            onComplete() {
              counter.textContent = target.toLocaleString() + suffix;
            },
          }
        );
      },
    });
  });
}

// ---------- SECTION PARALLAX ----------
export function initParallax(): void {
  gsap.to('.fd', {
    y: '30%',
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    },
  });
}

// ---------- MAP ANIMATION ----------
export function initMapAnimation(): void {
  const inner = document.querySelector<HTMLElement>('.ca-map-inner');
  if (!inner) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          inner.classList.add('map-active');
        } else {
          inner.classList.remove('map-active');
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(inner);
}

// ---------- GALLERY ----------
export function initGallery(): void {
  initGalleryLightbox();
}

function initGalleryLightbox(): void {
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg') as HTMLImageElement | null;
  const lightboxClose = document.getElementById('lightboxClose');

  if (!lightbox || !lightboxImg) return;

  document.querySelectorAll<HTMLElement>('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const close = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  lightboxClose?.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) close();
  });
}
