import React, { useEffect, useRef } from 'react';

interface SnowEffectProps {
  isActive: boolean;
  className?: string;
}

const SnowEffect: React.FC<SnowEffectProps> = ({ isActive, className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let parentWidth = canvas.parentElement?.clientWidth || window.innerWidth;
    let parentHeight = canvas.parentElement?.clientHeight || window.innerHeight;

    // Handle resizing based on parent container
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        parentWidth = entry.contentRect.width;
        parentHeight = entry.contentRect.height;
        canvas.width = parentWidth;
        canvas.height = parentHeight;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const snowflakes: { x: number; y: number; r: number; d: number; speed: number }[] = [];
    const maxFlakes = 60; // Subtle count

    // Initialize flakes
    for (let i = 0; i < maxFlakes; i++) {
      snowflakes.push({
        x: Math.random() * parentWidth,
        y: Math.random() * parentHeight,
        r: Math.random() * 4 + 2, // Slightly larger, comic style dots
        d: Math.random() * maxFlakes,
        speed: Math.random() * 1 + 0.5, // Slow, floating fall
      });
    }

    let animationFrameId: number;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, parentWidth, parentHeight);
      
      // Comic style snow: Pure white with slight transparency, no blur
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      
      for (let i = 0; i < maxFlakes; i++) {
        const p = snowflakes[i];
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      move();
      animationFrameId = requestAnimationFrame(draw);
    }

    function move() {
      for (let i = 0; i < maxFlakes; i++) {
        const p = snowflakes[i];
        
        // Gentle swaying motion
        p.y += p.speed;
        p.x += Math.sin(p.d) * 0.5; // Subtle side-to-side
        p.d += 0.01;

        // Reset if out of bounds
        if (p.x > parentWidth + 5 || p.x < -5 || p.y > parentHeight) {
          snowflakes[i] = {
            x: Math.random() * parentWidth,
            y: -10,
            r: p.r,
            d: p.d,
            speed: p.speed
          };
        }
      }
    }

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
    />
  );
};

export default SnowEffect;
