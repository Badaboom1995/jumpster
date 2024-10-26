import React from "react";
import Card from "@/components/Card";
import Image from "next/image";

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
    <div className="py-[0px]">
      <Card
        className={`${!current && "opacity-40"} mx-[4px] ${runAnimation && "animate-trembling"} mb-[32px] flex flex-col items-center justify-center rounded-[24px] p-[24px] text-white`}
      >
        <Image
          className="-mt-[45px] mb-[16px] h-[300px] w-auto"
          src={rankImage}
          alt="roo"
        />
        <div className="flex w-full flex-wrap justify-between">
          <span>{rankName}</span>
          <span>+{passive_income || 0} 🟡 в час</span>
          <div className="mt-[8px] w-full rounded-full border border-white p-1">
            <div
              style={{
                width: `${progressLevel}%`,
              }}
              className="transition-slow h-[7px] animate-glow rounded-full bg-white"
            ></div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Character;
