import { useEffect, useRef } from 'react';

interface AmbientCanvasProps {
  celebrateTrigger: number;
}

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  speed: number;
}

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  swayPhase: number;
  opacity: number;
  color: string;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
  kind: 'heart' | 'sparkle';
  color: string;
}

const PETAL_COLORS = [
  'rgba(251, 113, 133, 0.55)',
  'rgba(244, 63, 94, 0.45)',
  'rgba(253, 164, 175, 0.55)',
  'rgba(255, 228, 230, 0.48)',
];

const CONFETTI_COLORS = [
  '#fb7185',
  '#f43f5e',
  '#fda4af',
  '#fcd34d',
  '#fde68a',
  '#fff1f2',
];

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  const s = size * 0.5;
  ctx.moveTo(0, s * 0.4);
  ctx.bezierCurveTo(-s, -s * 0.4, -s * 1.1, s * 0.8, 0, s * 1.45);
  ctx.bezierCurveTo(s * 1.1, s * 0.8, s, -s * 0.4, 0, s * 0.4);
  ctx.fill();
  ctx.restore();
}

export function AmbientCanvas({ celebrateTrigger }: AmbientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiRef = useRef<ConfettiParticle[]>([]);

  // Spawn celebratory heart confetti + golden sparkles when celebrateTrigger increments
  useEffect(() => {
    if (celebrateTrigger <= 0) return;
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : window.innerWidth;
    const height = canvas ? canvas.height : window.innerHeight;
    const originX = width * 0.5;
    const originY = height * 0.48;

    const burst: ConfettiParticle[] = [];
    for (let i = 0; i < 85; i++) {
      const angle = (Math.PI * 2 * i) / 85 + (Math.random() - 0.5) * 0.35;
      const speed = 2.6 + Math.random() * 6.8;
      burst.push({
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.4,
        size: i % 3 === 0 ? 7 + Math.random() * 6 : 9 + Math.random() * 9,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.14,
        life: 0,
        maxLife: 130 + Math.random() * 75,
        kind: i % 3 === 0 ? 'sparkle' : 'heart',
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      });
    }
    confettiRef.current = [...confettiRef.current, ...burst];
  }, [celebrateTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const fireflyCount = prefersReducedMotion ? 14 : 34;
    const petalCount = prefersReducedMotion ? 8 : 20;

    const fireflies: Firefly[] = Array.from({ length: fireflyCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: -0.15 - Math.random() * 0.28,
      radius: 1.5 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.018 + Math.random() * 0.025,
    }));

    const petals: Petal[] = Array.from({ length: petalCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0.25 + Math.random() * 0.5,
      vy: 0.55 + Math.random() * 0.75,
      size: 6 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.025,
      swayPhase: Math.random() * Math.PI * 2,
      opacity: 0.4 + Math.random() * 0.4,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    }));

    const fireflySprite = document.createElement('canvas');
    fireflySprite.width = 48;
    fireflySprite.height = 48;
    const fCtx = fireflySprite.getContext('2d');
    if (fCtx) {
      const grad = fCtx.createRadialGradient(24, 24, 0, 24, 24, 24);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      grad.addColorStop(0.35, 'rgba(251, 191, 36, 0.45)');
      grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      fCtx.fillStyle = grad;
      fCtx.fillRect(0, 0, 48, 48);
    }

    let rafId = 0;

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw falling rose/blossom petals
      for (const p of petals) {
        if (!prefersReducedMotion) {
          p.swayPhase += 0.02;
          p.x += p.vx + Math.sin(p.swayPhase) * 0.45;
          p.y += p.vy;
          p.rotation += p.vRot;

          if (p.y > height + 24) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 24) {
            p.x = -20;
          }
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.5, p.size * 0.9, p.size * 0.7, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.7, -p.size * 0.9, -p.size * 0.5, 0, -p.size);
        ctx.fill();
        ctx.restore();
      }

      // Draw glowing golden fireflies using cached sprite
      for (const f of fireflies) {
        if (!prefersReducedMotion) {
          f.phase += f.speed;
          f.x += f.vx + Math.sin(f.phase * 0.6) * 0.18;
          f.y += f.vy;

          if (f.y < -20) {
            f.y = height + 20;
            f.x = Math.random() * width;
          }
          if (f.x < -20) f.x = width + 20;
          if (f.x > width + 20) f.x = -20;
        }

        const pulse = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(f.phase));
        const size = f.radius * 9;
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.drawImage(fireflySprite, f.x - size * 0.5, f.y - size * 0.5, size, size);
        ctx.restore();
      }

      // Draw celebratory heart confetti & golden sparkles
      if (confettiRef.current.length > 0) {
        const remaining: ConfettiParticle[] = [];
        for (const c of confettiRef.current) {
          c.life += 1;
          c.x += c.vx;
          c.y += c.vy;
          c.vy += 0.08;
          c.vx *= 0.985;
          c.rotation += c.vRot;

          const progress = c.life / c.maxLife;
          const alpha = progress > 0.7 ? Math.max(0, 1 - (progress - 0.7) / 0.3) : 1;

          if (c.kind === 'heart') {
            drawHeart(ctx, c.x, c.y, c.size, c.rotation, c.color, alpha);
          } else {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rotation);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = c.color;
            ctx.beginPath();
            ctx.arc(0, 0, c.size * 0.32, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          if (c.life < c.maxLife) {
            remaining.push(c);
          }
        }
        confettiRef.current = remaining;
      }

      if (!prefersReducedMotion || confettiRef.current.length > 0) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {/* Dreamy Twilight / Sunset Velvet Rose Gradient Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 35%, rgba(126, 34, 65, 0.58) 0%, rgba(56, 15, 32, 0.92) 48%, #16070d 100%)',
        }}
      />
      {/* Warm Sunset Champagne Glow near horizon */}
      <div
        className="absolute -bottom-32 left-1/2 h-[420px] w-[780px] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(244, 114, 182, 0.16) 0%, rgba(251, 191, 36, 0.08) 45%, transparent 72%)',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
