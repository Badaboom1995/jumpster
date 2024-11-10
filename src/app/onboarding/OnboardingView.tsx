"use client";
import React from "react";
import Slider from "@/components/SliderSimple";
import SlideOne from "@/app/onboarding/SlideOne";
import SlideTemplate from "@/app/onboarding/SlideTemplate";
import coin from "@/app/_assets/images/coin.png";
import celeb from "@/app/_assets/images/celeb.png";
import star from "@/app/_assets/images/star.png";
import tasks from "@/app/_assets/images/tasks.png";
import time from "@/app/_assets/images/time.png";
import prize from "@/app/_assets/images/prize.png";

const OnboardingView = () => {
  return (
    <div className="fixed left-0 top-0 z-50 h-[100vh] w-full overflow-scroll bg-[#1F2126]">
      <Slider>
        <SlideOne />
        <SlideTemplate
          icon={coin}
          title="Получай долю"
          description={
            <p>
              <b>До 70% дохода</b> от рекламы отправляется в общий пул, который
              распределяется среди игроков. Чем больше у тебя монет, тем больше
              ты получишь долю от пула.
            </p>
          }
        />
        <SlideTemplate
          icon={prize}
          title="Прокачай атлета"
          description="Каждый прыжок – это опыт для твоего героя. Повышай уровень, чтобы получать ещё больше монет и доступ к новым привилегиям. Стартуй как новичок, стань легендой!"
        />
        <SlideTemplate
          icon={star}
          title="Увеличивай доход"
          description="Заключай контракты со спонсорами, прокачивай социальные сети и покупай снаряжение. Чем сильнее и известнее твой герой, тем больше пассивного дохода он приносит!"
        />
        <SlideTemplate
          icon={time}
          title="Поймай темп"
          description="Заходи чаще и получай больше наград. Прыгай каждый час, собирай монеты каждые 3 часа и не забудь про ежедневные награды!"
        />
        <SlideTemplate
          icon={celeb}
          title="Собери команду"
          description="За каждого приглашенного друга ты получаешь 25% от всех его доходов, а так же 10% от доходов его друзей. Вместе вы добъетесь большего!"
        />
        <SlideTemplate
          icon={tasks}
          title="Делай задания"
          description="Чтобы заработать еще больше монет - выполняй специальные задания. Задания обновляются ежедневно, не упусти свою возможность!"
        />
      </Slider>
    </div>
  );
};

export default OnboardingView;
