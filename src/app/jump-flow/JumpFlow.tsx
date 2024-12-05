"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import {
  detectHips,
  drawVideoFrame2,
  getStatusText,
  requestWithRetry,
  secondsToMinutesString,
  setMoveVector,
} from "./utils";
import useCountdown from "@/hooks/useCountDown";
import Image from "next/image";
import arrow from "@/app/_assets/icons/ArrowDown.svg";
import energy from "@/app/_assets/icons/Energy-primary.svg";
import Link from "next/link";
import useGetUser from "@/hooks/api/useGetUser";
import { twMerge } from "tailwind-merge";
import useTimer from "@/hooks/api/useTimer";
import Reward from "@/app/jump-flow/Reward";
import { StoreContext } from "@/components/Root/Root";
import { Title } from "@/components/Title";
import { getRankData } from "@/utils";
import Button from "@/components/Button";
import { useRewards } from "@/hooks/api/useRewards";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useQueryClient } from "react-query";
import { Database } from "@/types/database.types";
import { User } from "@supabase/supabase-js";
import CoinsFirework from "@/components/CoinsFirework/CoinsFirework";

const constraints = {
  video: true,
  width: { ideal: 360 }, // Set ideal width (e.g., 640px)
  height: { ideal: 640 },
};

const energyPerJump = 100;

const JumpFlow = () => {
  const { store } = useContext(StoreContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef<any>(store.detector);
  const [flowStatus, setFlowStatus] = useState("initial"); // initial, searchHips, stayStill, countDown, jump, end
  const [moveVectorY, setMoveVectorY] = useState({
    prevValue: 0,
    currentVector: 0,
    standStill: false,
  }); // vector of movement
  const [hipsVisible, setHipsVisible] = useState(false); // hips are visible
  const [cameraReady, setCameraReady] = useState(false); // set to false to disable camera and model
  const [appReady, setAppReady] = useState(false); // set to false to disable camera and model
  const [jumpState, setJumpState] = useState("down");
  const [jumpsCounter, setJumpsCounter] = useState(0);
  const [availableEnergy, setAvailableEnergy] = useState<number>(0);
  const statusText = getStatusText(flowStatus);
  // @ts-ignore
  const { user, isUserLoading } = useGetUser<UserWithParameters>();
  // @ts-ignore
  const currentRankData = getRankData(user?.experience);
  const queryClient = useQueryClient();
  const calculateRewards = useRewards();
  const coinsFireworkRef = useRef<any>(null);
  const [lastJumpPosition, setLastJumpPosition] = React.useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (isUserLoading) return;
    // @ts-ignore
    setAvailableEnergy(user?.user_parameters?.energy?.value || 0);
  }, [isUserLoading]);

  const { currentSeconds, stop: stopTimer, start: startTimer } = useTimer();
  const { seconds, startCountDown, stopCountDown, isRunning } = useCountdown();
  const {
    seconds: secondsUntilReward,
    startCountDown: startRewardCountdown,
    stopCountDown: stopRewardCountdown,
    isRunning: isRewardRunning,
  } = useCountdown();

  const getRandomTopPosition = () => {
    const x = Math.random() * window.innerWidth;
    const y = 0;

    return { x, y };
  };

  const detectUpAndDown = (vector: any) => {
    if (vector > 5 && jumpState === "down") {
      if (availableEnergy < energyPerJump) {
        setFlowStatus("endCountdown");
        stopTimer();
        startRewardCountdown();
        return;
      }
      setJumpState("up");
      setJumpsCounter((prev) => prev + 1);
      setAvailableEnergy((prev) => prev - energyPerJump);

      // Trigger coins animation at random border position
      const position = getRandomTopPosition();
      setLastJumpPosition(position);
      if (coinsFireworkRef.current) {
        coinsFireworkRef.current.triggerAnimation(position.x, position.y, {
          min: 10,
          max: 20,
        });
      }
    }
    if (vector < 0 && jumpState === "up") {
      setJumpState("down");
    }
  };

  // const loadModel = async () => {
  //     if(!store.detector) return detectorRef.current = store.detector
  //     // else {
  //     //     const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
  //     //     await requestWithRetry(async () => await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig))
  //     //     detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
  //     // }
  // };

  const setupCamera = async () => {
    const video: any = videoRef.current;
    const stream = await navigator?.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    setCameraReady(true);
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  };

  const stopCamera = () => {
    const video: any = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      // Stop all media tracks (audio and video)
      stream.getTracks().forEach((track) => {
        track.stop(); // Stop each track completely
      });
      // Clear the video element's source and pause playback
      video.srcObject = null;
      video.pause();
      video.removeAttribute("src"); // Clear any lingering src reference
      video.load(); // Reload the video element to reset
    } else {
      console.warn("No active camera stream found.");
    }
  };

  const mainLoop = async () => {
    const video: any = videoRef.current;
    const canvas: any = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (detectorRef.current && video.readyState === 4) {
      drawVideoFrame2(ctx, video, canvas);
      const poses = await detectorRef.current.estimatePoses(video);
      setMoveVector(poses[0]?.keypoints, setMoveVectorY);
      const hipsVisible = detectHips(poses);
      setHipsVisible(hipsVisible);
    }
  };

  useEffect(() => {
    detectorRef.current = store.detector;
  }, [store.detector]);
  // init camera and model
  useEffect(() => {
    setFlowStatus("loadingCamera");
    setupCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (videoRef.current.srcObject && detectorRef.current) {
      setFlowStatus("searchHips");
      setAppReady(true);
    }
  }, [cameraReady, detectorRef.current]);

  useEffect(() => {
    const intervalId = setInterval(mainLoop, 50);
    const canvas = canvasRef.current;
    if (canvas) {
      // @ts-ignore
      canvas.width = window.innerWidth;
      // @ts-ignore
      canvas.height = window.innerHeight;
    }
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // track hips and stillness
  useEffect(() => {
    if (flowStatus === "jump" || !appReady || flowStatus.includes("end"))
      return;
    if (!hipsVisible) {
      setFlowStatus("searchHips");
      stopCountDown();
      return;
    }
    //  && !moveVectorY.standStill
    // if (hipsVisible) {
    //   setFlowStatus("stayStill");
    //   stopCountDown();
    //   return;
    // }
    // && moveVectorY.standStill
    if (hipsVisible && !isRunning) {
      setFlowStatus("countDown");
      startCountDown();
      return;
    }
    // && moveVectorY.standStill
    if (hipsVisible && seconds === 0) {
      setFlowStatus("jump");
      startTimer();
      return;
    }
  }, [hipsVisible, moveVectorY.standStill, seconds, isRunning, flowStatus]);

  useEffect(() => {
    const jumpStarted = flowStatus === "jump";
    if (!jumpStarted) return;
    detectUpAndDown(moveVectorY.currentVector);
  }, [moveVectorY.currentVector, flowStatus]);

  useEffect(() => {
    if (
      flowStatus === "endCountdown" &&
      secondsUntilReward === 0 &&
      isRewardRunning
    ) {
      setFlowStatus("end");
      stopRewardCountdown();
    }
  }, [flowStatus, secondsUntilReward, isRewardRunning]);

  // const handleSessionComplete = async () => {
  //   if (!user) return;

  //   try {
  //     const rewards = await calculateRewards.mutateAsync({
  //       userExperience: user.experience,
  //       jumpCount: jumpsCounter,
  //       perfectJumps: 0,
  //       comboMultiplier: 1,
  //     });

  //     // Update user parameters
  //     const { error } = await supabase
  //       .from("user_parameters")
  //       .update({
  //         "coins.value": user.user_parameters.coins.value + rewards.coins,
  //         "energy.value":
  //           user.user_parameters.energy.value - rewards.energyCost,
  //       })
  //       .eq("user_id", user.id);

  //     if (error) throw error;

  //     // Update user experience separately
  //     await supabase
  //       .from("users")
  //       .update({
  //         experience: user.experience + rewards.experience,
  //       })
  //       .eq("id", user.id);

  //     // Invalidate user query to refresh data
  //     queryClient.invalidateQueries("user");

  //     toast.success("Награды получены!");
  //   } catch (error) {
  //     console.error("Error updating rewards:", error);
  //     toast.error("Ошибка при получении наград");
  //   }
  // };

  return (
    <div
      className={twMerge(
        "fixed left-0 top-0 h-full w-full bg-background-dark",
        isRewardRunning && "animate-fade",
      )}
    >
      <CoinsFirework ref={coinsFireworkRef} />
      {flowStatus !== "end" && flowStatus !== "jump" && (
        <Link href="/" className="block">
          <button className="relative z-50 rotate-90 rounded-full p-[20px] text-white transition active:bg-slate-900">
            <Image src={arrow as any} alt="arrow-down" width={24} height={24} />
          </button>
        </Link>
      )}
      {flowStatus === "jump" && (
        <Button
          className="fixed bottom-[32px] left-1/2 z-10 w-[200px] -translate-x-1/2"
          variant="secondary"
          onClick={() => {
            setFlowStatus("endCountdown");
            stopTimer();
            startRewardCountdown();
          }}
        >
          <span className="block h-[16px] w-[16px] rounded-[4px] bg-background-dark"></span>
          <span>Забрать награду</span>
        </Button>
      )}
      <div className="absolute left-1/2 top-[240px] z-50 w-full -translate-x-1/2">
        <Title>{statusText}</Title>
        {isRunning && seconds > 0 && <Title>Старт через {seconds}</Title>}
      </div>
      {flowStatus === "jump" && (
        <div className="absolute left-1/2 top-[72px] z-50 w-full -translate-x-1/2">
          <h1 className="flex items-center justify-center text-[54px] font-bold text-white">
            {secondsToMinutesString(currentSeconds)}
          </h1>
          <div className="-ml-[32px] mb-[80px] flex items-center justify-center text-[32px] font-bold text-primary">
            <Image height={32} src={energy as any} alt="energy" />
            {availableEnergy}/{currentRankData.energyCapacity}
          </div>
          <h1 className="flex items-center justify-center text-[140px] leading-[120px] text-white">
            {jumpsCounter}
          </h1>
        </div>
      )}
      {flowStatus === "end" && (
        <Reward
          energyLeft={availableEnergy}
          jumps={jumpsCounter}
          time={currentSeconds}
        />
      )}
      {/*{<Reward jumps={jumpsCounter} time={currentSeconds} />}*/}
      <video ref={videoRef} autoPlay playsInline className="hidden"></video>
      <canvas
        ref={canvasRef}
        className="absolute left-1/2 top-0 h-[100vh] w-full -translate-x-1/2 -scale-x-100 opacity-50"
      ></canvas>
    </div>
  );
};

export default JumpFlow;
