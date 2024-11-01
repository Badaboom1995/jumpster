import { getDifferenceInSeconds, getRankData } from "@/utils";

const useCurrentCoinsReward = (user: any) => {
  if (!user) return 0;
  const currentRank = getRankData(user?.experience);
  const coinsPerHour =
    currentRank?.passive_coins +
    user?.user_cards.reduce(
      (acc: number, item: any) => acc + item.passive_income,
      0,
    );
  const lastUpdateCoins = user?.user_parameters?.coins.last_update;
  const now = new Date().toISOString();
  const hoursPassed = Math.floor(
    getDifferenceInSeconds(lastUpdateCoins, now) / 3600,
  );
  const hoursToUse = hoursPassed > 3 ? 3 : hoursPassed;
  const earnCoins = Math.ceil(hoursToUse * coinsPerHour);

  return earnCoins;
};

export default useCurrentCoinsReward;
