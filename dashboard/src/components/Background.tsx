import { useEffect, useRef } from 'react';

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const chars = ['0', '1', '{', '}', '/', '<', '>', '*', 'A', 'I'];
    const fontSize = 14;
    let rafId = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const noise = (x: number, y: number, t: number) => (
      Math.sin(x * 0.08 + t) * Math.cos(y * 0.08 + t * 0.8)
      + Math.sin(y * 0.12 - t * 0.4) * Math.cos(x * 0.12 + t * 0.5)
    );

    const render = (time: number) => {
      const t = time * 0.0005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      const cols = Math.floor(canvas.width / fontSize);
      const rows = Math.floor(canvas.height / fontSize);
      const cx = canvas.width * 0.7;
      const cy = canvas.height * 0.5;

      for (let i = 0; i < cols; i += 1) {
        for (let j = 0; j < rows; j += 1) {
          const x = i * fontSize + fontSize / 2;
          const y = j * fontSize + fontSize / 2;
          const dx = x - cx;
          const dy = y - cy;
          const headDist = Math.hypot(dx, (dy + canvas.height * 0.15) * 1.2);
          const torsoDist = Math.hypot(dx * 0.8, dy - canvas.height * 0.15);

          let baseIntensity = 0;
          if (headDist < 140) baseIntensity = 1 - headDist / 140;
          else if (torsoDist < 280 && dy > -canvas.height * 0.1) baseIntensity = 1 - torsoDist / 280;

          const intensity = Math.max(0, baseIntensity + noise(i * 0.5, j * 0.5, t) * 0.35);
          if (intensity <= 0.08) continue;

          const alpha = Math.min(0.42, intensity * 0.35);
          const char = chars[(i + j + Math.floor(time / 150)) % chars.length];
          ctx.fillStyle = `rgba(125, 211, 252, ${alpha})`;
          ctx.fillText(char, x, y);
        }
      }

      rafId = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    rafId = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden grid-bg">
        <div className="orb left-[12%] top-[8%] h-[35vw] w-[35vw] bg-cyan-900/15" style={{ filter: 'blur(120px)' }} />
        <div className="orb bottom-[8%] right-[12%] h-[32vw] w-[32vw] bg-emerald-900/10" style={{ filter: 'blur(140px)' }} />
        <div className="orb left-[46%] top-[54%] h-[20vw] w-[20vw] bg-purple-900/10" style={{ filter: 'blur(100px)' }} />
      </div>
      <canvas
        ref={canvasRef}
        id="ascii-canvas"
        className="fixed inset-0 z-0 pointer-events-none opacity-35"
      />
    </>
  );
}
