// main.ts — Diamond in the Sky Roofing entry point

import './style.css';
import { initNav } from './nav';
import { initCanvas } from './canvas';
import { initTypewriter, initScrollReveal, initCounters, initParallax, initGallery, initMapAnimation } from './animations';
import { initFunnel } from './funnel';
import { initChatbot } from './chatbot';


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

  // Testimonials are now static. No mobile auto-scroll or swipe logic.
}

// Run after DOM is ready
if (document.readyState === 'loading') {

  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
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