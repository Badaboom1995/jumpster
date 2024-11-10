import React, { useState, createContext } from "react";

// Context to share the slider functions with slides
export const SliderContext = createContext({});

const Slider = ({ children }) => {
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

  if (!isMounted) return;

  return (
    <SliderContext.Provider value={sliderFunctions}>
      <div className="relative w-full overflow-hidden">
        <div className="flex transition-transform">
          {React.Children.map(
            children,
            (child, index) =>
              currentSlide === index && (
                <div key={index} className="w-full flex-shrink-0">
                  {child}
                </div>
              ),
          )}
        </div>
      </div>
    </SliderContext.Provider>
  );
};

export default Slider;
