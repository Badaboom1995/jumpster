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
import energy from "@/app/_assets/icons/Energy-black.svg";
import Link from "next/link";
import useGetUser from "@/hooks/api/useGetUser";
import { twMerge } from "tailwind-merge";
import Reward from "@/app/jump-flow/Reward";
import { StoreContext } from "@/components/Root/Root";
import { Title } from "@/components/Title";
import { getRankData } from "@/utils";
import Button from "@/components/Button";
import { useRewards } from "@/hooks/api/useRewards";
import { useQueryClient } from "react-query";
import CoinsFirework from "@/components/CoinsFirework/CoinsFirework";
import coinBag from "@/app/_assets/audio/coin.mp3";
import finishSound from "@/app/_assets/audio/done.wav";
import Lottie from "lottie-react";
import loader from "@/app/_assets/loader.json";
const energyPerJump = 100;

const FPS = 24;
const FRAME_TIME = 1000 / FPS;

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
  const [starJumpingTime, setStarJumpingTime] = useState<any>(null);
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
  const [isMuted, setIsMuted] = useState(false);

  // 1. Lazy initialize the audio pools only when needed
  const [coinAudioPool, setCoinAudioPool] = useState<HTMLAudioElement[]>([]);
  const [finishAudioPool, setFinishAudioPool] = useState<HTMLAudioElement[]>(
    [],
  );

  // Initialize pools only when the game starts
  useEffect(() => {
    if (flowStatus === "jump") {
      // Initialize only if not already done
      if (coinAudioPool.length === 0) {
        setCoinAudioPool(
          Array(3)
            .fill(null)
            .map(() => {
              const audio = new Audio(coinBag);
              audio.volume = 0.2;
              return audio;
            }),
        );
      }

      if (finishAudioPool.length === 0) {
        setFinishAudioPool(
          Array(2)
            .fill(null)
            .map(() => {
              const audio = new Audio(finishSound);
              audio.volume = 0.2;
              return audio;
            }),
        );
      }
    }
  }, [flowStatus]);

  // 2. Clean up audio pools when game ends
  useEffect(() => {
    if (flowStatus === "end") {
      // Clean up audio instances
      coinAudioPool.forEach((audio) => {
        audio.src = "";
        audio.load();
      });
      finishAudioPool.forEach((audio) => {
        audio.src = "";
        audio.load();
      });

      setCoinAudioPool([]);
      setFinishAudioPool([]);
    }
  }, [flowStatus]);

  // Add index trackers for the pools
  const [currentCoinAudioIndex, setCurrentCoinAudioIndex] = useState(0);
  const [currentFinishAudioIndex, setCurrentFinishAudioIndex] = useState(0);

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

  const getRandomTopPosition = () => {
    const x = Math.random() * window.innerWidth;
    const y = 0;

    return { x, y };
  };

  const getRandomCoinParams = () => {
    return {
      count: {
        min: Math.floor(Math.random() * 5) + 8, // Random between 8-12
        max: Math.floor(Math.random() * 10) + 15, // Random between 15-24
      },
      size: {
        min: Math.floor(Math.random() * 15) + 30, // Random between 30-44px
        max: Math.floor(Math.random() * 20) + 45, // Random between 45-64px
      },
    };
  };

  const detectUpAndDown = (vector: any) => {
    if (vector > 10 && jumpState === "down") {
      if (availableEnergy < energyPerJump) {
        setFlowStatus("endCountdown");
        startRewardCountdown();
        // Fix finish sound playback here too
        const audio = finishAudioPool[currentFinishAudioIndex];
        if (audio) {
          audio.currentTime = 0;
          audio
            .play()
            .catch((error) => console.warn("Audio playback failed:", error));
          setCurrentFinishAudioIndex(
            (prev) => (prev + 1) % finishAudioPool.length,
          );
        }
        return;
      }

      setJumpState("up");
      setJumpsCounter((prev) => prev + 1);
      setAvailableEnergy((prev) => prev - energyPerJump);

      // Play coin sound using pool
      const audio2 = new Audio(coinBag);
      audio2.play();
      const audio = coinAudioPool[currentCoinAudioIndex];
      // @ts-ignore
      if (audio && !audio.playing) {
        audio.currentTime = 0;
        audio
          .play()
          .catch((error) => console.warn("Audio playback failed:", error));
        setCurrentCoinAudioIndex((prev) => (prev + 1) % coinAudioPool.length);
      }
    }
    if (vector < 0 && jumpState === "up") {
      // Get random parameters for coins
      const coinParams = getRandomCoinParams();

      // Trigger coins animation at random border position
      const position = getRandomTopPosition();
      setLastJumpPosition(position);

      if (coinsFireworkRef.current) {
        coinsFireworkRef.current.triggerAnimation(
          position.x,
          position.y,
          {
            min: 1,
            max: 1,
          },
          { min: 1, max: 1 },
        );
      }
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
    const canvas: any = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (detectorRef.current && video.readyState === 4) {
      // drawVideoFrame2(ctx, video, canvas);
      const poses = await detectorRef.current.estimatePoses(video);
      setMoveVector(poses[0]?.keypoints, setMoveVectorY);
      const hipsVisible = detectHips(poses);
      setHipsVisible(hipsVisible);
    }
  };

  useEffect(() => {
    let lastFrameTime = 0;
    let animationFrameId: number;

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
    console.log(cameraReady, detectorRef.current);
    // @ts-ignore
    if (videoRef.current.srcObject && detectorRef.current) {
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
      stopCountDown();
      return;
    }
    if (hipsVisible && !isRunning) {
      setFlowStatus("countDown");
      startCountDown();
      return;
    }
    // && moveVectorY.standStill
    if (hipsVisible && seconds === 0) {
      setFlowStatus("jump");
      setStarJumpingTime(new Date());
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
      setTimeout(stopCamera, 1000);
    }
  }, [flowStatus, secondsUntilReward, isRewardRunning]);

  // Update the mute effect
  useEffect(() => {
    coinAudioPool.forEach((audio) => {
      if (audio) audio.muted = isMuted;
    });
    finishAudioPool.forEach((audio) => {
      if (audio) audio.muted = isMuted;
    });
  }, [isMuted]);

  const handleJumpingFinished = () => {
    setFlowStatus("endCountdown");
    startRewardCountdown();

    // Fix the finish sound playback
    const audio = finishAudioPool[currentFinishAudioIndex];
    if (audio) {
      audio.currentTime = 0;
      audio
        .play()
        .catch((error) => console.warn("Audio playback failed:", error));
      setCurrentFinishAudioIndex((prev) => (prev + 1) % finishAudioPool.length);
    }
  };

  // Add new state for tracking loading time
  const [showLoadingNote, setShowLoadingNote] = useState(false);

  // Add useEffect to handle slow loading notification
  useEffect(() => {
    if (flowStatus === "loadingCamera") {
      const timer = setTimeout(() => {
        setShowLoadingNote(true);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowLoadingNote(false);
    }
  }, [flowStatus]);

  return (
    <div
      className={twMerge(
        "fixed left-0 top-0 h-full w-full",
        isRewardRunning && "animate-fade",
      )}
    >
      <CoinsFirework ref={coinsFireworkRef} />
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
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="fixed right-[12px] top-[32px] z-50 h-[32px] min-w-[32px] rounded-[8px] border border-background-dark bg-background-dark bg-opacity-50 text-white transition"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
      {flowStatus === "jump" && (
        <div className="fixed bottom-[32px] left-1/2 z-10 flex w-[200px] w-full -translate-x-1/2 justify-center px-[12px]">
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
      {/* temp */}
      <div className="absolute left-1/2 top-[200px] z-50 w-full -translate-x-1/2">
        <Title>
          {statusText === "Загрузка..." ? (
            <div className="flex w-full flex-col items-center justify-center gap-[16px]">
              <span className="">Загрузка...</span>
              <Lottie
                width={100}
                height={100}
                animationData={loader}
                loop={true}
              />
              {showLoadingNote && (
                <span className="mt-2 text-sm text-gray-300">
                  Загрузка может занять некоторое время, пожалуйста, не
                  прерывайте процесс
                </span>
              )}
            </div>
          ) : (
            statusText
          )}
        </Title>
        {isRunning && seconds > 0 && <Title>Старт через {seconds}</Title>}
      </div>
      {flowStatus === "jump" && (
        <div className="tr absolute left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-[60%]">
          {/* <h1 className="flex items-center justify-center text-[54px] font-bold text-white">
            {secondsToMinutesString(currentSeconds)}
          </h1> */}
          {/* <div className="-ml-[32px] mb-[80px] flex items-center justify-center text-[32px] font-bold text-primary">
            <Image height={32} src={energy as any} alt="energy" />
            {availableEnergy}/{currentRankData.energyCapacity}
          </div> */}
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
          "fixed left-1/2 top-0 -z-10 h-[100vh] -translate-x-1/2 opacity-70 transition-opacity duration-300 ease-out",
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
                // boxShadow:
                //   "0 0 10px rgb(34 197 94), 0 0 20px rgb(34 197 94), inset 0 0 8px rgba(255,255,255,0.4)",
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
