"use client";
import React, { useEffect, useState } from "react";
import usePathCheck from "@/hooks/usePathCheck";
import useGetUser from "@/hooks/api/useGetUser";
import usePassiveIncome from "@/hooks/usePassiveIncome";
import Curtain from "@/components/Curtain";
import fire from "@/app/_assets/images/fire.png";
import Image from "next/image";
import Button from "@/components/Button";
import Card from "@/components/Card";

const Header = () => {
  const { user } = useGetUser();
  const [prevStreak, setPrevStreak] = useState<null | number>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const visible = usePathCheck("/jump-flow");

  useEffect(() => {
    if (user.streak_counter === 0) {
      setIsModalOpen(true);
    }
    if (prevStreak && user?.streak_counter > prevStreak) {
      setIsModalOpen(true);
      console.log("increased");
    }
    setPrevStreak(user?.streak_counter);
  }, [user?.streak_counter]);

  return (
    <div
      className={`${!visible && "hidden"} flex items-start justify-between p-[12px] pb-[12px] pt-[24px] font-bold`}
    >
      <Curtain
        onClose={() => {
          setIsModalOpen(false);
        }}
        isOpen={isModalOpen}
      >
        <Image className="mx-auto w-[150px]" src={fire} alt="fire" />
        <h2 className="text-center text-[60px] leading-[68px] text-white">
          {user?.streak_counter}
        </h2>
        <h2 className="mb-[32px] w-full text-center text-[20px] font-medium text-white">
          дней подряд!
        </h2>
        {/*<div className="mb-[12px] flex gap-[8px] py-[16px]">*/}
        {/*  <div className="flex w-1/2 grow flex-col items-center rounded-[12px] bg-background p-4 text-center text-white">*/}
        {/*    <span className="text-[24px]">🟡</span>*/}
        {/*    <span className="text-[24px]">100</span>*/}
        {/*    <span className="text-[12px] font-medium text-gray-400">Монет</span>*/}
        {/*  </div>*/}
        {/*  <div className="flex w-1/2 grow flex-col items-center rounded-[12px] bg-background p-4 text-center text-white">*/}
        {/*    <span className="text-[24px]">⚡</span>*/}
        {/*    <span className="text-[24px]">300</span>*/}
        {/*    <span className="text-[12px] font-medium text-gray-400">*/}
        {/*      Энергии*/}
        {/*    </span>*/}
        {/*  </div>*/}
        {/*</div>*/}
        <Button
          // variant="secondary"
          onClick={() => {
            setIsModalOpen(false);
          }}
        >
          Понятно
        </Button>
      </Curtain>
      {/*<button*/}
      {/*  onClick={() => {*/}
      {/*    setIsModalOpen(true);*/}
      {/*  }}*/}
      {/*>*/}
      {/*  open*/}
      {/*</button>*/}
      {/*<div className="flex gap-[8px]">*/}
      {/*  <Card className="rounded-[12px] px-[12px] py-[4px] font-medium text-white">*/}
      {/*    @{user?.username ? user.username : "unknown"}*/}
      {/*  </Card>*/}
      {/*  /!*<div className="font-boldtext-black flex items-center gap-[4px] rounded-[12px] bg-white px-[12px] py-[4px]">*!/*/}
      {/*  /!*  <Image className="w-[20px]" src={basket as any} alt="basket" />*!/*/}
      {/*  /!*  Магазин*!/*/}
      {/*  /!*</div>*!/*/}
      {/*</div>*/}
      {/*<div className="">*/}
      {/*  <p*/}
      {/*    className={twMerge(*/}
      {/*      "flex items-center gap-[4px] rounded-[12px] px-[8px] py-[4px] text-white",*/}
      {/*      increased && "animate-glowBright",*/}
      {/*    )}*/}
      {/*  >*/}
      {/*    <Image src={fire as any} className="w-[16px]" alt="basket" />{" "}*/}
      {/*    <p className="text-[16px]">{user?.streak_counter}</p>*/}
      {/*  </p>*/}
      {/*  /!*<p className="flex w-full items-center justify-end gap-[8px] text-[24px] font-bold leading-[30px] text-white">*!/*/}
      {/*  /!*  /!*TODO: use image instead*!/*!/*/}
      {/*  /!*  <span>🟡</span>*!/*/}
      {/*  /!*  <span>*!/*/}
      {/*  /!*    /!*@ts-ignore*!/*!/*/}
      {/*  /!*    {(user?.user_parameters?.coins.value).toLocaleString()}*!/*/}
      {/*  /!*  </span>*!/*/}
      {/*  /!*</p>*!/*/}
      {/*  /!*<p className="flex w-full items-center justify-end gap-[8px] text-center text-[14px] text-slate-400">*!/*/}
      {/*  /!*  + {passive_income} в час*!/*/}
      {/*  /!*</p>*!/*/}
      {/*</div>*/}
    </div>
  );
};

export default Header;
