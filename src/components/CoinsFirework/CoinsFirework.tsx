import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import coinIcon from "@/app/_assets/images/coin.png";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  bounceCount: number;
}

interface ParticleSystem {
  id: number;
  particles: Particle[];
}

export interface CoinsFireworkRef {
  triggerAnimation: (
    x: number,
    y: number,
    count: { min: number; max: number },
    size: { min: number; max: number },
  ) => void;
}

const FPS = 30;
const FRAME_TIME = 1000 / FPS;

const CoinsFirework = forwardRef<CoinsFireworkRef>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemsRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const coinImageRef = useRef<HTMLImageElement>();
  const systemIdCounterRef = useRef(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const coinImage = new Image();
    coinImage.src = coinIcon.src;
    coinImage.onload = () => {
      coinImageRef.current = coinImage;
    };
  }, []);

  const createParticles = (
    x: number,
    y: number,
    customParticleCount?: { min: number; max: number },
    customParticleSize?: { min: number; max: number },
  ): Particle[] => {
    const particles: Particle[] = [];
    const minParticles = customParticleCount?.min || 1;
    const maxParticles = customParticleCount?.max || 1;
    const particleCount = Math.floor(
      minParticles + Math.random() * (maxParticles - minParticles),
    );

    const arcRange = (Math.PI * 2) / 3;
    const startAngle = Math.PI + (Math.PI - arcRange) / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = startAngle + (arcRange * i) / particleCount;
      const speed = 2 + Math.random() * 4;
      const randomSize =
        (customParticleSize?.min || 30) +
        Math.random() *
          ((customParticleSize?.max || 54) - (customParticleSize?.min || 30));

      const startY = window.innerHeight;

      particles.push({
        x,
        y: startY,
        vx: Math.cos(angle - Math.PI) * speed + (Math.random() - 0.5) * 2,
        vy: -20 - Math.random() * 30,
        opacity: 1,
        size: randomSize,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.4,
        bounceCount: 0,
      });
    }

    return particles;
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", {
      alpha: true,
      willReadFrequently: false,
    });
    const coinImage = coinImageRef.current;

    if (!canvas || !ctx || !coinImage) return;

    let lastFrameTime = 0;

    const animateFrame = (timestamp: number) => {
      if (timestamp - lastFrameTime >= FRAME_TIME) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const leftParticles = particleSystemsRef.current.filter(
          (particle, index) => {
            if (particle.y > window.innerHeight + 50) return false;

            // Apply velocity
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Apply gravity and air resistance
            particle.vy += 2;
            particle.vx *= 0.99;

            particle.rotation += particle.rotationSpeed;

            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);

            ctx.drawImage(
              coinImage,
              -particle.size / 2,
              -particle.size / 2,
              particle.size,
              particle.size,
            );

            ctx.restore();
            return true;
          },
        );

        particleSystemsRef.current = leftParticles;
        lastFrameTime = timestamp;
      }

      if (particleSystemsRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animateFrame);
      } else {
        isAnimatingRef.current = false;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateFrame);
  };

  useImperativeHandle(ref, () => ({
    triggerAnimation: (
      x: number,
      y: number,
      count: { min: number; max: number },
      size: { min: number; max: number },
    ) => {
      const newParticlesGroup = createParticles(x, y, count);
      particleSystemsRef.current.push(...newParticlesGroup);

      if (!isAnimatingRef.current) {
        isAnimatingRef.current = true;
        animate();
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      // Set canvas dimensions accounting for DPI
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Set display size
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Scale all drawing operations by DPI
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        isAnimatingRef.current = false;
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    />
  );
});

CoinsFirework.displayName = "CoinsFirework";

export default CoinsFirework;
