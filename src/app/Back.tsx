'use client'
import React, { useEffect, useRef } from 'react';

const MovingGradient: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let gradientShift = 0;

        // Resize canvas to fit the screen
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const draw = () => {
            if (!ctx) return;

            // Clear the canvas before redrawing
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Create a linear gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

            // Update the gradient stops to animate
            gradientShift += 0.005;
            const shiftA = Math.sin(gradientShift) * 0.5 + 0.5;
            const shiftB = Math.cos(gradientShift) * 0.5 + 0.5;
            const shiftC = Math.tan(gradientShift) * 0.5 + 0.5;

            // Gradient colors shift slightly over time
            gradient.addColorStop(0, `rgba(${Math.floor(30 * shiftA)}, ${Math.floor(30 * shiftA)}, ${Math.floor(30 * shiftA)}, 1)`);
            gradient.addColorStop(0.5, `rgba(${Math.floor(255 * shiftA)}, 250, 99, 1)`);
            gradient.addColorStop(1, `rgba(${Math.floor(30 * shiftA)}, ${Math.floor(30 * shiftA)}, ${Math.floor(30 * shiftA)}, 1)`);

            // Fill the canvas with the gradient
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Call the next frame
            animationFrameId = requestAnimationFrame(draw);
        };

        // Resize canvas when window size changes
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); // Initial size adjustment

        // Start the animation loop
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <canvas ref={canvasRef} className="moving-gradient opacity-30" />;
};

export default MovingGradient;
