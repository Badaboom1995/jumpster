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
}

interface ParticleSystem {
  id: number;
  particles: Particle[];
}

export interface CoinsFireworkRef {
  triggerAnimation: (
    x: number,
    y: number,
    particleCount?: { min: number; max: number },
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
  ): ParticleSystem => {
    const particles: Particle[] = [];
    const minParticles = customParticleCount?.min || 20;
    const maxParticles = customParticleCount?.max || 40;
    const particleCount = Math.floor(
      minParticles + Math.random() * (maxParticles - minParticles),
    );

    const arcRange = (Math.PI * 2) / 3;
    const startAngle = Math.PI + (Math.PI - arcRange) / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = startAngle + (arcRange * i) / particleCount;
      const speed = 2 + Math.random() * 4;

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed - 2,
        opacity: 1,
        size: 24,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    return {
      id: ++systemIdCounterRef.current,
      particles,
    };
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    const coinImage = coinImageRef.current;

    if (!canvas || !ctx || !coinImage) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    particleSystemsRef.current = particleSystemsRef.current.filter((system) => {
      system.particles = system.particles.filter((particle) => {
        if (particle.opacity <= 0) return false;

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2;
        particle.rotation += particle.rotationSpeed;

        if (particle.y > canvas.height) {
          particle.opacity -= 0.1;
        }

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
      particleCount?: { min: number; max: number },
    ) => {
      const newSystem = createParticles(x, y, particleCount);
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
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
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
