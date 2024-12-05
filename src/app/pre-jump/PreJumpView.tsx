"use client";
import React from "react";
import { Title } from "@/components/Title";
import Link from "next/link";
import Button from "@/components/Button";
import play from "@/app/_assets/icons/Play.svg";
import Image from "next/image";
import useGetUser from "@/hooks/api/useGetUser";
import { getRankData } from "@/utils";
import energy from "@/app/_assets/icons/Energy.svg";
import saved from "@/app/_assets/icons/Saved.svg";
import { useUserBoosters } from "@/hooks/api/useBoosters";
import coin from "@/app/_assets/images/coin.png";
const PreJumpView = () => {
  const { user } = useGetUser();
  const { data: activeBoosters } = useUserBoosters(user?.id || "");

  if (!user) return null;
  // @ts-ignore
  const currentEnergy = user.user_parameters.energy.value;
  const rank = getRankData(user.experience);

  const getBoosterEffectText = (booster: any) => {
    console.log(booster);
    switch (booster.booster.effect_type) {
      case "coins_multiplier":
        return `${booster.booster.effect_value}x монет`;
      case "energy_recovery":
        return `${booster.booster.effect_value}x энергии`;
      case "experience_multiplier":
        return `${booster.booster.effect_value}x опыта`;
      case "jump_power":
        return `+${booster.booster.effect_value} монет/прыжок`;
      case "energy_cost_reduction":
        return `-${booster.booster.effect_value * 100}% энергии`;
      default:
        return "";
    }
  };

  return (
    <div className="fixed left-0 top-0 z-50 flex h-[100vh] w-full animate-fadeReverse flex-col items-center bg-background-dark pt-[32px]">
      <Link href="/" className="fixed right-[8px] top-[8px] block">
        <button className="right-[12px] top-[12px] z-50 rotate-90 rounded-full text-[24px] text-white transition active:bg-slate-900">
          &times;
        </button>
      </Link>
      <Title className="mb-[4px] mt-[12px] px-[16px] text-[36px]">
        <span>Готовы начать?</span>
      </Title>
      <p className="mb-[24px] w-[300px] text-[16px] text-white">
        Проверьте свои <span className="text-primary">эффекты</span> за прыжок и
        используйте бустеры если нужно
      </p>
      <div className="mb-[20px] flex w-full flex-wrap justify-center gap-[8px]">
        <div className="flex items-center gap-[2px] rounded-[12px] bg-background px-[12px] py-[8px] font-semibold text-white">
          + {rank.coins_per_jump}{" "}
          <Image className="w-[20px]" src={coin as any} alt="coin" />
        </div>
        <div className="rounded-[12px] bg-background px-[12px] py-[8px] font-semibold text-white">
          - 100 ⚡️
        </div>
        <div className="flex w-full flex-wrap justify-center gap-[8px]">
          {activeBoosters
            ?.filter(
              (booster) => booster.booster.effect_type !== "energy_recovery",
            )
            .map((booster) => (
              <div
                key={booster.id}
                className="rounded-[12px] border border-white bg-background px-[12px] py-[8px] font-semibold text-white"
              >
                {/* {getBoosterEffectText(booster)} */}
                {booster.booster.effect_type === "jump_power" ? (
                  <div className="flex items-center gap-[2px]">
                    + <span>{booster.booster.effect_value}</span>
                    <Image
                      className="w-[20px]"
                      src={coin as any}
                      alt="coin"
                    />{" "}
                    за прыжок
                  </div>
                ) : (
                  "123"
                )}
              </div>
            ))}
        </div>

        <div className="flex w-full justify-center">
          {/* <div className="w-fit rounded-[12px] bg-background-light px-[12px] py-[8px] font-semibold text-white">
            Прыжков за сессию {`->`} {Math.floor(currentEnergy / 100)}
          </div> */}
        </div>
      </div>
      <div className="mb-[36px]">
        <Image
          alt="rank"
          className="h-[40vh] max-h-[300px] w-auto"
          src={rank.url}
        />
      </div>
      <div className="fixed bottom-[24px] left-0 w-full px-[16px]">
        <div className="mb-[12px] flex justify-between font-bold text-white">
          <div className="flex gap-[4px]">
            <Image src={energy as any} alt="energy" />
            <span>
              {Math.ceil(currentEnergy) || 0}/{rank?.energyCapacity}
            </span>
            {/*<span>150,000/150,000</span>*/}
          </div>
          <Link href="/boosters" className="flex gap-[4px]">
            <Image src={saved as any} alt="boost" />
            <span>Буст</span>
          </Link>
        </div>
        <Link href="/jump-flow">
          <Button className="mb-[8px] px-[12px]" iconLeft={play as any}>
            Включить камеру
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PreJumpView;
