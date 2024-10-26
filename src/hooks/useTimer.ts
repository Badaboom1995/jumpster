import React, { useEffect } from "react";

const useTimer = (onTickInsideInterval: () => void, dependencies?: any[]) => {
  useEffect(() => {
    // loadModel()
    // recover energy every second without sending request to the server
    const interval = setInterval(() => {
      onTickInsideInterval();
    }, 1000);
    return () => clearInterval(interval);
  }, dependencies || []);
};

export default useTimer;
