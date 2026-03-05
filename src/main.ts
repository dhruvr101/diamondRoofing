// main.ts — Diamond in the Sky Roofing entry point

import './style.css';
import { initNav } from './nav';
import { initCanvas } from './canvas';
import { initTypewriter, initScrollReveal, initCounters, initParallax, initGallery, initMapAnimation } from './animations';
import { initFunnel } from './funnel';
import { initChatbot } from './chatbot';

function initTestimonialCarousel(): void {
  const track = document.querySelector('.testimonials-slider') as HTMLElement | null;
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.testimonial-card')) as HTMLElement[];
  const dots = Array.from(document.querySelectorAll('.testimonial-dot')) as HTMLElement[];
  const total = cards.length;
  let current = 0;
  let autoTimer: ReturnType<typeof setInterval>;

  function goTo(index: number): void {
    current = ((index % total) + total) % total;
    const cardWidth = (track!.parentElement as HTMLElement).offsetWidth;
    track!.style.transform = `translateX(-${current * cardWidth}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next(): void { goTo(current + 1); }

  function startAuto(): void {
    autoTimer = setInterval(next, 4500);
  }
  function stopAuto(): void {
    clearInterval(autoTimer);
  }

  document.querySelector('.carousel-prev')?.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  document.querySelector('.carousel-next')?.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); });
  });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? goTo(current + 1) : goTo(current - 1);
    startAuto();
  }, { passive: true });

  startAuto();
}

function init() {
  initNav();
  initCanvas();
  initTypewriter();
  initScrollReveal();
  initCounters();
  initParallax();
  initGallery();
  initMapAnimation();
  initFunnel();
  initChatbot();

  // Mobile-only auto-scroll for testimonials, centers each card, loops, and supports swipe
  if (window.innerWidth <= 600) {
    const slider = document.querySelector<HTMLElement>('.testimonials-slider');
    const cards = slider ? Array.from(slider.querySelectorAll<HTMLElement>('.testimonial-card')) : [];
    let currentIndex = 0;
    const totalCards = Math.min(cards.length, 6); // Oscillate over 6 testimonials
    function scrollToCard(index: number) {
      if (!slider || totalCards === 0) return;
      const card = cards[index] as HTMLElement;
      const left = card.offsetLeft - (slider.clientWidth - card.clientWidth) / 2;
      slider.scrollTo({ left, behavior: 'smooth' });
    }
    if (slider && totalCards > 0) {
      scrollToCard(0);
      setInterval(() => {
        currentIndex = (currentIndex + 1) % totalCards;
        scrollToCard(currentIndex);
      }, 1000);

      // Swipe support
      let touchStartX = 0;
      slider.addEventListener('touchstart', (e: TouchEvent) => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      slider.addEventListener('touchend', (e: TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) {
          if (dx < 0) {
            currentIndex = (currentIndex + 1) % totalCards;
          } else {
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
          }
          scrollToCard(currentIndex);
        }
      }, { passive: true });
    }
  }
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    initTestimonialCarousel();
  });
} else {
  init();
  initTestimonialCarousel();
}
function initFAQ(): void {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");

    question?.addEventListener("click", () => {
      // Close others (optional but cleaner)
      faqItems.forEach(i => {
        if (i !== item) i.classList.remove("active");
      });

      item.classList.toggle("active");
    });
  });
}

// Run after DOM loads
document.addEventListener("DOMContentLoaded", () => {
  initFAQ();
});