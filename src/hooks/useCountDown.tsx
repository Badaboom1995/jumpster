import { useState, useRef, useEffect } from 'react';

const useCountdown = () => {
    const [seconds, setSeconds] = useState(3);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<any>(null);

    // Start the countdown
    const start = () => {
        if (intervalRef.current) return; // Prevent multiple intervals
        setSeconds(3); // Reset the countdown to 3 seconds
        setIsRunning(true);
        intervalRef.current = setInterval(() => {
            setSeconds((prev) => {
                if (prev === 0) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setIsRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1250);
    };

    // Stop the countdown
    const stop = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setSeconds(3); // Reset the countdown
        setIsRunning(false);
    };
    // Clean up interval on component unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return { isRunning, seconds, startCountDown:start, stopCountDown:stop };
};

export default useCountdown;
