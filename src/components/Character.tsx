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
  locked?: boolean;
  tiltAngle: number;
};

const Character = (character: CharacterProps) => {
  const {
    rankImage,
    rankName,
    progressLevel,
    runAnimation,
    current,
    passive_income,
    locked,
    tiltAngle,
  } = character;

  return (
    <div
      className={`${!current && "opacity-40"} mx-[4px] ${runAnimation && "animate-trembling"} mb-[8px] flex w-full grow flex-col items-center justify-center rounded-[24px] px-[12px] text-white`}
    >
      <div className="w-full grow">
        <Image
          style={{
            transform: `translateX(-50%) rotate(${tiltAngle / 2}deg)`,
            transition: tiltAngle === 0 ? "transform 0.3s ease-out" : "none",
          }}
          className={`${locked && "opacity-80 brightness-0"} top-62px absolute left-1/2 h-[calc(100vh-340px)] w-auto`}
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
