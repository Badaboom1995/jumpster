import React from "react";
import { UserBooster } from "@/types/boosters";
import Image from "next/image";
import arrowRight from "@/app/_assets/icons/arrowRight.svg";
import Curtain from "@/components/Curtain";
import { BoosterDetails } from "./BoosterDetails";
import lightning from "@/app/_assets/images/lightning.png";
import fire from "@/app/_assets/images/fire.png";
import clickSound from "@/app/_assets/audio/click.wav";

interface BoosterCardProps {
  booster: UserBooster;
  userId: string;
  isAvailable: boolean;
  timeRemaining?: string | null;
  onBuy: () => void;
  isLoading: boolean;
}

// Define classes explicitly so Tailwind includes them in the build
const RARITY_CLASSES = {
  common: "text-white",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-300",
} as const;

// This empty div with all possible classes ensures Tailwind includes them
const UnusedClassesKeeper = () => (
  <div className="hidden">
    <div className="text-white" />
    <div className="text-blue-400" />
    <div className="text-purple-400" />
    <div className="text-yellow-300" />
  </div>
);

export const BoosterCard: React.FC<BoosterCardProps> = ({
  booster,
  userId,
  isAvailable,
  timeRemaining,
  onBuy,
  isLoading,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const getDurationText = () => {
    if (booster.booster.duration_type === "permanent") return "Постоянный";
    if (booster.booster.duration_type === "one_session")
      return "Одна тренировка";
    if (booster.booster.duration_type === "timed") {
      if (booster.booster.duration_value === null) return "24 часа";
      const minutes = Math.floor(booster.booster.duration_value / 60);
      return `${minutes} минут`;
    }
    return "";
  };

  const getHoursTextByNumber = (number: string) => {
    const num = parseInt(number);
    const lastDigit = num % 10;
    if (num > 9 && num < 20) return "часов";
    if (lastDigit === 2 || lastDigit === 3 || lastDigit === 4) return "часа";
    if (
      lastDigit === 5 ||
      lastDigit === 6 ||
      lastDigit === 7 ||
      lastDigit === 8 ||
      lastDigit === 9 ||
      lastDigit === 0
    )
      return "часов";
    if (lastDigit === 1) return "час";
    return "";
  };

  const getStatusDisplay = () => {
    if (isAvailable) {
      return null;
    }

    return (
      <div className="mt-3 flex flex-col gap-1">
        {booster.booster.effect_type !== "energy_recovery" && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            <span className="text-sm font-medium text-green-400">Активен</span>
          </div>
        )}
        <div className="rounded-md bg-gray-700/50 px-3 py-2">
          <span className="text-sm text-gray-300">
            Осталось: {timeRemaining} {getHoursTextByNumber(timeRemaining)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="relative rounded-lg bg-background p-2 pr-4">
      <button
        onClick={() => {
          setIsDetailsOpen(true);
          const audio = new Audio(clickSound);
          audio.play();
        }}
        className="flex w-full items-center justify-between rounded-lg py-[4px]"
      >
        <div className="flex items-start gap-3">
          <Image
            src={
              booster.booster.effect_type === "jump_power" ? fire : lightning
            }
            alt="lightning"
            width={100}
            height={100}
            className="h-[50px] w-[50px]"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2
                className={`${
                  RARITY_CLASSES[booster.booster.rarity]
                } text-[16px] font-medium`}
              >
                {booster.booster.name}
              </h2>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-gray-500">{getDurationText()}</span>
              <span className="text-sm text-gray-500">
                •{" "}
                {booster.booster.price === 0
                  ? "Бесплатно"
                  : `${booster.booster.price} монет`}
              </span>
            </div>
          </div>
        </div>
        <Image src={arrowRight} alt="arrow" width={24} height={24} />
      </button>

      <Curtain isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
        <BoosterDetails
          booster={booster.booster}
          userId={userId}
          onClose={() => setIsDetailsOpen(false)}
          onBuy={onBuy}
          isAvailable={isAvailable}
          isLoading={isLoading}
          timeRemaining={timeRemaining}
        />
      </Curtain>

      {getStatusDisplay()}
    </div>
  );
};
