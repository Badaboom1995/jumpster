import { useQuery, useMutation, useQueryClient } from "react-query";
import { Booster, UserBooster } from "@/types/boosters";
import { supabase } from "@/components/Root/Root";

export const useAvailableBoosters = () => {
  return useQuery<Booster[]>(["available-boosters"], async () => {
    const { data, error } = await supabase.from("boosters").select("*");

    if (error) throw error;
    return data;
  });
};

export const useUserBoosters = (userId: string) => {
  return useQuery<UserBooster[]>(
    ["user-boosters", userId],
    async () => {
      //   const { data, error } = await supabase
      //     .from('user_boosters')
      //     .select(`
      //       *,
      //       booster:boosters(*)
      //     `)
      //     .eq('user_id', userId)
      //     .eq('is_active', true);

      //   if (error) throw error;
      //   return data;
      return [];
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
      const { data: booster } = await supabase
        .from("boosters")
        .select("*")
        .eq("id", boosterId)
        .single();

      let expiresAt = null;
      if (booster.duration_type === "timed") {
        expiresAt = new Date(
          Date.now() + booster.duration_value * 1000,
        ).toISOString();
      }

      const { data, error } = await supabase
        .from("user_boosters")
        .insert({
          user_id: userId,
          booster_id: boosterId,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user-boosters");
      },
    },
  );
};

export const usePurchaseBooster = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ boosterId, userId }: { boosterId: string; userId: string }) => {
      console.log(userId);
      const response = await fetch("/api/boosters/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, boosterId }),
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
