import React, { useEffect, useRef } from 'react';

interface LeafEffectProps {
  isActive: boolean;
  className?: string;
}

const LeafEffect: React.FC<LeafEffectProps> = ({ isActive, className = "" }) => {
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

    // Orange leaf colors: orange, red-orange, yellow-orange
    const leafColors = [
      'rgba(255, 140, 0, 0.8)',    // Dark orange
      'rgba(255, 165, 0, 0.8)',     // Orange
      'rgba(255, 127, 0, 0.8)',     // Orange-red
      'rgba(255, 200, 0, 0.7)',     // Yellow-orange
      'rgba(255, 99, 71, 0.8)',     // Tomato
    ];

    const leaves: { 
      x: number; 
      y: number; 
      size: number; 
      rotation: number; 
      rotationSpeed: number;
      sway: number;
      swaySpeed: number;
      speed: number;
      color: string;
    }[] = [];
    // Reduced particles for better performance - adapt based on screen size
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const maxLeaves = isMobile ? 15 : 25; // Much fewer particles for better performance

    // Initialize leaves
    for (let i = 0; i < maxLeaves; i++) {
      leaves.push({
        x: Math.random() * parentWidth,
        y: Math.random() * parentHeight,
        size: Math.random() * 8 + 4, // 4-12px
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05, // Slower, calmer rotation
        sway: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.03 + 0.01, // Slower sway
        speed: Math.random() * 0.8 + 0.4, // Much slower, serene fall
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
      });
    }

    let animationFrameId: number;

    function drawLeaf(x: number, y: number, size: number, rotation: number, color: string) {
      if (!ctx) return;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = color;
      
      // Draw leaf shape (oval/ellipse)
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.8, size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Add a small stem
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.5);
      ctx.lineTo(0, -size * 0.8);
      ctx.stroke();
      
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
      
      for (let i = 0; i < maxLeaves; i++) {
        const leaf = leaves[i];
        drawLeaf(leaf.x, leaf.y, leaf.size, leaf.rotation, leaf.color);
      }
      move();
      animationFrameId = requestAnimationFrame(draw);
    }

    function move() {
      for (let i = 0; i < maxLeaves; i++) {
        const leaf = leaves[i];
        
        // Falling motion with gentle swaying
        leaf.y += leaf.speed;
        leaf.x += Math.sin(leaf.sway) * 0.8; // Calmer horizontal movement
        leaf.sway += leaf.swaySpeed;
        leaf.rotation += leaf.rotationSpeed; // Gentle rotation as it falls

        // Reset if out of bounds
        if (leaf.x > parentWidth + 10 || leaf.x < -10 || leaf.y > parentHeight) {
          leaves[i] = {
            x: Math.random() * parentWidth,
            y: -10,
            size: Math.random() * 8 + 4,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            sway: Math.random() * Math.PI * 2,
            swaySpeed: Math.random() * 0.03 + 0.01,
            speed: Math.random() * 0.8 + 0.4,
            color: leafColors[Math.floor(Math.random() * leafColors.length)],
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
        borderRadius: '4rem',
        overflow: 'hidden',
        clipPath: 'inset(0 round 4rem)'
      }}
    />
  );
};

export default LeafEffect;

