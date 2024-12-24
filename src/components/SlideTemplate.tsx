"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import { useSlider } from "@/hooks/useSlider";
import arrow from "@/app/_assets/icons/ArrowDown.svg";
import Confetti from "react-confetti";
import Lottie from "lottie-react";

type SlideProps = {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  icon?: any;
  iconLottie?: any;
  first?: boolean;
  last?: boolean;
  onSkip?: () => void;
  onNext?: () => void;
  nextText?: string;
  animate?: boolean;
  iconSlides?: boolean;
};

interface FallingIcon {
  x: number;
  y: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
}

const SlideTemplate = (props: SlideProps) => {
  const {
    icon,
    title,
    description,
    onSkip,
    onNext,
    nextText,
    first,
    last,
    iconLottie,
    animate = false,
    iconSlides = false,
  } = props;
  const { next, prev, toLastSlide } = useSlider();
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallingIconsRef = useRef<FallingIcon[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!icon || iconLottie || !animate) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size function
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Create and load the image once
    const iconImage = document.createElement("img");
    iconImage.src = icon.src;

    let animationStarted = false;

    // Wait for the image to load before starting animation
    iconImage.onload = () => {
      animationStarted = true;
      updateCanvasSize();
      window.addEventListener("resize", updateCanvasSize);

      // Create initial falling icons
      fallingIconsRef.current = Array.from({ length: 10 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        speed: 1 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        size: 100 + Math.random() * 30,
      }));

      // Animation function
      const animate = () => {
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        fallingIconsRef.current.forEach((fallingIcon) => {
          ctx.save();
          ctx.translate(fallingIcon.x, fallingIcon.y);
          ctx.rotate(fallingIcon.rotation);

          ctx.drawImage(
            iconImage,
            -fallingIcon.size / 2,
            -fallingIcon.size / 2,
            fallingIcon.size,
            fallingIcon.size,
          );

          ctx.restore();

          // Update position
          fallingIcon.y += fallingIcon.speed;
          fallingIcon.rotation += fallingIcon.rotationSpeed;

          // Reset position if icon goes off screen
          if (fallingIcon.y - 100 > canvas.height) {
            fallingIcon.y = -fallingIcon.size;
            fallingIcon.x = Math.random() * canvas.width;
          }
        });

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animate();
    };

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clean up image if animation was started
      if (animationStarted) {
        iconImage.onload = null;
        iconImage.src = "";
      }
    };
  }, [icon, iconLottie, animate]);

  useEffect(() => {
    if (last) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [last]);

  return (
    <div className="relative flex h-[100vh] flex-col p-[24px] pt-[100px] text-white">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          gravity={0.1}
        />
      )}
      {icon && !iconLottie && animate && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed inset-0 blur-[2px] brightness-[0.5]"
          style={{ zIndex: 0 }}
        />
      )}

      <div className="relative flex h-full flex-col">
        <div className="fixed left-0 top-0 flex w-full justify-between px-[24px] py-[32px]">
          <button className="h-[25px] rotate-90" onClick={prev}>
            {!first && <Image className="max-w-full" src={arrow} alt="arrow" />}
          </button>
          {!last && (
            <button
              className="text-[14px] active:bg-caption"
              onClick={onSkip || toLastSlide}
            >
              Пропустить
            </button>
          )}
        </div>
        <div className="mb-[28px] flex items-end">
          {iconLottie ? (
            <div className="mx-auto h-[35vh] w-[35vh]">
              <Lottie
                width={35}
                height={35}
                animationData={iconLottie}
                loop={true}
              />
            </div>
          ) : (
            <div
              className={`mx-auto ${iconSlides ? "animate-slide-down" : ""}`}
            >
              <Image
                src={icon}
                alt="coin"
                className="h-[35vh] w-auto max-w-full"
              />
            </div>
          )}
        </div>

        <h2 className="mb-[16px] text-[32px] font-black">{title}</h2>
        <p className="mb-[40px] grow text-[16px]">{description}</p>
        <Button onClick={onNext || next}>{nextText || "Дальше"}</Button>
      </div>
    </div>
  );
};

export default SlideTemplate;
