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
    count?: { min: number; max: number },
    size?: { min: number; max: number },
  ) => void;
}

const CoinsFirework = forwardRef<CoinsFireworkRef>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemsRef = useRef<ParticleSystem[]>([]);
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
  ): ParticleSystem => {
    const particles: Particle[] = [];
    const minParticles = customParticleCount?.min || 100;
    const maxParticles = customParticleCount?.max || 40;
    const particleCount = Math.floor(
      minParticles + Math.random() * (maxParticles - minParticles),
    );

    const arcRange = (Math.PI * 2) / 3;
    const startAngle = Math.PI + (Math.PI - arcRange) / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = startAngle + (arcRange * i) / particleCount;
      const speed = 2 + Math.random() * 4;
      const randomSize =
        (customParticleSize?.min || 40) +
        Math.random() *
          ((customParticleSize?.max || 50) - (customParticleSize?.min || 40));

      const startY = window.innerHeight;

      particles.push({
        x,
        y: startY,
        vx: Math.cos(angle - Math.PI) * speed + (Math.random() - 0.5) * 2,
        vy: -10 - Math.random() * 7,
        opacity: 1,
        size: randomSize,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        bounceCount: 0,
      });
    }

    return {
      id: ++systemIdCounterRef.current,
      particles,
    };
  };
  // skip frame if not enough time has elapsed
  const FRAME_INTERVAL = 1000 / 60;
  const lastFrameTimeRef = useRef(performance.now());

  const animate = () => {
    const currentTime = performance.now();
    const elapsed = currentTime - lastFrameTimeRef.current;
    const shouldDraw = elapsed > FRAME_INTERVAL || elapsed === 0;
    // console.log(elapsed, shouldDraw);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", {
      alpha: true,
      willReadFrequently: false,
    });
    const coinImage = coinImageRef.current;

    if (!canvas || !ctx || !coinImage) return;
    if (shouldDraw) {
      lastFrameTimeRef.current = currentTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "medium";
    }

    particleSystemsRef.current = particleSystemsRef.current.filter((system) => {
      system.particles = system.particles.filter((particle) => {
        if (particle.y > window.innerHeight + 100) return false;

        // Apply velocity
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Apply gravity and air resistance
        particle.vy += 0.5;

        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);

        if (shouldDraw) {
          ctx.drawImage(
            coinImage,
            -particle.size / 2,
            -particle.size / 2,
            particle.size,
            particle.size,
          );
        }

        ctx.restore();
        return true;
      });

      return system.particles.length > 0;
    });

    if (particleSystemsRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      isAnimatingRef.current = false;
    }
  };

  useImperativeHandle(ref, () => ({
    triggerAnimation: (
      x: number,
      y: number,
      count: { min: number; max: number },
      size: { min: number; max: number },
    ) => {
      const newSystem = createParticles(x, y, count);
      particleSystemsRef.current.push(newSystem);

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

  // Add test interval
  // useEffect(() => {
  //   const testInterval = setInterval(() => {
  //     const x = Math.random() * window.innerWidth;
  //     const y = window.innerHeight - 100;

  //     // Trigger with smaller particle count for testing
  //     const count = { min: 10, max: 15 };
  //     const size = { min: 20, max: 40 };

  //     if (ref && typeof ref === "object" && "current" in ref && ref.current) {
  //       ref.current.triggerAnimation(x, y, count, size);
  //     }
  //   }, 300);

  //   return () => clearInterval(testInterval);
  // }, []);

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
