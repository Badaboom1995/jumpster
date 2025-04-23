"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import {
  detectHips,
  getStatusText,
  requestWithRetry,
  setMoveVector,
} from "./utils";
import useCountdown from "@/hooks/useCountDown";
import Image from "next/image";
import arrow from "@/app/_assets/icons/ArrowDown.svg";
import energy from "@/app/_assets/icons/Energy-black.svg";
import Link from "next/link";
import useGetUser from "@/hooks/api/useGetUser";
import { twMerge } from "tailwind-merge";
import Reward from "@/app/jump-flow/Reward";
import { StoreContext } from "@/components/Root/Root";
import { Title } from "@/components/Title";
import { getRankData } from "@/utils";
import Button from "@/components/Button";
import coinBag from "@/app/_assets/audio/coin.mp3";
import finishSound from "@/app/_assets/audio/done.wav";
import Lottie from "lottie-react";
import loader from "@/app/_assets/loader.json";
import eye from "@/app/_assets/lottie/eye.json";
import * as amplitude from "@amplitude/analytics-browser";
import { useSound } from "@/hooks/useSound";
import CoinsFireworkPixie from "@/components/CoinsFireworkPixie";
const energyPerJump = 100;
const FPS = 24;
const FRAME_TIME = 1000 / FPS;

const JumpFlow = () => {
  const { store, setStore } = useContext(StoreContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef<any>(store.detector);
  const [flowStatus, setFlowStatus] = useState("initial"); // initial, searchHips, stayStill, countDown, jump, end
  const [moveVectorY, setMoveVectorY] = useState({
    prevValue: 0,
    currentVector: 0,
    standStill: false,
  }); // vector of movement
  // finish sound
  const { playSound: playFinishSound } = useSound(finishSound);
  const { playSound: playCoinSound } = useSound(coinBag);
  const [hipsVisible, setHipsVisible] = useState(false); // hips are visible
  const [cameraReady, setCameraReady] = useState(false); // set to false to disable camera and model
  const [appReady, setAppReady] = useState(false); // set to false to disable camera and model
  const [jumpState, setJumpState] = useState("down");
  const [jumpsCounter, setJumpsCounter] = useState(0);
  const [starJumpingTime, setStarJumpingTime] = useState<any>(null);
  const [availableEnergy, setAvailableEnergy] = useState<number>(0);
  const statusText = getStatusText(flowStatus);
  // @ts-ignore
  const { user, isUserLoading } = useGetUser<UserWithParameters>();
  // @ts-ignore
  const currentRankData = getRankData(user?.experience);
  // const coinsFireworkRef = useRef<any>(null);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    if (isUserLoading) return;
    // @ts-ignore
    setAvailableEnergy(user?.user_parameters?.energy?.value || 0);
  }, [isUserLoading]);

  // const { currentSeconds, stop: stopTimer, start: startTimer } = useTimer();
  const { seconds, startCountDown, stopCountDown, isRunning } = useCountdown();
  const {
    seconds: secondsUntilReward,
    startCountDown: startRewardCountdown,
    stopCountDown: stopRewardCountdown,
    isRunning: isRewardRunning,
  } = useCountdown();

  // const getRandomTopPosition = () => {
  //   const x = Math.random() * window.innerWidth;
  //   const y = 0;
  //   return { x, y };
  // };

  // const getRandomCoinParams = () => {
  //   return {
  //     count: {
  //       min: Math.floor(Math.random() * 5) + 8, // Random between 8-12
  //       max: Math.floor(Math.random() * 10) + 15, // Random between 15-24
  //     },
  //     size: {
  //       min: Math.floor(Math.random() * 15) + 30, // Random between 30-44px
  //       max: Math.floor(Math.random() * 20) + 45, // Random between 45-64px
  //     },
  //   };
  // };

  const loadModel = async () => {
    if (store.detector) return;
    await tf.ready();
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      modelUrl: "./movenet_lightning/model.json",
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

  const detectUpAndDown = (vector: any) => {
    if (vector > 10 && jumpState === "down") {
      if (availableEnergy < energyPerJump) {
        setFlowStatus("endCountdown");
        startRewardCountdown();
        playFinishSound();
        return;
      }

      setJumpState("up");
      setJumpsCounter((prev) => prev + 1);
      setAvailableEnergy((prev) => prev - energyPerJump);
    }
    if (vector < 0 && jumpState === "up") {
      playCoinSound();
      setJumpState("down");
    }
  };

  const setupCamera = async () => {
    const video: any = videoRef.current;
    console.log("start");
    const constraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 15, max: 30 },
      },
      audio: false,
    };
    const stream = await navigator?.mediaDevices.getUserMedia(constraints);
    setCameraReady(true);
    video.srcObject = stream;
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  };

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      // Stop all tracks
      stream.getTracks().forEach((track) => track.stop());
      // Detach the stream from the video element
      video.srcObject = null;
      video.pause();
      video.load();
    } else {
      console.warn("No active camera stream found.");
    }
  };

  const mainLoop = async () => {
    const video: any = videoRef.current;
    if (detectorRef.current && video.readyState === 4) {
      const poses = await detectorRef.current.estimatePoses(video);
      setMoveVector(poses[0]?.keypoints, setMoveVectorY);
      const hipsVisible = detectHips(poses);
      setHipsVisible(hipsVisible);
    }
  };

  useEffect(() => {
    amplitude.track("JumpFlow_Start");
    let lastFrameTime = 0;
    let animationFrameId: number;
    if (!detectorRef.current) {
      loadModel();
    }
    const animate = async (timestamp: number) => {
      if (timestamp - lastFrameTime >= FRAME_TIME) {
        await mainLoop();
        lastFrameTime = timestamp;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start the animation loop
    animationFrameId = requestAnimationFrame(animate);

    // Set canvas dimensions
    const canvas = canvasRef.current;
    if (canvas) {
      // @ts-ignore
      canvas.width = window.innerWidth;
      // @ts-ignore
      canvas.height = window.innerHeight;
    }

    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

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
      amplitude.track("JumpFlow_Camera_Ready");
      setFlowStatus("searchHips");
      setAppReady(true);
    }
  }, [cameraReady, detectorRef.current]);

  // track hips and stillness
  useEffect(() => {
    if (flowStatus === "jump" || !appReady || flowStatus.includes("end"))
      return;
    if (!hipsVisible) {
      setFlowStatus("searchHips");
      amplitude.track("JumpFlow_Hips_Not_Visible");
      stopCountDown();
      return;
    }
    if (hipsVisible && !isRunning) {
      setFlowStatus("countDown");
      startCountDown();
      amplitude.track("JumpFlow_Countdown_Start");
      return;
    }
    // && moveVectorY.standStill
    if (hipsVisible && seconds === 0) {
      setFlowStatus("jump");
      setStarJumpingTime(new Date());
      amplitude.track("JumpFlow_Jump_Start");
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
      amplitude.track("JumpFlow_End");
      stopRewardCountdown();
      setTimeout(stopCamera, 1000);
    }
  }, [flowStatus, secondsUntilReward, isRewardRunning]);

  const handleJumpingFinished = () => {
    amplitude.track("JumpFlow_Jump_Finished");
    setFlowStatus("endCountdown");
    startRewardCountdown();
    playFinishSound();
  };
  // Add new state for tracking loading time
  const [showLoadingNote, setShowLoadingNote] = useState(false);

  // Add useEffect to handle slow loading notification
  useEffect(() => {
    if (flowStatus === "loadingCamera") {
      const timer = setTimeout(() => {
        amplitude.track("JumpFlow_Loading_Note_Show");
        setShowLoadingNote(true);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowLoadingNote(false);
    }
  }, [flowStatus]);

  // Add this useEffect to simulate loading progress
  useEffect(() => {
    if (flowStatus === "loadingCamera" && loadingProgress === 0) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = prev > 94 ? prev : prev + Math.random() * 5;
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    } else if (cameraReady && detectorRef.current) {
      setLoadingProgress(100);
    }
  }, [flowStatus, cameraReady]);

  return (
    <div
      className={twMerge(
        "fixed left-0 top-0 h-full w-full",
        isRewardRunning && "animate-fade",
      )}
    >
      {/* <CoinsFireworkPixie /> */}
      <div className="flex w-full pt-[16px]">
        {flowStatus !== "end" && flowStatus !== "jump" && (
          <Link href="/" className="block">
            <button className="relative z-50 rotate-90 rounded-full p-[20px] text-white transition active:bg-slate-900">
              <Image
                src={arrow as any}
                alt="arrow-down"
                width={24}
                height={24}
              />
            </button>
          </Link>
        )}
      </div>
      {/* Spotify Widget */}
      <div
        className={twMerge(
          "fixed bottom-[100px] right-1/2 z-50 translate-x-1/2 transition-all duration-300",
          // flowStatus === "jump" && "translate-y-[calc(100%+16px)]",
          isPlayerOpen ? "w-[360px]" : "w-[48px] cursor-pointer",
        )}
        onClick={() => !isPlayerOpen && setIsPlayerOpen(true)}
      >
        <div className={twMerge("rounded-full p-3", !isPlayerOpen && "hidden")}>
          <button
            className="absolute -top-8 right-0 p-2 text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlayerOpen(false);
            }}
          >
            Close
          </button>
          <iframe
            width="360"
            height="200"
            style={{
              borderRadius: "12px",
              width: "100%",
              margin: "0 auto",
            }}
            src="https://www.youtube.com/embed/oNMevWPa0Ms?si=pM5wKEn5bfXtVUT1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        <div
          className={twMerge(
            "rounded-full bg-white p-3",
            isPlayerOpen && "hidden",
          )}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
      <div
        className={twMerge(
          "fixed left-0 top-0 flex h-[100vh] w-full bg-background-dark bg-opacity-70 transition-opacity duration-1000 ease-out",
          flowStatus !== "searchHips" && "opacity-0",
        )}
      >
        <div className="absolute left-1/2 top-[300px] z-50 w-full -translate-x-1/2 -translate-y-1/2">
          {/* <div className="mx-auto w-[200px]">
            <Lottie width={35} height={35} animationData={eye} loop={true} />
          </div> */}
          <p className="w-full text-center text-[24px] text-white">
            Встаньте в кадр
          </p>
        </div>
      </div>

      {flowStatus === "jump" && (
        <div className="fixed bottom-[32px] left-1/2 z-50 flex w-[200px] w-full -translate-x-1/2 justify-center px-[12px]">
          <Button
            className="mx-[12px]"
            variant="secondary"
            onClick={handleJumpingFinished}
          >
            <span className="block h-[16px] w-[16px] rounded-[4px] bg-background-dark"></span>
            <span>Забрать награду</span>
          </Button>
        </div>
      )}
      {statusText === "Загрузка..." && (
        <div className="absolute left-1/2 top-[100px] z-10 z-50 h-[calc(100vh-100px)] w-full -translate-x-1/2">
          <div className="h-full">
            <div className="flex h-full w-full flex-col items-start justify-center gap-[0px] pb-[24px]">
              {/* <div className="mt-[36px] grow">
                <Lottie
                  width={75}
                  height={75}
                  animationData={loader}
                  loop={true}
                  className="mb-[24px]"
                />
              </div> */}
              <Title className="mb-[8px] text-center text-[16px]">
                Загрузка...
              </Title>
              <div className="mb-[8px] w-full px-[24px]">
                <div className="h-2 w-full rounded-full bg-background-dark">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <div className="mt-2 text-center text-sm text-gray-300">
                  {Math.round(loadingProgress)}%
                </div>
              </div>
              {showLoadingNote && (
                <p className="mt-2 w-full px-[24px] text-center text-sm text-gray-300">
                  Загрузка может занять некоторое время, пожалуйста, не
                  прерывайте процесс
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {isRunning && seconds > 0 && (
        <div className="fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2">
          <h1 className="flex items-center justify-center text-[140px] font-black leading-[120px] text-white">
            {seconds}
          </h1>
        </div>
      )}
      {flowStatus === "jump" && (
        <div className="tr absolute left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-[80%]">
          <h1 className="flex items-center justify-center text-[140px] font-black leading-[120px] text-white">
            {jumpsCounter}
          </h1>
        </div>
      )}
      {flowStatus === "end" && (
        <Reward
          energyLeft={availableEnergy}
          jumps={jumpsCounter}
          time={(new Date().getTime() - starJumpingTime.getTime()) / 1000}
        />
      )}
      <video
        ref={videoRef}
        className={twMerge(
          "fixed left-1/2 top-0 -z-10 h-[100vh] -translate-x-1/2 scale-x-[-1] opacity-70 transition-opacity duration-300 ease-out",
          flowStatus === "loadingCamera" && "opacity-0",
        )}
        autoPlay
        playsInline
      ></video>
      <canvas
        ref={canvasRef}
        className="absolute left-1/2 top-0 h-[100vh] w-full -translate-x-1/2 -scale-x-100 opacity-50"
      ></canvas>
      <div className="fixed left-0 right-0 top-0 z-50">
        {flowStatus === "jump" && (
          <div className="h-[24px] w-full bg-background-dark">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{
                width: `${(availableEnergy / currentRankData.energyCapacity) * 100}%`,
              }}
            />
            <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
              <Image src={energy as any} alt="energy" width={16} height={16} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JumpFlow;
