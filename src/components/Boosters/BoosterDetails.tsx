import React from "react";
import { Booster } from "@/types/boosters";
import Button from "@/components/Button";
import { twMerge } from "tailwind-merge";
import { usePurchaseBooster } from "@/hooks/api/useBoosters";
import toast from "react-hot-toast";
import Image from "next/image";
import lightning from "@/app/_assets/images/lightning.png";

interface BoosterDetailsProps {
  booster: Booster;
  userId: string;
  onClose: () => void;
  onBuy: () => void;
  isAvailable: boolean;
  isLoading: boolean;
  timeRemaining: string | null;
}

const RARITY_CLASSES = {
  common: "text-white",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-300",
} as const;

// This empty div ensures Tailwind includes the classes
const UnusedClassesKeeper = () => (
  <div className="hidden">
    <div className="text-white" />
    <div className="text-blue-400" />
    <div className="text-purple-400" />
    <div className="text-yellow-300" />
  </div>
);

export const BoosterDetails: React.FC<BoosterDetailsProps> = ({
  booster,
  userId,
  onClose,
  onBuy,
  isAvailable,
  isLoading,
  timeRemaining,
}) => {
  const purchaseBooster = usePurchaseBooster();

  const handlePurchase = async () => {
    try {
      await purchaseBooster.mutateAsync({
        boosterId: booster.id,
        userId,
      });
      toast.success("Бустер успешно приобретен!");
      onClose();
    } catch (error) {
      console.error("Failed to purchase booster:", error);
      toast.error("Не удалось купить бустер");
    }
  };

  const getDurationText = () => {
    if (booster.duration_type === "permanent") return "Навсегда";
    if (booster.duration_type === "one_session") return "Одна тренировка";
    if (booster.duration_type === "timed") {
      const minutes = Math.floor(booster.duration_value / 60);
      return `${minutes} минут`;
    }
    return "";
  };

  const getEffectText = () => {
    switch (booster.effect_type) {
      case "coins_multiplier":
        return `Множитель монет ${booster.effect_value}x`;
      case "energy_recovery":
        return `Восстановление энергии ${booster.effect_value}x`;
      case "experience_multiplier":
        return `Множитель опыта ${booster.effect_value}x`;
      case "jump_power":
        return `Дополнительно ${booster.effect_value} монет за каждый прыжок`;
      case "energy_cost_reduction":
        return `Снижение затрат энергии на ${booster.effect_value * 100}%`;
      default:
        return "";
    }
  };

  const getHoursTextByNumber = (number: string) => {
    const num = parseInt(number);
    const lastDigit = num % 10;
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex grow flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className={`text-2xl font-bold ${RARITY_CLASSES[booster.rarity]}`}
            >
              {booster.name}
            </h2>
            <p className="mt-1 text-gray-400">
              {booster.rarity === "common" && "ОБЫЧНЫЙ"}
              {booster.rarity === "rare" && "РЕДКИЙ"}
              {booster.rarity === "epic" && "ЭПИЧЕСКИЙ"}
              {booster.rarity === "legendary" && "ЛЕГЕНДАРНЫЙ"}
            </p>
          </div>
          <div className="rounded-full bg-background p-4">
            <Image
              src={lightning}
              alt="card"
              width={32}
              height={32}
              className="h-[50px] w-[50px]"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-white">Эффект</h3>
            <p className="text-gray-300">{getEffectText()}</p>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Длительность
            </h3>
            <p className="text-gray-300">{getDurationText()}</p>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold text-white">Описание</h3>
            <p className="text-gray-300">{booster.description}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-background-light p-4">
        {!isAvailable ? (
          <div className="rounded-md bg-gray-700/50 p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-sm font-medium text-green-400">
                Активен
              </span>
            </div>
            {timeRemaining && (
              <span className="mt-2 block text-sm text-gray-300">
                Осталось: {timeRemaining} {getHoursTextByNumber(timeRemaining)}
              </span>
            )}
          </div>
        ) : (
          <Button
            onClick={handlePurchase}
            disabled={purchaseBooster.isLoading || !isAvailable}
            className="w-full"
          >
            {purchaseBooster.isLoading
              ? "Покупка..."
              : `Купить за ${
                  booster.price === 0 ? "бесплатно" : `${booster.price} монет`
                }`}
          </Button>
        )}
      </div>
    </div>
  );
};
