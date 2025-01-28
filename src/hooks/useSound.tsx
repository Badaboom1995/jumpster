"use client";
import { useEffect, useRef } from "react";
import { Howl } from "howler";

export const useSound = (soundSrc: string) => {
  const soundRef = useRef<Howl>();

  useEffect(() => {
    // Initialize sound
    soundRef.current = new Howl({
      src: [soundSrc],
      volume: 0.2,
      preload: true,
    });
  }, [soundSrc]);

  const playSound = () => {
    if (soundRef.current) {
      soundRef.current.play();
    }
  };

  return { playSound };
};
