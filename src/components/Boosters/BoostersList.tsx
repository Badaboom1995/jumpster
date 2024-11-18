import React from "react";
import {
  useUserBoosters,
  useAvailableBoosters,
  useActivateBooster,
} from "@/hooks/api/useBoosters";
import { BoosterCard } from "./BoosterCard";
import Button from "@/components/Button";
import { Booster } from "@/types/boosters";

interface BoostersListProps {
  userId: string;
}

export const BoostersList: React.FC<BoostersListProps> = ({ userId }) => {
  const { data: activeBoosters, isLoading: isLoadingActive } =
    useUserBoosters(userId);
  const { data: availableBoosters, isLoading: isLoadingAvailable } =
    useAvailableBoosters();
  const activateBooster = useActivateBooster();

  if (isLoadingActive || isLoadingAvailable)
    return <div>Loading boosters...</div>;

  const getActiveBoosterById = (boosterId: string) => {
    return activeBoosters?.find(
      (activeBooster) => activeBooster.booster_id === boosterId,
    );
  };

  const handleActivateBooster = async (booster: Booster) => {
    try {
      await activateBooster.mutateAsync({ userId, boosterId: booster.id });
    } catch (error) {
      console.error("Failed to activate booster:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-[8px] text-[32px] font-bold text-white">Бустеры</h1>
        <p className="mb-[24px] text-gray-400">
          Активируйте бустер, чтобы получить дополнительные эффекты
        </p>
        <div className="space-y-3 overflow-y-scroll">
          {availableBoosters?.map((booster) => {
            const activeBooster = getActiveBoosterById(booster.id);
            return (
              <div key={booster.id} className="relative">
                <BoosterCard
                  booster={{ booster } as any}
                  userId={userId}
                  isAvailable={!activeBooster}
                  onBuy={() => handleActivateBooster(booster)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
