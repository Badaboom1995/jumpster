"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import Link from "next/link";
import play from "@/app/_assets/icons/Play.svg";
import energy from "@/app/_assets/icons/Energy.svg";
import saved from "@/app/_assets/icons/Saved.svg";
import Image from "next/image";
import useGetUser from "@/hooks/api/useGetUser";
import {
  addCoins,
  addEnergy,
  getObjectSearchParams,
  getRankData,
  ranks,
  updateStreak,
} from "@/utils";

import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { requestWithRetry } from "@/app/jump-flow/utils";
import { StoreContext } from "@/components/Root/Root";
import { useRouter, useSearchParams } from "next/navigation";

import Slider from "react-slick";
import "./main.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import useTimer from "@/hooks/useTimer";
import Character from "@/components/Character";
import Header from "@/components/Header";
import usePassiveIncome from "@/hooks/usePassiveIncome";
import useCurrentCoinsReward from "@/hooks/useCurrentCoinsReward";
// import Curtain from "@/components/Curtain";
// import CoinsReward from "@/components/CoinsReward";
import { useQueryClient } from "react-query";
// import { twMerge } from "tailwind-merge";
// import fire from "@/app/_assets/icons/Fire.svg";
// import Card from "@/components/Card";
// import JumpingCoinLoader from "@/app/Loader";
// import Loader from "@/app/Loader";
import { BoostersList } from "@/components/Boosters/BoostersList";
import CoinsFirework, {
  CoinsFireworkRef,
} from "@/components/CoinsFirework/CoinsFirework";

type StatsProps = {
  coins: number;
  energy: number;
  experience: number;
};

const settings = {
  dots: false,
  arrows: false,
  centerPadding: "20px",
  centerMode: true,
  className: "center",
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  controls: false,
};

const Main = () => {
  const { store, setStore } = useContext(StoreContext);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const objectSearchParams = getObjectSearchParams(searchParams);
  const { user, isUserLoading } = useGetUser(false);
  // @ts-ignore
  const userParams = user?.user_parameters;
  const detectorRef = useRef<any>(null);
  const { width, height } = useWindowSize();
  const [numberOfPieces, setNumberOfPieces] = useState(0);
  const [runAnimation, setRunAnimation] = useState(false);
  const [userStats, setUserStats] = useState<StatsProps | null>(null);
  const [initialSlide, setInitialSlide] = useState(null);
  const router = useRouter();
  const currentCoinsReward = useCurrentCoinsReward(user);
  const passive_income = usePassiveIncome();

  const currentRankData = getRankData(userStats?.experience);
  const currentLevelProgress = currentRankData?.percent;
  const currentEnergy = userStats?.energy;
  const currentCharacterImage = currentRankData?.url;

  const coinsFireworkRef = useRef<CoinsFireworkRef>(null);

  const handleClaimCoins = async (event: React.MouseEvent) => {
    try {
      let particleCount = { min: 10, max: 20 };
      if (currentCoinsReward > 1000 && currentCoinsReward < 5000) {
        particleCount = { min: 30, max: 50 };
      }
      if (currentCoinsReward > 5000 && currentCoinsReward < 10000) {
        particleCount = { min: 50, max: 80 };
      }
      if (currentCoinsReward > 10000 && currentCoinsReward < 20000) {
        particleCount = { min: 80, max: 120 };
      }
      if (currentCoinsReward > 20000 && currentCoinsReward < 50000) {
        particleCount = { min: 120, max: 150 };
      }
      if (currentCoinsReward > 50000) {
        particleCount = { min: 150, max: 200 };
      }

      coinsFireworkRef.current?.triggerAnimation(
        event.clientX,
        event.clientY,
        particleCount,
      );

      await addCoins(user);
      await queryClient.invalidateQueries("user");
    } catch (e) {
      console.log(e);
    }
  };

  const loadModel = async () => {
    if (store.detector) return;
    await tf.ready();
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    };
    await requestWithRetry(
      async () =>
        await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig,
        ),
    );
    detectorRef.current = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig,
    );
    setStore({ detector: detectorRef.current });
  };

  const animateNewLevel = (prevRank: any) => {
    // set prev rank experience
    setUserStats((prev) => ({ ...prev, experience: prevRank.experience }));
    setTimeout(() => {
      setUserStats((prev) => ({
        ...prev,
        experience: prevRank.nextRankExp - 1,
      }));
      setTimeout(() => {
        setNumberOfPieces(1000);
        // @ts-ignore
        setUserStats((prev) => ({ ...prev, experience: user?.experience }));
        setTimeout(() => {
          window.history.pushState({}, document.title, "/");
          setNumberOfPieces(0);
        }, 1000);
      }, 1500);
    }, 500);
  };

  const chooseBehaviour = () => {
    // if no search searchParams, then no animation
    if (!objectSearchParams) {
      setUserStats({
        coins: userParams?.coins.value,
        energy: userParams?.energy.value,
        // @ts-ignore
        experience: user?.experience,
      });
      return;
    }
    // if got search searchParams with claim=true and new level detected, then run new level animation
    // @ts-ignore
    const currentRank = getRankData(user?.experience);
    const prevRank = getRankData(objectSearchParams?.experience);
    const isNewLevel = prevRank?.id < currentRank?.id;

    if (objectSearchParams && objectSearchParams.claim && isNewLevel) {
      setRunAnimation(true);
      animateNewLevel(prevRank);
    }
    // if got search searchParams with claim=true but no new level detected, then run claim animation
    if (objectSearchParams && objectSearchParams.claim && !isNewLevel) {
      setUserStats((prev) => ({
        ...prev,
        coins: objectSearchParams.coins,
        energy: objectSearchParams.energy,
        experience: objectSearchParams.experience,
      }));
      window.history.pushState({}, document.title, "/");
      setTimeout(() => {
        setUserStats((prev) => ({
          ...prev,
          coins: userParams?.coins.value,
          energy: userParams?.energy.value,
          // @ts-ignore
          experience: user?.experience,
        }));
      }, 500);
    }
  };

  // http://localhost:3000/?claim=true&coins=217&energy=1000&experience=424
  useTimer(() => {
    if (!currentRankData) return;
    setUserStats((prev) => ({
      ...prev,
      energy:
        prev?.energy + currentRankData?.recoveryRate >
        currentRankData.energyCapacity
          ? currentRankData.energyCapacity
          : prev?.energy + currentRankData?.recoveryRate,
    }));
  }, [currentRankData]);

  useEffect(() => {
    // @ts-ignore
    if (user && !user?.onboarding_done) {
      router.push("/onboarding");
    }
    loadModel();
    if (!user) return;
    // @ts-ignore
    setInitialSlide(getRankData(user?.experience)?.id - 1);
    chooseBehaviour();
  }, [isUserLoading, user]);

  useEffect(() => {
    if (!user) return;
    // TODO: move to backend
    addEnergy(user).then((energy) => {
      setUserStats((prev) => ({ ...prev, energy }));
    });
    updateStreak(user).then(() => {
      queryClient.invalidateQueries("user");
    });
  }, [user]);

  if (!user || isUserLoading || !userParams || !userStats) return null;
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={numberOfPieces}
      />
      <CoinsFirework ref={coinsFireworkRef} />
      <Header />
      <div className="flex grow flex-col justify-center">
        <div className="flex grow flex-col justify-center">
          <div className="mb-[16px] mt-[12px] flex flex-col items-center p-[8px]">
            <p className="mb-[8px] flex w-full items-center justify-center gap-[8px] text-center text-[42px] font-bold leading-[52px] text-white">
              {/*TODO: use image instead*/}
              <span className="text-[32px]">🟡</span>{" "}
              <span>{userParams.coins.value.toLocaleString()}</span>
            </p>
            {passive_income ? (
              <p className="flex w-full items-center justify-center gap-[8px] text-center text-[20px] text-slate-400">
                +{passive_income} монет в час
              </p>
            ) : (
              <div className="h-[30px] w-[150px] animate-pulse rounded bg-background"></div>
            )}
          </div>
          {initialSlide !== null && (
            <Slider {...settings} initialSlide={initialSlide}>
              {ranks.map((rank, index) => {
                // @ts-ignore
                const rankId = getRankData(user?.experience)?.id;
                // @ts-ignore
                if (rankId !== rank.id) {
                  return (
                    <Character
                      current={false}
                      key={rank.id}
                      progressLevel={0}
                      runAnimation={false}
                      rankImage={rank.url}
                      rankName={rank.name}
                      passive_income={rank.passive_coins}
                    />
                  );
                }
                return (
                  <Character
                    current={true}
                    key={rank.id}
                    progressLevel={currentLevelProgress}
                    runAnimation={runAnimation}
                    rankImage={currentCharacterImage}
                    // @ts-ignore
                    rankName={getRankData(user?.experience)?.name}
                    passive_income={rank.passive_coins}
                  />
                );
              })}
            </Slider>
          )}
        </div>
        <div className="mb-[12px] flex justify-between px-[16px] font-bold text-white">
          <div className="flex gap-[4px]">
            <Image src={energy as any} alt="energy" />
            <span>
              {Math.ceil(currentEnergy) || 0}/{currentRankData?.energyCapacity}
            </span>
          </div>
          <Link href="/boosters" className="flex items-center gap-[4px]">
            <Image src={saved as any} alt="boost" />
            <span>Буст</span>
          </Link>
        </div>
      </div>
      <div className="mb-[12px] px-[16px]">
        {currentCoinsReward ? (
          <Button onClick={handleClaimCoins} variant="secondary">
            Забрать 🟡 {currentCoinsReward}
          </Button>
        ) : (
          <Link href="/pre-jump">
            <Button disabled={currentEnergy < 1000} iconLeft={play as any}>
              Начать прыжки
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Main;
