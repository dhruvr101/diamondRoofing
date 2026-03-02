// main.ts — Diamond in the Sky Roofing entry point

import './style.css';
import { initNav } from './nav';
import { initCanvas } from './canvas';
import { initTypewriter, initScrollReveal, initCounters, initParallax, initGallery } from './animations';
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
  initFunnel();
  initChatbot();
}

// Run after DOM is ready
if (document.readyState === 'loading') {

  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
