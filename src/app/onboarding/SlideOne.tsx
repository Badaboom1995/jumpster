import React from "react";
import { useSlider } from "@/hooks/useSlider";
import Button from "@/components/Button";

const SlideOne = () => {
  const { next } = useSlider();
  return (
    <div>
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
        <Button onClick={next}>Дальше</Button>
      </div>
      <video
        className="height-[75vh] fixed left-0 top-[-50px] opacity-70"
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

export default SlideOne;
