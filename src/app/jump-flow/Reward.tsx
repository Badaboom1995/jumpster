import React, { PropsWithChildren, useEffect, useState } from "react";
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
import { Title } from "@telegram-apps/telegram-ui";
import useAnimatedNumber from "@/hooks/useAnimatedNumber";
import {
  calculateCaloriesBurned,
  secondsToMinutesString,
} from "@/app/jump-flow/utils";
import { supabase } from "@/components/Root/Root";
import useGetUser from "@/hooks/api/useGetUser";
// import { useRouter } from "next/navigation";
import { useQueryClient } from "react-query";
// import Confetti from "react-confetti";
// import useWindowSize from "react-use/lib/useWindowSize";

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
  const coinsEarned = jumps * coinsPerJump;
  const coinsEarnedAnimated = useAnimatedNumber(coinsEarned, 2, true);
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
  const { user, isUserLoading } = useGetUser();
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
        .update({ value: user?.user_parameters.coins.value + coinsEarned })
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

  // const { width, height } = useWindowSize();
  return (
    <div className="fixed top-0 z-[50] flex h-[100vh] w-full flex-col items-center overflow-y-scroll bg-background-dark px-[12px] py-[24px] pb-[80px]">
      {/*<Confetti*/}
      {/*  width={width}*/}
      {/*  height={height}*/}
      {/*  recycle={false}*/}
      {/*  numberOfPieces={coinsEarned || 100}*/}
      {/*  tweenDuration={5000}*/}
      {/*  friction={0.98}*/}
      {/*  gravity={0.1}*/}
      {/*  drawShape={(ctx) => {*/}
      {/*    ctx.beginPath();*/}
      {/*    const centerX = ctx.canvas.width / 2;*/}
      {/*    const centerY = ctx.canvas.height / 2;*/}
      {/*    const radius = 10; // Radius of the coin*/}

      {/*    ctx.arc(0, 0, radius, 0, 2 * Math.PI);*/}
      {/*    const gradient = ctx.createRadialGradient(*/}
      {/*      centerX,*/}
      {/*      centerY,*/}
      {/*      radius / 4,*/}
      {/*      centerX,*/}
      {/*      centerY,*/}
      {/*      radius,*/}
      {/*    );*/}

      {/*    gradient.addColorStop(0, "#FFD700"); // gold*/}
      {/*    gradient.addColorStop(0.5, "#FFC107"); // Slightly darker gold*/}
      {/*    gradient.addColorStop(1, "#FFD70B"); // Dark gold for depth*/}

      {/*    ctx.lineWidth = 5;*/}
      {/*    ctx.strokeStyle = "#DAA520"; // Dark gold for ridges*/}
      {/*    ctx.stroke();*/}

      {/*    ctx.fillStyle = gradient;*/}
      {/*    ctx.fill();*/}

      {/*    // draw dollar sign in the center*/}
      {/*    ctx.font = "bold 12px serif";*/}
      {/*    ctx.textAlign = "center";*/}
      {/*    ctx.textBaseline = "middle";*/}
      {/*    ctx.fillStyle = "#DAA520";*/}
      {/*    ctx.fillText("$", 0, 0);*/}

      {/*    ctx.closePath();*/}
      {/*  }}*/}
      {/*/>*/}
      <Image width={130} src={medal as any} alt="medal" className="mb-[12px]" />
      {/*<Title className="text-center text-[24px] font-[500] text-white">*/}
      {/*  Отличная работа!*/}
      {/*</Title>*/}
      <Title className="text-[80px] font-black leading-[90px] text-white">
        {coinsEarnedAnimated}
      </Title>
      <Title className="mb-[24px] text-[16px] font-[400] text-caption">
        Монет получено
      </Title>
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
