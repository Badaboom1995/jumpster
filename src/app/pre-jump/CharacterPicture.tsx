"use client";
import React from "react";
import useGetUser from "@/hooks/api/useGetUser";
import Image from "next/image";
import { getRankData } from "@/utils";

const CharacterPicture = () => {
  const { user } = useGetUser();
  if (!user) return null;
  // @ts-ignore
  const rank = getRankData(user.experience);
  return (
    <div>
      <Image
        alt="rank character"
        className="max-h-[350px] w-auto"
        src={rank.url}
      />
    </div>
  );
};

export default CharacterPicture;
