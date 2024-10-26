import { useEffect, useRef } from "react";

const FullscreenCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size to match the window size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize); // Handle window resize

    // Draw something on the canvas
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height - 50, 50, 0, 2 * Math.PI);
      ctx.fill();
    };

    draw(); // Initial draw

    return () => window.removeEventListener("resize", setCanvasSize); // Cleanup on unmount
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none", // Allow clicks to pass through
        zIndex: 9999, // Ensure the canvas is on top of other elements
      }}
    />
  );
};

export default FullscreenCanvas;
