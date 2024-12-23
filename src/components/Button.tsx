import React from "react";
import classNames from "classnames";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import clickSound from "@/app/_assets/audio/click.wav";

interface ButtonProps {
  children: React.ReactNode;
  type?: "submit" | "button";
  variant?: "primary" | "secondary";
  iconRight?: React.ReactNode;
  iconLeft?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  loaderText?: string;
  loaderIcon?: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  muteSound?: boolean;
  sound?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  variant = "primary",
  iconLeft,
  className,
  isLoading = false,
  disabled = false,
  onClick,
  muteSound = false,
  sound = clickSound,
}) => {
  const playClickSound = () => {
    if (!muteSound) {
      const audio = new Audio(sound);
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.debug("Button sound playback failed:", error);
      });
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    playClickSound();
    onClick?.(e);
  };

  const specificClass = (variant: string) =>
    classNames({
      "bg-primary active:bg-primary-dark transition":
        variant === "primary" && !disabled,
      "bg-primary opacity-30 transition": variant === "primary" && disabled,
      "bg-white active:bg-gray-200": variant === "secondary",
    });

  return (
    <button
      type={type as "button" | "submit"}
      className={twMerge(
        "font- flex w-full justify-center rounded-[12px] p-[12px] text-[16px] text-black",
        specificClass(variant),
        className,
      )}
      disabled={disabled || isLoading}
      onClick={handleClick}
    >
      <span className="flex items-center gap-[8px] font-[600]">
        {iconLeft && <Image src={iconLeft as any} alt="icon" />}
        {!isLoading && children}
      </span>
    </button>
  );
};

export default Button;
