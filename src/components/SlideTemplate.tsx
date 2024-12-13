"use client";
import React from "react";
import Image from "next/image";
import Button from "@/components/Button";
import { useSlider } from "@/hooks/useSlider";
import arrow from "@/app/_assets/icons/ArrowDown.svg";

type SlideProps = {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  icon: any;
  first?: boolean;
  onSkip?: () => void;
  onNext?: () => void;
  nextText?: string;
};

const SlideTemplate = (props: SlideProps) => {
  const { icon, title, description, onSkip, onNext, nextText, first } = props;
  const { next, prev } = useSlider();
  return (
    <div className="flex h-[100vh] flex-col p-[24px] pt-[100px] text-white">
      <div className="fixed left-0 top-0 flex w-full justify-between px-[24px] py-[32px]">
        <button className="h-[25px] rotate-90" onClick={prev}>
          {!first && <Image className="max-w-full" src={arrow} alt="arrow" />}
        </button>
        <button
          className="text-[14px] underline active:bg-caption"
          onClick={onSkip}
        >
          Пропустить
        </button>
      </div>
      <div className="mb-[28px] flex items-end">
        <Image
          src={icon}
          alt="coin"
          className="mx-auto h-[35vh] w-auto max-w-full"
        />
      </div>

      <h2 className="mb-[32px] text-[32px] font-black">{title}</h2>
      <p className="mb-[40px] grow text-[16px]">{description}</p>
      <Button onClick={onNext || next}>{nextText || "Дальше"}</Button>
    </div>
  );
};

export default SlideTemplate;
