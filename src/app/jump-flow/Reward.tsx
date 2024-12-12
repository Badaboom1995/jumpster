import React, { PropsWithChildren, useEffect, useState, useRef } from "react";
import Image from "next/image";
import medal from "@/app/_assets/images/medal.png";
import fire from "@/app/_assets/icons/Fire.svg";
import arrowUp from "@/app/_assets/icons/ArrowFatUp.svg";
import timer from "@/app/_assets/icons/Timer.svg";
import clockCountDown from "@/app/_assets/icons/ClockCountdown.svg";
import Link from "next/link";
import Button from "@/components/Button";
import gift from "@/app/_assets/icons/Gift.svg";
import { twMerge } from "tailwind-merge";
import useAnimatedNumber from "@/hooks/useAnimatedNumber";
import {
  calculateCaloriesBurned,
  secondsToMinutesString,
} from "@/app/jump-flow/utils";
import { supabase } from "@/components/Root/Root";
import useGetUser from "@/hooks/api/useGetUser";
// import { useRouter } from "next/navigation";
import { useQueryClient } from "react-query";
import { calculateReward } from "@/utils";
import { useUserBoosters } from "@/hooks/api/useBoosters";
// import Confetti from "react-confetti";
// import useWindowSize from "react-use/lib/useWindowSize";
import finishSound from "@/app/_assets/audio/harp_money.wav";
import coin from "@/app/_assets/images/coin.png";

const StatCard = ({
  children,
  className,
}: PropsWithChildren & { className?: string }) => {
  return (
    <div
      className={twMerge(
        "flex h-fit flex-col items-center gap-[4px] rounded-[12px] bg-background px-[12px] py-[24px] text-white",
        className,
      )}
    >
      {children}
    </div>
  );
};

const coinsPerJump = 1;

const Reward = ({
  jumps,
  time,
  energyLeft,
}: {
  jumps: number;
  time: number;
  energyLeft: number;
}) => {
  const queryClient = useQueryClient();
  const { user, isUserLoading } = useGetUser();
  const { data: activeBoosters } = useUserBoosters(user?.id || "");

  const coinsEarned = jumps * coinsPerJump;

  const coinsEarned2 =
    calculateReward({
      jumps,
      // @ts-ignore
      experience: user?.experience,
      boostersImpact: activeBoosters
        ?.filter((booster) => booster.booster.effect_type === "jump_power")
        .reduce((acc, booster) => acc + booster.booster.effect_value, 0),
    }) || 502;
  const coinsEarnedAnimated = useAnimatedNumber(coinsEarned2, 2, true);
  const caloriesAnimated = useAnimatedNumber(
    calculateCaloriesBurned(jumps, time),
    2,
    true,
  );
  const jumpsAnimated = useAnimatedNumber(jumps, 2, true);
  const timeAnimated = useAnimatedNumber(time, 2, true);
  const jumpsPerMinuteAnimated = useAnimatedNumber(
    Math.floor((jumps / time) * 60),
    2,
    true,
  );

  const [prevValues, setPrevValues] = useState({
    coins: 0,
    energy: 0,
    experience: 0,
  });
  // TODO: move to backend
  const addReward = async () => {
    if (!user) return;
    try {
      const now = new Date().toISOString();

      setPrevValues({
        //@ts-ignore
        coins: user?.user_parameters.coins.value,
        //@ts-ignore
        energy: user?.user_parameters.energy.value,
        // @ts-ignore
        experience: user.experience,
      });

      await supabase
        .from("user_parameters")
        // @ts-ignore
        .update({ value: user?.user_parameters.coins.value + coinsEarned2 })
        .eq("user_id", user.id)
        .eq("name", "coins");

      await supabase
        .from("user_parameters")
        .update({ value: energyLeft || 0, updated_at: now })
        .eq("user_id", user.id)
        .eq("name", "energy");

      // add experience
      await supabase
        .from("users")
        // @ts-ignore
        .update({ experience: user.experience + jumps })
        .eq("id", user.id);

      await queryClient.invalidateQueries("user");
    } catch (e) {}
  };

  useEffect(() => {
    addReward();
  }, []);

  const finishAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    finishAudioRef.current = new Audio(finishSound);
    if (finishAudioRef.current) {
      finishAudioRef.current.volume = 0.2;
    }
    if (finishAudioRef.current) {
      finishAudioRef.current.currentTime = 0;
      finishAudioRef.current.play().catch((error) => {
        console.warn("Audio playback failed:", error);
      });
    }
  }, []);

  return (
    <div className="fixed top-0 z-[50] flex h-[100vh] w-full flex-col items-center overflow-y-scroll bg-background-dark px-[12px] py-[24px] pb-[80px]">
      <Image width={130} src={medal as any} alt="medal" className="mb-[12px]" />
      <h2 className="flex items-center gap-[4px] text-[64px] font-bold leading-[90px] text-white">
        {coinsEarnedAnimated.toLocaleString()}
      </h2>
      <h3 className="mb-[24px] text-[16px] font-[400] text-caption">
        Монет получено
      </h3>
      <div className="w-full grow">
        <div className="grid w-full grid-cols-2 gap-[4px]">
          <StatCard>
            <Image src={fire as any} alt="energy" width={24} height={24} />
            <span className="text-[28px] font-[600] leading-[32px]">
              {caloriesAnimated}
            </span>
            <span className="text-caption">Calories</span>
          </StatCard>
          <StatCard>
            <Image src={arrowUp as any} alt="energy" width={24} height={24} />
            <span className="text-[28px] font-[600] leading-[32px]">
              {jumpsAnimated}
            </span>
            <span className="text-caption">Jumps</span>
          </StatCard>
          <StatCard>
            <Image src={timer as any} alt="energy" width={24} height={24} />
            <span className="text-[28px] font-[600] leading-[32px]">
              {secondsToMinutesString(timeAnimated)}
            </span>
            <span className="text-caption">Total time</span>
          </StatCard>
          <StatCard>
            <Image
              src={clockCountDown as any}
              alt="energy"
              width={24}
              height={24}
            />
            <span className="text-[28px] font-[600] leading-[32px]">
              {jumpsPerMinuteAnimated}
            </span>
            <span className="text-caption">Jumps per minute</span>
          </StatCard>
        </div>
      </div>
      <Link
        className="fixed bottom-[24px] w-full px-[12px]"
        href={`/?claim=true&coins=${prevValues.coins}&energy=${prevValues.energy}&experience=${prevValues.experience}`}
      >
        <Button iconLeft={gift as any} variant="secondary">
          Забрать награду
        </Button>
      </Link>
    </div>
  );
};

export default Reward;
