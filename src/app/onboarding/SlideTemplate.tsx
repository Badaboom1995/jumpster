"use client";
import React from "react";
import Image from "next/image";
import Button from "@/components/Button";
import { useSlider } from "@/hooks/useSlider";
import arrow from "@/app/_assets/icons/ArrowDown.svg";
import { useRouter } from "next/navigation";

type SlideProps = {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  icon: any;
};

const SlideTemplate = (props: SlideProps) => {
  const router = useRouter();

  const { icon, title, description } = props;
  const { next, prev } = useSlider();
  return (
    <div className="flex h-[100vh] flex-col p-[24px] pt-[100px] text-white">
      <div className="fixed left-0 top-0 flex w-full justify-between px-[24px] py-[32px]">
        <button className="rotate-90" onClick={prev}>
          <Image className="" src={arrow} alt="arrow" />
        </button>
        <button
          className="text-[14px] underline active:bg-caption"
          onClick={() => router.push("/")}
        >
          Пропустить
        </button>
      </div>
      <div className="mb-[28px] flex items-end">
        <Image src={icon} alt="coin" className="mx-auto h-[35vh] w-auto" />
      </div>

      <h2 className="mb-[32px] text-[32px] font-black">{title}</h2>
      <p className="mb-[40px] grow text-[16px]">{description}</p>
      <Button onClick={next}>Дальше</Button>
    </div>
  );
};

export default SlideTemplate;
