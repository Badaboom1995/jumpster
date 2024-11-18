import { useMutation } from "react-query";

type RewardsParams = {
  jumpCount: number;
  jumpTime: number;
  perfectJumps?: number;
  comboMultiplier?: number;
};

export const useRewards = () => {
  return useMutation<{ status: string }, Error, RewardsParams>(
    async (params) => {
      const response = await fetch("/api/rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process rewards");
      }

      return response.json();
    },
  );
};
