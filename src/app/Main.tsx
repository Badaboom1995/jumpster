"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import Link from "next/link";
import play from "@/app/_assets/icons/Play.svg";
import energy from "@/app/_assets/icons/Energy.svg";
import saved from "@/app/_assets/icons/Saved.svg";
import Image from "next/image";
import useGetUser from "@/hooks/api/useGetUser";
import { addEnergy, getObjectSearchParams, getRankData, ranks } from "@/utils";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { requestWithRetry } from "@/app/jump-flow/utils";
import { StoreContext } from "@/components/Root/Root";
import { useSearchParams } from "next/navigation";

import Slider from "react-slick";
import "./main.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import useTimer from "@/hooks/useTimer";
import Character from "@/components/Character";
import FullscreenCanvas from "@/components/FullScreenCanvas";

type StatsProps = {
  coins: number;
  energy: number;
  experience: number;
};

var settings = {
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

  const currentRankData = getRankData(userStats?.experience);
  const currentLevelProgress = currentRankData?.percent;
  const currentEnergy = userStats?.energy;
  const currentCharacterImage = currentRankData?.url;

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
        experience: user?.experience,
      });
      return;
    }
    // if got search searchParams with claim=true and new level detected, then run new level animation
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
      setTimeout(() => {
        setUserStats((prev) => ({
          ...prev,
          coins: userParams?.coins.value,
          energy: userParams?.energy.value,
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
    loadModel();
    if (!user) return;
    setInitialSlide(getRankData(user?.experience)?.id - 1);
    chooseBehaviour();
  }, [isUserLoading, user]);

  useEffect(() => {
    if (!user) return;
    const currentRank = getRankData(user?.experience);
    const maxCapacity = currentRank?.energyCapacity;
    const energyPerSecond = currentRank?.recoveryRate;
    // TODO: move to backend
    addEnergy(
      //   @ts-ignore
      user.user_parameters?.energy.value,
      //   @ts-ignore
      user.user_parameters?.energy.last_update,
      user?.id,
      maxCapacity,
      energyPerSecond,
    ).then((energy) => {
      setUserStats((prev) => ({ ...prev, energy }));
    });
  }, [user]);

  if (isUserLoading || !userParams || !userStats) return <div>Loading...</div>;
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/*<FullscreenCanvas />*/}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={numberOfPieces}
      />
      <div className="flex grow flex-col justify-between">
        <div>
          <div className="mb-[32px] p-[8px]">
            <p className="flex w-full items-center justify-center gap-[8px] text-center text-[42px] font-bold leading-[52px] text-white">
              {/*TODO: use image instead*/}
              <span className="text-[32px]">🟡</span>{" "}
              <span>{userParams?.coins.value}</span>
            </p>
            <p className="flex w-full items-center justify-center gap-[8px] text-center text-[20px] text-slate-400">
              +{currentRankData.passive_coins} монет в час
            </p>
          </div>
          {initialSlide !== null && (
            <Slider {...settings} initialSlide={initialSlide}>
              {ranks.map((rank, index) => {
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
            {/*<span>150,000/150,000</span>*/}
          </div>
          <div className="flex gap-[4px]">
            <Image src={saved as any} alt="boost" />
            <span>Буст</span>
          </div>
        </div>
      </div>
      <Link href="/pre-jump" className="mb-[8px] px-[16px]">
        <Button disabled={currentEnergy < 0} iconLeft={play as any}>
          Начать прыжки
        </Button>
      </Link>
    </div>
  );
};

export default Main;
