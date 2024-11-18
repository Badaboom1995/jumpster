import { supabase } from "@/components/Root/Root";
import roo0 from "@/app/_assets/images/roo-0.png";
import roo1 from "@/app/_assets/images/roo-1.png";
import roo2 from "@/app/_assets/images/roo-2.png";
import roo3 from "@/app/_assets/images/roo-3.png";
import roo4 from "@/app/_assets/images/roo-4.png";
import roo5 from "@/app/_assets/images/roo-5.png";
import roo6 from "@/app/_assets/images/roo-6.png";
import roo7 from "@/app/_assets/images/roo-7.png";
import roo8 from "@/app/_assets/images/roo-8.png";
import roo9 from "@/app/_assets/images/roo-9.png";
import roo10 from "@/app/_assets/images/roo-10.png";

export const ranks = [
  {
    id: 1,
    name: "Новичок",
    coins_per_jump: 5,
    passive_coins: 5,
    experience: 0,
    energyCapacity: 1000,
    recoveryRate: 0.278,
    url: roo0 as any,
  },
  {
    id: 2,
    name: "Ученик",
    coins_per_jump: 10,
    passive_coins: 10,
    experience: 10,
    energyCapacity: 3000,
    recoveryRate: 0.833,
    url: roo1 as any,
  },
  // First day
  {
    id: 3,
    name: "Любитель",
    coins_per_jump: 20,
    passive_coins: 100,
    experience: 90,
    energyCapacity: 4500,
    recoveryRate: 1.667,
    url: roo2 as any,
  },
  // Second day
  {
    id: 4,
    name: "Устремленный",
    coins_per_jump: 35,
    passive_coins: 500,
    experience: 225,
    energyCapacity: 8000,
    recoveryRate: 2.778,
    url: roo3 as any,
  },
  // Third day
  {
    id: 5,
    name: "Продвинутый",
    coins_per_jump: 60,
    passive_coins: 2000,
    experience: 800,
    energyCapacity: 10000,
    recoveryRate: 4.167,
    url: roo4 as any,
  },
  // Fourth day
  {
    id: 6,
    name: "Атлет",
    coins_per_jump: 100,
    passive_coins: 5000,
    experience: 2000,
    energyCapacity: 12000,
    recoveryRate: 6.25,
    url: roo5 as any,
  },
  {
    id: 7,
    name: "Профессионал",
    coins_per_jump: 150,
    passive_coins: 10000,
    experience: 3000,
    energyCapacity: 15000,
    recoveryRate: 8.333,
    url: roo6 as any,
  },
  {
    id: 8,
    name: "Мастер",
    coins_per_jump: 225,
    passive_coins: 20000,
    experience: 6000,
    energyCapacity: 20000,
    recoveryRate: 11.111,
    url: roo7 as any,
  },
  {
    id: 9,
    name: "Чемпион",
    coins_per_jump: 400,
    passive_coins: 50000,
    experience: 10000,
    energyCapacity: 30000,
    recoveryRate: 16.667,
    url: roo8 as any,
  },
  {
    id: 10,
    name: "Легенда",
    coins_per_jump: 600,
    passive_coins: 100000,
    experience: 15000,
    energyCapacity: 50000,
    recoveryRate: 25,
    url: roo9 as any,
  },
  {
    id: 11,
    name: "Супергерой",
    coins_per_jump: 300000,
    passive_coins: 200000,
    experience: 20000,
    energyCapacity: 100000,
    recoveryRate: 41.667,
    url: roo10 as any,
  },
];

export const getDifferenceInSeconds = (
  timestamp1: string,
  timestamp2: string,
): number => {
  // Convert timestamps to Date objects
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  // Get the difference in milliseconds
  const diffInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
  // Convert milliseconds to seconds
  return Math.floor(diffInMilliseconds / 1000);
};

// TODO: move to backend
export const addEnergy = async (user: any) => {
  const currentRank = getRankData(user?.experience);
  const energy = user?.user_parameters?.energy.value;
  const lastUpdate = user.user_parameters?.energy.last_update;
  const userId = user.id;
  const maxEnergyCapacity = currentRank?.energyCapacity;
  const energyPerSecond = currentRank?.recoveryRate;

  const now = new Date().toISOString();
  const secondsPassedEnergy = getDifferenceInSeconds(lastUpdate, now);
  let totalEnergy = Math.ceil(energy + secondsPassedEnergy * energyPerSecond);

  if (totalEnergy > maxEnergyCapacity) {
    totalEnergy = maxEnergyCapacity;
  }

  const { data } = await supabase
    .from("user_parameters")
    .update({ value: totalEnergy, updated_at: now })
    .eq("user_id", userId)
    .eq("name", "energy")
    .select()
    .single();

  return data?.value;
};

export const addCoins = async (user: any) => {
  const currentRank = getRankData(user?.experience);
  const coins = user?.user_parameters?.coins.value;
  const lastUpdate = user.user_parameters?.coins.last_update;
  const userId = user.id;
  const coinsPerHour =
    currentRank?.passive_coins +
    user?.user_cards.reduce(
      (acc: number, item: any) => acc + item.passive_income,
      0,
    );

  const now = new Date().toISOString();
  const hoursPassed = Math.floor(
    getDifferenceInSeconds(lastUpdate, now) / 3600,
  );
  const hoursToUse = hoursPassed > 3 ? 3 : hoursPassed;
  const earnCoins = Math.ceil(hoursToUse * coinsPerHour);

  const { data } = await supabase
    .from("user_parameters")
    .update({
      // @ts-ignore
      value: coins + earnCoins,
      updated_at: now,
    })
    .eq("user_id", userId)
    .eq("name", "coins")
    .select()
    .single();

  return data?.value;
};

export const updateStreak = async (user: any) => {
  if (!user) return;
  const currentStreak = user.streak_counter;
  const lastUpdate = user.last_activity_date;
  const userId = user.id;
  const todayDate = new Date().getDate();
  const now = new Date().toISOString();
  const isLastActiveYesterday =
    new Date(lastUpdate).getDate() === todayDate - 1 ||
    (todayDate === 1 &&
      new Date(lastUpdate).getDate() ===
        new Date(new Date().setDate(0)).getDate());
  const isLastActiveMoreThanTwoDays =
    new Date(lastUpdate).getDate() < todayDate - 1;

  if (currentStreak === 0) {
    await supabase
      .from("users")
      .update({
        streak_counter: 1,
        last_activity_date: now,
      })
      .eq("id", userId)
      .single();
    return;
  }
  if (isLastActiveMoreThanTwoDays) {
    await supabase
      .from("users")
      .update({
        streak_counter: 1,
        last_activity_date: now,
      })
      .eq("id", userId)
      .single();
    return;
  }
  if (isLastActiveYesterday) {
    await supabase
      .from("users")
      .update({
        streak_counter: currentStreak + 1,
        last_activity_date: now,
      })
      .eq("id", userId)
      .single();
    return;
  }
};

export const getObjectSearchParams = (
  params: URLSearchParams,
): Record<string, any> | null => {
  const objectParams = {};
  // @ts-ignore
  for (const key of params.keys()) {
    objectParams[key] = params.get(key);
  }
  return Object.keys(objectParams).length ? objectParams : null;
};

export const getRankData = (experience: number) => {
  if (experience === null || experience === undefined) return null;
  
  // Handle max level case
  if (experience >= ranks[ranks.length - 1].experience) {
    return {
      ...ranks[ranks.length - 1],
      percent: 100,
      nextRankExp: null,
    };
  }

  const nextRankIndex = ranks.findIndex((rank) => rank.experience > experience);
  const currentRankIndex = nextRankIndex - 1;

  const currentRank = ranks[currentRankIndex];
  const nextRank = ranks[nextRankIndex];
  const levelExp = nextRank.experience - currentRank.experience;
  const gainThisLevel = experience - currentRank.experience;

  return {
    ...currentRank,
    percent: Math.ceil((gainThisLevel / levelExp) * 100),
    nextRankExp: nextRank.experience,
  };
};
