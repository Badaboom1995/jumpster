"use client";
import React from "react";
// @ts-ignore
import wave from "../../../public/wave.mp4";
import Image from "next/image";
import Button from "@/components/Button";

const OnboardingView = () => {
  return (
    <div className="fixed left-0 top-0 z-50 h-[100vh] w-full bg-[#1F2027]">
      {/*<Image*/}
      {/*  className="fixed right-0 top-[30px] z-0 h-[90vh] w-auto translate-x-1/4"*/}
      {/*  src={"/wave.gif"}*/}
      {/*  alt={""}*/}
      {/*  width={300}*/}
      {/*  height={500}*/}
      {/*/>*/}
      <div className="relative z-10 flex h-[100vh] w-full flex-col justify-between p-[24px] font-semibold text-white">
        <span></span>
        <div>
          <p className="text-[20px] leading-3 drop-shadow">
            Добро пожаловать в{" "}
          </p>
          <p className="mb-[35px] text-[48px] font-black drop-shadow">
            Jumpster{" "}
          </p>
          <p className="w-[250px] text-[16px] font-medium">
            Прыгай, зарабатывай монеты, повышай уровень и участвуй в
            распределении рекламного дохода!{" "}
          </p>
        </div>
        <Button>Дальше</Button>
      </div>
      <video
        className="height-[75vh] fixed left-[90px] top-[0] opacity-90"
        width="auto"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={"clean-bg.mp4"} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default OnboardingView;
