"use client";
import { useCallback, useEffect, useRef } from "react";
import { Howl } from "howler";

export const useSound = (soundSrc: string) => {
  // Use ref to persist the sound instance between renders
  const soundRef = useRef<Howl>();

  useEffect(() => {
    // Initialize sound
    soundRef.current = new Howl({
      src: [soundSrc],
      volume: 0.2,
      preload: true,
    });

    // Cleanup on unmount
    // return () => {
    //   if (soundRef.current) {
    //     soundRef.current.unload();
    //   }
    // };
  }, [soundSrc]);

  const playSound = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.play();
    }
  }, []);

  return { playSound };
};
