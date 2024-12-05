import { useQuery, useMutation, useQueryClient } from "react-query";
import { Booster, UserBooster } from "@/types/boosters";
import { supabase } from "@/components/Root/Root";
import { getRankData } from "@/utils/getRewards";

export const useAvailableBoosters = () => {
  return useQuery<Booster[]>(["available-boosters"], async () => {
    const { data, error } = await supabase.from("boosters").select("*");

    if (error) throw error;
    return data;
  });
};

const is23HoursPassedFromActivation = (activatedAt: string) => {
  const activatedDate = new Date(activatedAt);
  const now = new Date();
  const timeDifference = now.getTime() - activatedDate.getTime();
  return timeDifference > 23 * 60 * 60 * 1000;
};

export const useUserBoosters = (userId: string) => {
  return useQuery<UserBooster[]>(
    ["user-boosters", userId],
    async () => {
      const { data, error } = await supabase
        .from("user_boosters")
        .select(
          `
          *,
          booster:boosters(*)
        `,
        )
        .eq("user_id", userId);

      const expiredBoosterIds = data
        ?.filter((booster) => {
          return is23HoursPassedFromActivation(booster.activated_at);
        })
        .map((booster) => booster.id);

      const activeBoosters = data?.filter(
        (booster) => !expiredBoosterIds?.includes(booster.id),
      );

      // delete expired boosters
      if (expiredBoosterIds && expiredBoosterIds.length > 0) {
        await supabase
          .from("user_boosters")
          .delete()
          .in("id", expiredBoosterIds);
      }

      if (error) throw error;
      return activeBoosters || [];
    },
    {
      enabled: !!userId,
    },
  );
};

export const useActivateBooster = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ userId, boosterId }: { userId: string; boosterId: string }) => {
      const response = await fetch("/api/boosters/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          boosterId,
        }),
      });
      console.log("ping");

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to apply booster");
      }

      return response.json();
    },
    {
      onSuccess: () => {
        // Invalidate both user boosters and user data
        queryClient.invalidateQueries(["user-boosters"]);
        queryClient.invalidateQueries(["user"]); // To refresh user's energy
      },
    },
  );
};

export const usePurchaseBooster = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ boosterId, userId }: { boosterId: string; userId: string }) => {
      const response = await fetch("/api/boosters/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          boosterId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to purchase booster");
      }

      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user-boosters");
        queryClient.invalidateQueries("user"); // To refresh user's coins
      },
    },
  );
};
