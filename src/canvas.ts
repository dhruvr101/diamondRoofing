// canvas.ts — Animated particle/star background for hero

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  opacityDir: number;
  r: number;
  g: number;
  b: number;
}

// Fixed palette — soft whites and golds for hero overlay on cover image
const PALETTE = [
  { r: 255, g: 255, b: 255 },
  { r: 251, g: 191, b:  36 },
  { r: 255, g: 255, b: 255 },
  { r: 255, g: 220, b: 130 },
];

const MAX_DIST    = 120;
const MAX_DIST_SQ = MAX_DIST * MAX_DIST;
const MOUSE_DIST  = 80;
const MOUSE_DIST_SQ = MOUSE_DIST * MOUSE_DIST;

export function initCanvas(): void {
  const canvas = document.getElementById('heroCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d')!;
  let width = 0;
  let height = 0;
  let particles: Particle[] = [];
  let animId: number;

  // Mouse position tracked via event, applied inside RAF
  let mouseX = -9999;
  let mouseY = -9999;

  function resize() {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles();
  }

  function initParticles() {
    const count = Math.floor((width * height) / 12000);
    particles = Array.from({ length: count }, () => createParticle());
  }

  function createParticle(): Particle {
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.3,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.1,
      opacityDir: (Math.random() > 0.5 ? 1 : -1) * 0.003,
      r: color.r,
      g: color.g,
      b: color.b,
    };
  }

  function drawConnections() {
    // Set line style once for all connections
    ctx.lineWidth = 0.5;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];
        const dx = p.x - other.x;
        const dy = p.y - other.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < MAX_DIST_SQ) {
          // sqrt only when close enough to actually draw
          const alpha = (1 - Math.sqrt(distSq) / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255,255,255,${(alpha * 0.45).toFixed(3)})`;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);

    drawConnections();

    particles.forEach((p) => {
      // Move
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around
      if (p.x < -10) p.x = width + 10;
      else if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      else if (p.y > height + 10) p.y = -10;

      // Mouse repulsion applied inside RAF — consistent with frame rate
      const dxM = p.x - mouseX;
      const dyM = p.y - mouseY;
      const distMSq = dxM * dxM + dyM * dyM;
      if (distMSq < MOUSE_DIST_SQ && distMSq > 0) {
        const distM = Math.sqrt(distMSq);
        const force = (MOUSE_DIST - distM) / MOUSE_DIST;
        p.x += (dxM / distM) * force * 1.5;
        p.y += (dyM / distM) * force * 1.5;
      }

      // Pulse opacity
      p.opacity += p.opacityDir;
      if (p.opacity > 0.8 || p.opacity < 0.05) p.opacityDir *= -1;

      // Draw particle — compose rgba directly from stored components
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.opacity.toFixed(3)})`;
      ctx.fill();

      // Glow for larger particles — simple circle, no gradient per frame
      if (p.size > 1.2) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${(p.opacity * 0.08).toFixed(3)})`;
        ctx.fill();
      }
    });

    animId = requestAnimationFrame(tick);
  }

  // Only store mouse position in handler; physics runs in RAF
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Init
  resize();
  tick();
  window.addEventListener('resize', resize, { passive: true });

  // Pause when not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      tick();
    }
  });
}
