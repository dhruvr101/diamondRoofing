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

  // Hero content GSAP polish (supplements CSS animations)
  gsap.fromTo(
    '.hero-badge',
    { opacity: 0, y: -16 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.2 }
  );

  gsap.fromTo(
    '.hero-title',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.5 }
  );

  gsap.fromTo(
    '.hero-ctas',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.1 }
  );

  gsap.fromTo(
    '.scroll-indicator',
    { opacity: 0 },
    { opacity: 1, duration: 1, delay: 1.6 }
  );
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
  // Subtle parallax on hero floating diamonds
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
