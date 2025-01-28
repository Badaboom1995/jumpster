import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import clickSound from "@/app/_assets/audio/click.wav";
import { useSound } from "@/hooks/useSound";

const Curtain = ({
  children,
  onClose,
  isOpen,
}: {
  children: any;
  onClose: () => void;
  isOpen: boolean;
}) => {
  const [isCloseAnimation, setCloseAnimation] = useState(false);
  const [isVisible, setVisible] = useState(null);
  const { playSound } = useSound(clickSound);

  const closeCurtain = () => {
    if (isVisible === null) {
      setVisible(false);
      return;
    }
    setCloseAnimation(true);
    setTimeout(() => {
      setVisible(false);
      setCloseAnimation(false);
    }, 500);
  };

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      closeCurtain();
    }
  }, [isOpen]);

  return (
    <div
      className={twMerge(
        "fixed left-0 top-0 z-[50] h-[100vh] w-full flex-col-reverse",
        isVisible ? "flex" : "hidden",
      )}
    >
      <div
        onClick={() => {
          onClose();
          closeCurtain();
        }}
        className="fixed left-0 top-0 h-[100vh] w-full bg-background-dark bg-opacity-70"
      ></div>
      <div
        className={twMerge(
          "relative w-full translate-y-[200%] rounded-t-[24px] border border-background bg-background-dark p-4 pt-[40px] transition",
          isVisible && "animate-slideIn",
          isCloseAnimation && "animate-slideOut",
        )}
      >
        <button
          className="absolute right-3 top-3 h-[25px] w-[25px] rounded-full bg-background-light bg-opacity-30 text-white"
          onClick={() => {
            playSound();
            onClose();
            closeCurtain();
          }}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Curtain;
