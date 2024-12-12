"use client";
import React from "react";
import arrow from "@/app/_assets/icons/ArrowDown.svg";
import Image from "next/image";

const Loader = () => {
  return (
    <div className="fixed left-0 top-0 z-[100] flex h-[100vh] w-full flex-col items-center justify-center bg-background-dark">
      <Image
        src={arrow}
        alt="loader"
        className="w-[35px] rotate-180 animate-jumpAndSpin"
      />
    </div>
  );
};

export default Loader;
