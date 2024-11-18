import React, { useState, createContext } from "react";
import { twMerge } from "tailwind-merge";

// Context to share the slider functions with slides
export const SliderContext = createContext({});

interface SliderProps {
  children: React.ReactNode;
  onFinish?: () => void;
}

const Slider = ({ children, onFinish }: SliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(true);
  const totalSlides = React.Children.count(children);

  // Slider control functions
  const next = () =>
    setCurrentSlide((prev) =>
      prev + 1 < totalSlides - 1 ? prev + 1 : totalSlides - 1,
    );
  const prev = () => setCurrentSlide((prev) => (prev - 1 > 0 ? prev - 1 : 0));
  const toSlide = (index) => setCurrentSlide(index);
  const toLastSlide = () => setCurrentSlide(2);
  const finish = () => setIsMounted(false);

  const sliderFunctions = {
    next,
    prev,
    toSlide,
    currentSlide,
    toLastSlide,
    finish,
  };

  const handleFinish = () => {
    onFinish?.();
  };

  if (!isMounted) return;

  return (
    <SliderContext.Provider value={sliderFunctions}>
      <div className="relative w-full overflow-hidden">
        <div className="flex transition-transform">
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className={twMerge(
                "hidden w-full flex-shrink-0",
                currentSlide === index && "block",
              )}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </SliderContext.Provider>
  );
};

export default Slider;
