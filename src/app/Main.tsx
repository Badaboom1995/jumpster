"use client";
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
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
  setOnboardingDone,
  updateStreak,
} from "@/utils";

import coin from "@/app/_assets/images/coin.png";
import clickSound from "@/app/_assets/audio/click.wav";

import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { requestWithRetry } from "@/app/jump-flow/utils";
import { StoreContext, supabase } from "@/components/Root/Root";
import { useRouter, useSearchParams } from "next/navigation";

import "./main.css";

import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import useTimer from "@/hooks/useTimer";
import Character from "@/components/Character";
import Header from "@/components/Header";
import usePassiveIncome from "@/hooks/usePassiveIncome";
import useCurrentCoinsReward from "@/hooks/useCurrentCoinsReward";
import { useQueryClient } from "react-query";
import CoinsFirework, {
  CoinsFireworkRef,
} from "@/components/CoinsFirework/CoinsFirework";
import coinSound from "@/app/_assets/audio/collect.mp3";

import arrow from "@/app/_assets/icons/arrowRight.svg";

type StatsProps = {
  coins: number;
  energy: number;
  experience: number;
};

const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger a slide change

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const currentCoinsReward = useCurrentCoinsReward(user);
  const passive_income = usePassiveIncome();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentRankData = getRankData(userStats?.experience);
  const currentLevelProgress = currentRankData?.percent;
  const currentEnergy = userStats?.energy;
  const currentCharacterImage = currentRankData?.url;

  const coinsFireworkRef = useRef<CoinsFireworkRef>(null);

  const [isClaimingCoins, setIsClaimingCoins] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const [tiltAngle, setTiltAngle] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(null); // Reset touchEnd
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      setTouchEnd(e.touches[0].clientX);

      if (touchStart) {
        const diff = touchStart - e.touches[0].clientX;
        // Convert swipe distance to a tilt angle, max ±15 degrees
        const newTiltAngle = Math.max(Math.min(diff / 10, 15), -15);
        setTiltAngle(newTiltAngle);
      }
    },
    [touchStart],
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    }

    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
    setTiltAngle(0); // Reset tilt angle
  }, [touchStart, touchEnd]);

  useEffect(() => {
    audioRef.current = new Audio(coinSound);
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
      // Preload the audio
      audioRef.current.load();
    }
  }, []);

  const handleClaimCoins = async (event: React.MouseEvent) => {
    if (isClaimingCoins) return; // Prevent multiple clicks

    try {
      setIsClaimingCoins(true);
      // Start both sound and animation simultaneously
      const playPromise = audioRef.current?.play();
      coinsFireworkRef.current?.triggerAnimation(
        event.clientX,
        event.clientY,
        { min: 3, max: 5 },
        {
          min: 1,
          max: 1,
        },
      );

      // Reset audio position
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }

      // Handle any audio play errors silently
      if (playPromise) {
        playPromise.catch((error) => {
          console.warn("Audio playback failed:", error);
        });
      }

      await addCoins(user);
      await queryClient.invalidateQueries("user");
    } catch (e) {
      console.log(e);
    } finally {
      setIsClaimingCoins(false);
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
    if (!objectSearchParams || objectSearchParams.onboarding_done) {
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
    if (
      user &&
      // @ts-ignore
      !user?.onboarding_done &&
      !objectSearchParams?.onboarding_done
    ) {
      router.push("/onboarding");
    }
    loadModel();
    if (!user) return;
    // @ts-ignore
    const currentRankId = getRankData(user?.experience)?.id - 1;
    setCurrentSlide(currentRankId);
    chooseBehaviour();
  }, [isUserLoading, user]);

  useEffect(() => {
    if (!user) return;
    // TODO: move to backend
    if (objectSearchParams?.onboarding_done) {
      setOnboardingDone(user);
    }
    addEnergy(user).then((energy) => {
      setUserStats((prev) => ({ ...prev, energy }));
    });
    updateStreak(user).then(() => {
      queryClient.invalidateQueries("user");
    });
  }, [user]);

  // @ts-ignore
  if (
    !user ||
    isUserLoading ||
    !userParams ||
    !userStats ||
    // @ts-ignore
    (!user?.onboarding_done && !objectSearchParams?.onboarding_done)
  )
    return null;

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : ranks.length - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev < ranks.length - 1 ? prev + 1 : 0));
  };

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
      <div className="flex grow flex-col">
        <div className="mb-[12px] flex w-full items-start justify-between p-[12px]">
          {/* username */}
          <button
            className="rounded-[12px] bg-background px-2 py-1 text-[14px] font-semibold text-white"
            onClick={async () => {
              // set onboarding done to false
              await supabase
                .from("users")
                .update({
                  onboarding_done: false,
                  jump_onboarding_done: false,
                })
                .eq("id", user?.id);
            }}
          >
            {/* @ts-ignore */}
            {/* @ts-ignore */}@{user?.username}
          </button>
          <span className="flex flex-col items-end text-[24px] font-semibold text-white">
            <div className="flex items-center gap-1">
              <Image
                src={coin as any}
                alt="coin"
                width={30}
                height={30}
                className="h-[30px] w-[30px]"
              />
              {userStats.coins?.toLocaleString()}
            </div>
            <span className="text-[14px] text-[#8D9398]">
              + {passive_income} в час
            </span>
          </span>
        </div>
        {/*  */}
        <div
          className="relative flex grow flex-col items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={handlePrevSlide}
            className="absolute left-0 z-10 h-[40vh] rotate-180 rounded-full p-2 opacity-30 transition-all duration-100 active:bg-background"
          >
            <Image src={arrow} alt="Previous" width={24} height={24} />
          </button>
          {ranks.map((rank, index) => {
            if (index !== currentSlide) return null;
            // @ts-ignore
            const rankId = getRankData(user?.experience)?.id;
            const isCurrent = rankId === rank.id;
            return (
              <Character
                key={rank.id}
                tiltAngle={tiltAngle}
                current={isCurrent}
                locked={rank.id > rankId}
                progressLevel={isCurrent ? currentLevelProgress : 0}
                runAnimation={runAnimation}
                rankImage={isCurrent ? currentCharacterImage : rank.url}
                rankName={
                  // @ts-ignore
                  isCurrent ? getRankData(user?.experience)?.name : rank.name
                }
                passive_income={rank.passive_coins}
              />
            );
          })}
          <button
            onClick={handleNextSlide}
            className="absolute right-0 z-10 h-[40vh] rounded-full p-2 opacity-30 transition-all duration-100 active:bg-background"
          >
            <Image src={arrow} alt="Next" width={24} height={24} />
          </button>
        </div>
        <div className="mb-[8px] flex justify-between px-[16px] font-semibold text-white">
          <div className="flex items-center gap-[4px]">
            <div className="relative ml-[-6px]">
              {currentEnergy < currentRankData?.energyCapacity && (
                <div
                  className="absolute inset-0 left-[7px] top-[4px] z-0 h-[10px] w-[2px] animate-pulseLight rounded-full opacity-90"
                  style={{ transform: "scale(1.5)" }}
                />
              )}
              <Image
                width={16}
                height={16}
                src={energy as any}
                alt="energy"
                className="relative z-10 h-[16px] w-[16px]"
              />
            </div>
            <span>
              {Math.ceil(currentEnergy) || 0}/{currentRankData?.energyCapacity}
            </span>
          </div>
          <Link
            href="/boosters"
            className="flex items-center gap-[4px]"
            onClick={() => {
              const audio = new Audio(clickSound);
              audio.play();
            }}
          >
            <Image src={saved as any} alt="boost" />
            <span>Буст</span>
          </Link>
        </div>
      </div>
      <div className="mb-[12px] px-[16px]">
        {currentCoinsReward ? (
          <Button
            onClick={handleClaimCoins}
            variant="secondary"
            disabled={isClaimingCoins}
            className={isClaimingCoins ? "animate-pulse" : ""}
          >
            {isClaimingCoins ? (
              "Загрузка..."
            ) : (
              <div className="flex gap-[2px]">
                <span className="mr-[4px]">Забрать</span>
                <Image src={coin as any} width={28} height={28} alt="coin" />
                {currentCoinsReward}
              </div>
            )}
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
