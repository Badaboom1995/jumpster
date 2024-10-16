import { useState, useRef, useEffect } from 'react';

const useTimer = () => {
    const [currentSeconds, setCurrentSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const start = () => {
        if (timerRef.current) return; // Prevent multiple timers
        timerRef.current = setInterval(() => {

            setCurrentSeconds(prev => {
                console.log(prev)
                return prev + 1
            });
        }, 1000);
    };

    const stop = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = undefined;
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    return { currentSeconds, start, stop };
};

export default useTimer;