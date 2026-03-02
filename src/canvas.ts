// canvas.ts — Animated particle/star background for hero

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  opacityDir: number;
  color: string;
}

export function initCanvas(): void {
  const canvas = document.getElementById('heroCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d')!;
  let width = 0;
  let height = 0;
  let particles: Particle[] = [];
  let animId: number;

  const COLORS = [
    'rgba(0, 212, 255, 0.8)',
    'rgba(255, 215, 0, 0.6)',
    'rgba(123, 47, 255, 0.6)',
    'rgba(255, 255, 255, 0.6)',
  ];

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
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.3,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.1,
      opacityDir: (Math.random() > 0.5 ? 1 : -1) * 0.003,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function drawConnections(p: Particle, index: number) {
    for (let i = index + 1; i < particles.length; i++) {
      const other = particles[i];
      const dx = p.x - other.x;
      const dy = p.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 120;

      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.12;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p, i) => {
      // Move
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      // Pulse opacity
      p.opacity += p.opacityDir;
      if (p.opacity > 0.8 || p.opacity < 0.05) p.opacityDir *= -1;

      // Draw connection lines
      drawConnections(p, i);

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace('0.8', p.opacity.toString()).replace('0.6', p.opacity.toString());
      ctx.fill();

      // Glow for larger particles
      if (p.size > 1.2) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grad.addColorStop(0, `rgba(0, 212, 255, ${p.opacity * 0.2})`);
        grad.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
      }
    });

    animId = requestAnimationFrame(tick);
  }

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Subtle parallax push on particles near mouse
    particles.forEach(p => {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        const force = (80 - dist) / 80;
        p.x += (dx / dist) * force * 1.5;
        p.y += (dy / dist) * force * 1.5;
      }
    });
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
