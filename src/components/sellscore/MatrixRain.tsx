import { useEffect, useRef } from 'react';

// ============================================================
// 매트릭스 수식 비 — 진단 로딩 화면 배경용 캔버스 애니메이션.
// 숫자·수학 기호가 천천히 흘러내린다. 영상 파일 대신 캔버스로 그려서
// 추가 다운로드 없이 즉시 재생되고, 어떤 해상도에서도 선명하다.
// prefers-reduced-motion 사용자에게는 정적 화면만 보여준다.
// ============================================================

const GLYPHS = '0123456789Σ∫πλβ∂√≈×±=ƒθΔ%';

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let columns: { y: number; speed: number; glyphs: string[] }[] = [];
    const FONT_SIZE = 15;
    const COL_WIDTH = 24;
    const TRAIL = 14; // 한 줄기당 글자 수

    const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.ceil(width / COL_WIDTH);
      columns = Array.from({ length: count }, () => ({
        y: Math.random() * height,
        speed: 14 + Math.random() * 22, // px/초 — 빗줄기처럼 천천히
        glyphs: Array.from({ length: TRAIL }, randomGlyph),
      }));
    };

    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      ctx.clearRect(0, 0, width, height);
      ctx.font = `${FONT_SIZE}px "SF Mono", ui-monospace, monospace`;
      ctx.textAlign = 'center';

      columns.forEach((col, i) => {
        col.y += col.speed * dt;
        if (col.y - TRAIL * FONT_SIZE * 1.4 > height) {
          col.y = -Math.random() * height * 0.5;
          col.speed = 14 + Math.random() * 22;
        }
        // 가끔 글자를 무작위로 바꿔서 살아있는 느낌
        if (Math.random() < 0.04) {
          col.glyphs[Math.floor(Math.random() * TRAIL)] = randomGlyph();
        }
        const x = i * COL_WIDTH + COL_WIDTH / 2;
        for (let t = 0; t < TRAIL; t++) {
          const gy = col.y - t * FONT_SIZE * 1.4;
          if (gy < -FONT_SIZE || gy > height + FONT_SIZE) continue;
          const alpha = t === 0 ? 0.55 : 0.4 * (1 - t / TRAIL);
          ctx.fillStyle =
            t === 0 ? `rgba(123, 214, 255, ${alpha})` : `rgba(91, 155, 255, ${alpha})`;
          ctx.fillText(col.glyphs[t], x, gy);
        }
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
      aria-hidden="true"
    />
  );
}
