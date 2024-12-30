"use client";
import React, { useEffect, useState } from "react";
import usePathCheck from "@/hooks/usePathCheck";
import useGetUser from "@/hooks/api/useGetUser";
import Curtain from "@/components/Curtain";
import Image from "next/image";
import Button from "@/components/Button";
import Lottie from "lottie-react";
import fireAnimation from "@/app/_assets/lottie/fire.json";

const ANIMATION_DELAY_BETWEEN_DAYS = 200; // milliseconds

const rainbowAnimation = `
  @keyframes rainbow {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
`;

const getStreakMessage = (day: number) => {
  switch (day) {
    case 1:
      return "Отличное начало! Возвращайтесь завтра, чтобы продолжить серию.";
    case 2:
      return "Два дня подряд - вы на верном пути! Продолжайте в том же духе.";
    case 3:
      return "Три дня - уже привычка! Половина пути к особой награде пройдена 🎁";
    case 4:
      return "Четыре дня подряд - вы в ударе! Осталось совсем немного.";
    case 5:
      return "Пятый день - вы почти у цели! Еще два дня до особой награды.";
    case 6:
      return "Шестой день - финишная прямая! Завтра вас ждет особый сюрприз.";
    case 7:
      return "Седьмой день - невероятно! Получите свою особую награду 🎁";
    default:
      return "Заходите каждый день, чтобы не потерять свой прогресс.";
  }
};

const Header = () => {
  const { user } = useGetUser();
  const [prevStreak, setPrevStreak] = useState<null | number>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const visible = usePathCheck("/jump-flow");
  const [animatedDayCount, setAnimatedDayCount] = useState(0);

  useEffect(() => {
    // @ts-ignore
    if (user.streak_counter === 0) {
      setIsModalOpen(true);
    }
    // @ts-ignore
    if (prevStreak && user?.streak_counter > prevStreak) {
      setIsModalOpen(true);
    }
    // @ts-ignore
    setPrevStreak(user?.streak_counter);
    // @ts-ignore
  }, [user?.streak_counter]);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        // Reset animation
        setAnimatedDayCount(0);

        // Animate each day indicator
        // @ts-ignore
        const daysToAnimate = getCurrentWeekDay(user?.streak_counter);

        for (let i = 0; i < daysToAnimate; i++) {
          setTimeout(() => {
            setAnimatedDayCount(i + 1);
          }, i * ANIMATION_DELAY_BETWEEN_DAYS);
        }
      }, 1000);
    }
  }, [isModalOpen]);

  const getDayText = (days: number) => {
    // Handle numbers ending in 11-14 specially
    if (days % 100 >= 11 && days % 100 <= 14) {
      return "дней";
    }

    // Handle other cases based on last digit
    switch (days % 10) {
      case 1:
        return "день";
      case 2:
      case 3:
      case 4:
        return "дня";
      default:
        return "дней";
    }
  };

  // Get current day in the week (1-7)
  const getCurrentWeekDay = (streak: number) => {
    return ((streak - 1) % 7) + 1;
  };

  return (
    <>
      <style>{rainbowAnimation}</style>
      <div
        className={`${!visible && "hidden"} flex items-start justify-between font-bold`}
      >
        <Curtain
          onClose={() => {
            setIsModalOpen(false);
          }}
          isOpen={isModalOpen}
        >
          <Lottie
            animationData={fireAnimation}
            className="mx-auto mb-[12px] mt-[-32px] w-[200px]"
            loop={true}
          />

          <h2 className="mb-4 w-full text-center text-[24px] font-medium text-white">
            {/* @ts-ignore */}
            {user?.streak_counter} {/* @ts-ignore */}
            {user?.streak_counter && getDayText(user.streak_counter)} подряд!
          </h2>

          {/* Update the Week Progress Indicator */}
          <div className="mx-auto mb-4 flex w-full max-w-[280px] gap-1.5">
            {[...Array(7)].map((_, index) => (
              <div
                key={index}
                style={{
                  // primary color
                  border: index === 6 && "1px solid #D2FA63",
                  animation: index === 6 && "glow 5s linear infinite",
                }}
                className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                  index < animatedDayCount ? "bg-white" : "bg-background-light"
                }`}
              />
            ))}
          </div>

          {/* Add note about 7th day */}
          <p className="mb-6 text-center text-[14px] font-medium text-gray-400">
            {/* @ts-ignore */}
            {getStreakMessage(getCurrentWeekDay(user?.streak_counter))}
          </p>

          <Button
            onClick={() => {
              setIsModalOpen(false);
            }}
          >
            Продолжить
          </Button>
        </Curtain>
      </div>
    </>
  );
};

export default Header;
