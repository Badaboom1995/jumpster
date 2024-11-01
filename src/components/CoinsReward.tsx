import React from "react";
import Button from "@/components/Button";
import useCurrentCoinsReward from "@/hooks/useCurrentCoinsReward";
import coin from "@/app/_assets/images/coin.png";
import Image from "next/image";

const CoinsReward = ({ user, setIsPopupOpen }: any) => {
  const currentCoinsReward = useCurrentCoinsReward(user);
  return (
    <div className="flex flex-col items-center">
      <Image className="mb-[12px] w-[150px]" src={coin} alt={"coin"} />
      <p className="mb-[24px] text-center text-[24px] font-semibold text-white">
        Твоя награда!
      </p>
      <p className="text-[20px] font-bold text-white">
        <div className="mb-[32px] flex gap-[8px]">🟡 {currentCoinsReward}</div>
      </p>
      <Button
        onClick={() => {
          setIsPopupOpen(false);
        }}
      >
        Забрать
      </Button>
    </div>
  );
};

export default CoinsReward;
