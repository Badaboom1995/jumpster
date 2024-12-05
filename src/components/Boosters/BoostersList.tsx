import React from "react";
import {
  useUserBoosters,
  useAvailableBoosters,
  useActivateBooster,
} from "@/hooks/api/useBoosters";
import { BoosterCard } from "./BoosterCard";
import { Booster } from "@/types/boosters";
import { useRouter } from "next/navigation";

interface BoostersListProps {
  userId: string;
}

export const BoostersList: React.FC<BoostersListProps> = ({ userId }) => {
  const router = useRouter();
  const { data: activeBoosters, isLoading: isLoadingActive } =
    useUserBoosters(userId);
  const { data: availableBoosters, isLoading: isLoadingAvailable } =
    useAvailableBoosters();
  const activateBooster = useActivateBooster();

  const [boosterLoading, setBoosterLoading] = React.useState<string | null>(
    null,
  );

  if (isLoadingActive || isLoadingAvailable)
    return <div>Loading boosters...</div>;

  const getActiveBoosterById = (boosterId: string) => {
    return activeBoosters?.find(
      (activeBooster) => activeBooster.booster_id === boosterId,
    );
  };

  const handleActivateBooster = async (booster: Booster) => {
    try {
      setBoosterLoading(booster.id);
      await activateBooster.mutateAsync({ userId, boosterId: booster.id });
    } catch (error) {
      console.error("Failed to activate booster:", error);
    } finally {
      setBoosterLoading(null);
    }
  };

  const getTimeRemaining24 = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const timeDifference = now.getTime() - createdDate.getTime();
    const hoursLeft = 24 - Math.floor(timeDifference / (1000 * 60 * 60));
    return `${hoursLeft}`;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-background-light p-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 transition-colors hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Назад
        </button>
      </div>
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
                  booster={{
                    id: booster.id,
                    booster: booster,
                    booster_id: booster.id,
                    user_id: userId,
                    activated_at: activeBooster?.activated_at || null,
                    expires_at: activeBooster?.expires_at || null,
                    is_active: !!activeBooster,
                  }}
                  userId={userId}
                  isAvailable={!activeBooster}
                  timeRemaining={getTimeRemaining24(
                    activeBooster?.activated_at,
                  )}
                  onBuy={() => handleActivateBooster(booster)}
                  isLoading={boosterLoading === booster.id}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
