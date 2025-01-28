"use client";
import React, { useState } from "react";
import Slider from "@/components/SliderSimple";
import SlideOne from "@/app/onboarding/SlideOne";
import SlideTemplate from "@/components/SlideTemplate";
import coin from "@/app/_assets/images/coin.png";
import celeb from "@/app/_assets/images/celeb.png";
import star from "@/app/_assets/images/star.png";
import tasks from "@/app/_assets/images/tasks.png";
import time from "@/app/_assets/images/time.png";
import prize from "@/app/_assets/images/prize.png";
import play_lottie from "@/app/_assets/play_lottie.json";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useGetUser from "@/hooks/api/useGetUser";
import { User } from "@/database.types";
import * as amplitude from "@amplitude/analytics-browser";

const OnboardingView = () => {
  const { user } = useGetUser();
  const router = useRouter();
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const imageAssets = [coin, celeb, star, tasks, time, prize];

  const preloadImages = async () => {
    try {
      await Promise.all(
        imageAssets.map((src) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src.src;
            img.onload = resolve;
            img.onerror = reject;
          });
        }),
      );
      setImagesLoaded(true);
    } catch (error) {
      console.error("Failed to preload images:", error);
      // Show onboarding anyway if images fail to load
      setImagesLoaded(true);
    }
  };

  useEffect(() => {
    amplitude.track("Onboarding_Start");
    preloadImages();
  }, []);

  const setOnboardingDone = async (user: User) => {
    try {
      amplitude.track("Onboarding_Complete");
      router.push("/?onboarding_done=true");
    } catch (error) {
      console.error("Failed to update onboarding status:", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    // @ts-ignore
    if (user.onboarding_done) {
      router.push("/");
    }
  }, [user, router]);

  if (!imagesLoaded) {
    return (
      <div className="fixed left-0 top-0 z-50 flex h-[100vh] w-full items-center justify-center overflow-scroll bg-[#1F2126]">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-0 z-50 h-[100vh] w-full overflow-scroll bg-[#1F2126]">
      {/* @ts-ignore */}
      <Slider onFinish={() => user && setOnboardingDone(user)}>
        <SlideOne />
        <SlideTemplate
          icon={coin}
          title="Получай долю"
          animate={true}
          // @ts-ignore
          description={
            <p>
              <b>До 70% дохода</b> от рекламы отправляется в общий пул, который
              распределяется среди игроков. Чем больше у тебя монет, тем большую
              долю от пула ты получишь.
            </p>
          }
        />
        <SlideTemplate
          icon={prize}
          title="Прокачай атлета"
          animate={true}
          description="Каждый прыжок – это опыт для твоего героя. Повышай уровень, чтобы получать ещё больше монет и доступ к новым привилегиям. Стартуй как новичок, стань легендой!"
        />
        <SlideTemplate
          icon={star}
          title="Увеличивай доход"
          animate={true}
          description="Заключай контракты со спонсорами, прокачивай социальные сети и покупай снаряжение. Чем сильнее и известнее твой герой, тем больше пассивного дохода он приносит!"
        />
        <SlideTemplate
          icon={time}
          title="Поймай темп"
          animate={true}
          description="Заходи чаще и получай больше наград.Прыгай каждый час, собирай монеты каждые 3 часа и не забудь про ежедневные награды!"
        />
        <SlideTemplate
          icon={celeb}
          title="Собери команду"
          animate={true}
          description="За каждого приглашенного игрока ты получаешь 10% от всех его доходов, а так же 2.5% от доходов его рефералов. Вместе вы добъетесь большего!"
        />
        <SlideTemplate
          icon={tasks}
          title="Делай задания"
          animate={true}
          description="Чтобы заработать еще больше монет - выполняй специальные задания. Задания обновляются ежедневно, не упусти свою возможность!"
        />
        <SlideTemplate
          title="Начнем игру!"
          iconLottie={play_lottie}
          last
          // desription long
          description="Играй честно, соревнуйся с друзьями и стань топовым атлетом в мире Jumpster. Веселой игры и больших призов!"
          // @ts-ignore
          onNext={() => user && setOnboardingDone(user)}
          nextText="Понятно, погнали!"
        />
      </Slider>
    </div>
  );
};

export default OnboardingView;
