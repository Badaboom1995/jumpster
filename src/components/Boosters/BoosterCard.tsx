import React from "react";
import { UserBooster } from "@/types/boosters";
import Image from "next/image";
import arrowRight from "@/app/_assets/icons/arrowRight.svg";
import Curtain from "@/components/Curtain";
import { BoosterDetails } from "./BoosterDetails";
import lightning from "@/app/_assets/images/lightning.png";

interface BoosterCardProps {
  booster: UserBooster;
  userId: string;
  isAvailable?: boolean;
  onBuy?: () => void;
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
  onBuy,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const timeLeft = booster.expires_at
    ? Math.max(
        0,
        Math.floor(
          (new Date(booster.expires_at).getTime() - Date.now()) / 1000,
        ),
      )
    : null;

  const getDurationText = () => {
    if (booster.booster.duration_type === "permanent") return "Постоянный";
    if (booster.booster.duration_type === "one_session")
      return "Одна тренировка";
    if (booster.booster.duration_type === "timed") {
      const minutes = Math.floor(booster.booster.duration_value / 60);
      return `${minutes} минут`;
    }
    return "";
  };

  return (
    <>
      <button
        onClick={() => setIsDetailsOpen(true)}
        className="flex w-full items-center justify-between rounded-lg py-[4px]"
      >
        <div className="flex items-start gap-3">
          <Image
            src={lightning}
            alt="lightning"
            width={100}
            height={100}
            className="h-[46.5px] w-[46.5px]"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3
                className={`${
                  RARITY_CLASSES[booster.booster.rarity]
                } text-[15px] font-medium`}
              >
                {booster.booster.name}
              </h3>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-gray-500">{getDurationText()}</span>
              {timeLeft && !isAvailable && (
                <span className="text-sm text-gray-500">
                  • {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                </span>
              )}
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
        />
      </Curtain>
    </>
  );
};
