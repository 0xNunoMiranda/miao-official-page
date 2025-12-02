import React, { useEffect, useRef } from 'react';

interface SnowEffectProps {
  isActive: boolean;
  className?: string;
  borderRadius?: string; // Accept border radius from parent
}

const SnowEffect: React.FC<SnowEffectProps> = ({ isActive, className = "", borderRadius = "1.5rem" }) => {
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

    const snowflakes: { x: number; y: number; r: number; d: number; speed: number; shape: 'circle' | 'star' | 'hex' | 'diamond'; opacity: number; rotation: number; rotationSpeed: number }[] = [];
    // Reduced particles for better performance - adapt based on screen size
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const maxFlakes = isMobile ? 20 : 35; // Much fewer particles for better performance

    // Initialize flakes with different shapes, sizes, opacities, and rotations
    const shapes: ('circle' | 'star' | 'hex' | 'diamond')[] = ['circle', 'star', 'hex', 'diamond'];
    
    for (let i = 0; i < maxFlakes; i++) {
      // Generate unique properties for each flake
      const r = Math.random() * 4 + 1.5; // Vary size more (1.5-5.5)
      const speed = Math.random() * 0.5 + 0.2; // Vary speed more (0.2-0.7)
      const opacity = Math.random() * 0.4 + 0.5; // Vary opacity (0.5-0.9)
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const rotation = Math.random() * Math.PI * 2; // Random starting rotation
      const rotationSpeed = (Math.random() - 0.5) * 0.02; // Slow rotation speed
      
      snowflakes.push({
        x: Math.random() * parentWidth,
        y: Math.random() * parentHeight,
        r: r,
        d: Math.random() * maxFlakes,
        speed: speed,
        shape: shape,
        opacity: opacity,
        rotation: rotation,
        rotationSpeed: rotationSpeed,
      });
    }

    let animationFrameId: number;

    function drawFlake(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, shape: 'circle' | 'star' | 'hex' | 'diamond', opacity: number, rotation: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      
      switch (shape) {
        case 'circle':
          ctx.arc(0, 0, r, 0, Math.PI * 2, true);
          break;
        case 'star':
          // Draw a simple 4-pointed star
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const radius = i % 2 === 0 ? r : r * 0.5;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          break;
        case 'hex':
          // Draw a hexagon
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          break;
        case 'diamond':
          // Draw a diamond
          ctx.moveTo(0, -r);
          ctx.lineTo(r, 0);
          ctx.lineTo(0, r);
          ctx.lineTo(-r, 0);
          ctx.closePath();
          break;
      }
      
      ctx.fill();
      ctx.restore();
    }

    let lastTime = 0;
    const targetFPS = 30; // Reduced FPS for better performance
    const frameInterval = 1000 / targetFPS;

    function draw(currentTime: number) {
      if (!ctx || !canvas) return;
      
      // Throttle animation to target FPS
      if (currentTime - lastTime < frameInterval) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      lastTime = currentTime;
      
      ctx.clearRect(0, 0, parentWidth, parentHeight);
      
      for (let i = 0; i < maxFlakes; i++) {
        const p = snowflakes[i];
        drawFlake(ctx, p.x, p.y, p.r, p.shape, p.opacity, p.rotation);
      }
      move();
      animationFrameId = requestAnimationFrame(draw);
    }

    function move() {
      for (let i = 0; i < maxFlakes; i++) {
        const p = snowflakes[i];
        
        // Very gentle, serene swaying motion
        p.y += p.speed;
        p.x += Math.sin(p.d) * 0.3; // Very subtle, calm side-to-side
        p.d += 0.005; // Slower oscillation
        p.rotation += p.rotationSpeed; // Rotate the flake

        // Reset if out of bounds
        if (p.x > parentWidth + 5 || p.x < -5 || p.y > parentHeight) {
          const newR = Math.random() * 4 + 1.5;
          const newSpeed = Math.random() * 0.5 + 0.2;
          const newOpacity = Math.random() * 0.4 + 0.5;
          const newShape = shapes[Math.floor(Math.random() * shapes.length)];
          
          snowflakes[i] = {
            x: Math.random() * parentWidth,
            y: -10,
            r: newR,
            d: p.d,
            speed: newSpeed,
            shape: newShape,
            opacity: newOpacity,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02
          };
        }
      }
    }

    animationFrameId = requestAnimationFrame(draw);

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
      style={{ 
        borderRadius: borderRadius,
        overflow: 'hidden',
        clipPath: `inset(0 round ${borderRadius})`
      }}
    />
  );
};

export default SnowEffect;
