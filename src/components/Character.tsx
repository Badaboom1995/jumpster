import React from "react";
import Card from "@/components/Card";
import Image from "next/image";
import coin from "@/app/_assets/images/coin.png";

type CharacterProps = {
  current: boolean;
  runAnimation: boolean;
  rankName: string;
  rankImage: string;
  progressLevel: number;
  passive_income: number;
};

const Character = (character: CharacterProps) => {
  const {
    rankImage,
    rankName,
    progressLevel,
    runAnimation,
    current,
    passive_income,
  } = character;

  return (
    <div
      className={`${!current && "opacity-40"} mx-[4px] ${runAnimation && "animate-trembling"} mb-[8px] flex w-full grow flex-col items-center justify-center rounded-[24px] px-[12px] text-white`}
    >
      {/* {current && <p className="-mb-[8px] text-[14px]">badavoo</p>} */}
      <div className="w-full grow">
        <Image
          className={`${!current && "opacity-50 brightness-0"} top-62px absolute left-1/2 h-[calc(100vh-350px)] w-auto -translate-x-1/2`}
          src={rankImage}
          alt="roo"
        />
      </div>
      <div className="flex w-full flex-wrap justify-between">
        <span className="font-semibold">{rankName}</span>
        <span className="flex items-center gap-[4px] font-semibold">
          +{passive_income || 0}{" "}
          <Image src={coin as any} alt="coin" width={24} /> в час
        </span>
        <div className="mt-[8px] w-full rounded-full border border-white p-1">
          <div
            style={{
              width: `${progressLevel}%`,
            }}
            className="transition-slow h-[7px] animate-glow rounded-full bg-white"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Character;
