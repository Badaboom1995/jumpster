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

const PreJumpView = () => {
  const { user } = useGetUser();

  if (!user) return null;
  // @ts-ignore
  const currentEnergy = user.user_parameters.energy.value;
  const rank = getRankData(user.experience);

  return (
    <div className="animate-fadeReverse flex flex-col items-center bg-background-dark pt-[24px]">
      <Title className="mb-[12px]">Готовы начать?</Title>
      <p className="mb-[24px] w-[300px] text-[16px] text-white">
        Проверьте свои <span className="text-primary">эффекты</span> за прыжок и
        используйте бустеры если нужно
      </p>
      <div className="mb-[32px] flex w-full flex-wrap justify-center gap-[8px]">
        <div className="rounded-[12px] bg-background px-[12px] py-[8px] font-semibold text-white">
          + {rank.coins_per_jump} 🟡
        </div>
        <div className="rounded-[12px] bg-background px-[12px] py-[8px] font-semibold text-white">
          - 100 ⚡️
        </div>
        <div className="flex w-full justify-center">
          <div className="w-fit rounded-[12px] bg-background px-[12px] py-[8px] font-semibold text-white">
            Прыжков за сессию {`->`} {Math.floor(currentEnergy / 100)}
          </div>
        </div>
      </div>
      <div className="mb-[36px]">
        <Image alt="rank" className="max-h-[300px] w-auto" src={rank.url} />
      </div>
      <div className="fixed bottom-[82px] left-0 w-full px-[12px]">
        <div className="mb-[12px] flex justify-between font-bold text-white">
          <div className="flex gap-[4px]">
            <Image src={energy as any} alt="energy" />
            <span>
              {Math.ceil(currentEnergy) || 0}/{rank?.energyCapacity}
            </span>
            {/*<span>150,000/150,000</span>*/}
          </div>
          <div className="flex gap-[4px]">
            <Image src={saved as any} alt="boost" />
            <span>Буст</span>
          </div>
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
