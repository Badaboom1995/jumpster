import { useState, useEffect, useRef } from 'react';

function useAnimatedNumber(endNumber: number, durationInSec: number, enabled: boolean): number {
    const [currentNumber, setCurrentNumber] = useState(0); // Start from 0
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled) {
            return; // If not enabled, do nothing
        }

        const totalDurationMs = durationInSec * 1000;

        const animate = (timestamp: number) => {
            if (startTimeRef.current === null) {
                startTimeRef.current = timestamp; // Store the start time
            }
            const elapsed = timestamp - startTimeRef.current;

            // Calculate the progress as a fraction of the total duration
            const progress = Math.min(elapsed / totalDurationMs, 1); // Clamp to 1 at the end

            // Calculate the new current number based on the progress
            const newValue = endNumber * progress;
            setCurrentNumber(Math.floor(newValue)); // Use floor to count up

            // If progress is less than 1, continue the animation
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        // Start the animation
        const animationId = requestAnimationFrame(animate);

        // Cleanup: cancel the animation if the component unmounts or if disabled
        return () => {
            cancelAnimationFrame(animationId);
            startTimeRef.current = null; // Reset start time on cleanup
        };
    }, [endNumber, durationInSec, enabled]);

    return currentNumber;
}

export default useAnimatedNumber;
