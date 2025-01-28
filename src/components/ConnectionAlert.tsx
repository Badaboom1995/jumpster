"use client";
import { useEffect, useState } from "react";

const ConnectionAlert = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const startTime = performance.now();
        // await fetch("/api/ping", { method: "HEAD" });
        const endTime = performance.now();

        const duration = endTime - startTime;
        setIsSlowConnection(duration > 1000); // Consider slow if ping takes more than 1 second
      } catch {
        setIsSlowConnection(true);
      }
    };

    const interval = setInterval(checkConnection, 5000); // Check every 30 seconds
    checkConnection(); // Initial check

    return () => clearInterval(interval);
  }, []);

  if (!isSlowConnection) return null;

  return (
    <div className="bg-red-500 px-4 py-2 text-center text-sm text-white">
      Обнаружено медленное соединение. Это может повлиять на работу приложения
    </div>
  );
};

export default ConnectionAlert;
