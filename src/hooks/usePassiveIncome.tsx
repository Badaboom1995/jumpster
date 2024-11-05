import React from "react";
import { useQuery } from "react-query";
import { supabase } from "@/components/Root/Root";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import useGetUser from "@/hooks/api/useGetUser";
import { getRankData } from "@/utils";

const usePassiveIncome = () => {
  const launchParams = useLaunchParams();
  const userID = launchParams.initData?.user?.id;
  const { user } = useGetUser();

  const currentRank = getRankData(user?.experience);

  const { data: cards_income } = useQuery({
    queryKey: ["user_cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("user_cards(earn_cards(*))")
        .eq("telegram_id", userID)
        .single();

      if (error) throw error;

      return data.user_cards.reduce(
        // @ts-ignore
        (acc, card) => card.earn_cards.passive_income + acc,
        0,
      );
    },
  });
  if (!currentRank) return 0;
  return cards_income
    ? cards_income + currentRank?.passive_coins
    : currentRank?.passive_coins;
};

export default usePassiveIncome;
