"use client";
import React from "react";
import usePathCheck from "@/hooks/usePathCheck";
import Card from "@/components/Card";
import Image from "next/image";
import fire from "@/app/_assets/icons/Fire.svg";
import useGetUser from "@/hooks/api/useGetUser";

const Header = () => {
  const { user } = useGetUser();
  const visible = usePathCheck("/jump-flow");
  return (
    <div
      className={`${!visible && "hidden"} flex items-start justify-between p-[16px] pb-[12px] pt-[24px] font-bold`}
    >
      <div className="flex gap-[8px]">
        <Card className="rounded-[12px] px-[12px] py-[4px] font-medium text-white">
          @{user?.username || "unknown"}
        </Card>
        {/*<div className="font-boldtext-black flex items-center gap-[4px] rounded-[12px] bg-white px-[12px] py-[4px]">*/}
        {/*  <Image className="w-[20px]" src={basket as any} alt="basket" />*/}
        {/*  Магазин*/}
        {/*</div>*/}
      </div>
      <div className="flex items-center gap-[4px] rounded-[12px] px-[8px] py-[4px] text-white">
        <Image src={fire as any} alt="basket" /> {user?.streak_counter} дней
      </div>
    </div>
  );
};

export default Header;
