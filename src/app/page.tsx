"use client";

import Main from "@/app/Main";
import { useEffect, useState } from "react";

export default function Home() {
  const [isAllowed, setIsAllowed] = useState(true);

  useEffect(() => {
    // Check if running in Telegram WebApp
    const isTelegram = true;

    // Check if device is laptop/desktop
    const isLaptop =
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    if (isTelegram && isLaptop) {
      setIsAllowed(false);
    }
  }, []);

  return <Main />;
}
