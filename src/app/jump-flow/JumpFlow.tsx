'use client'
import React, {PropsWithChildren, useContext, useEffect, useRef, useState} from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import {
    detectHips,
    drawVideoFrame2, getStatusText,
    requestWithRetry, secondsToMinutesString,
    setMoveVector
} from "./utils";
import useCountdown from "@/hooks/useCountDown";
import Image from "next/image";
import arrow from '@/app/_assets/icons/ArrowDown.svg'
import energy from '@/app/_assets/icons/Energy-primary.svg'
import Link from "next/link";
import useGetUser from "@/hooks/api/useGetUser";
import {twMerge} from "tailwind-merge";
import useTimer from "@/hooks/api/useTimer";
import Reward from "@/app/jump-flow/Reward";
import {StoreContext} from "@/components/Root/Root";

const constraints = {
    video: true
}

export const Title = ({children, className}: PropsWithChildren & {className?: string}) => {
    return (
        <p className={twMerge('w-full text-[40px] font-bold leading-[48px] text-white text-center', className)}>{children}</p>
    )
}

const energyPerJump = 100;

const JumpFlow = () => {
    const {store} = useContext(StoreContext)
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const detectorRef = useRef<any>(store.detector);
    const [flowStatus, setFlowStatus] = useState('initial'); // initial, searchHips, stayStill, countDown, jump, end
    const [moveVectorY, setMoveVectorY] = useState({prevValue: 0, currentVector: 0, standStill: false}); // vector of movement
    const [hipsVisible, setHipsVisible] = useState(false); // hips are visible
    const [cameraReady, setCameraReady] = useState(false); // set to false to disable camera and model
    const [appReady, setAppReady] = useState(false); // set to false to disable camera and model
    const [jumpState, setJumpState] = useState('down');
    const [jumpsCounter, setJumpsCounter] = useState(0);
    const [availableEnergy, setAvailableEnergy] = useState<number>(0);
    const statusText = getStatusText(flowStatus);
    const {user, isUserLoading} = useGetUser()

    useEffect(() => {
        if(isUserLoading) return
        // @ts-ignore
        setAvailableEnergy(user?.user_parameters.energy.value || 0)
    }, [isUserLoading]);

    const {currentSeconds, stop: stopTimer, start: startTimer} = useTimer()
    const {seconds, startCountDown, stopCountDown, isRunning} = useCountdown()
    const {seconds: secondsUntilReward, startCountDown: startRewardCountdown, stopCountDown: stopRewardCountdown, isRunning: isRewardRunning } = useCountdown()

    const detectUpAndDown = (vector: any) => {
        if(vector > 5 && jumpState === 'down'){
            if(availableEnergy < energyPerJump) {
                setFlowStatus('endCountdown')
                stopTimer()
                startRewardCountdown()
                return
            }
            setJumpState('up');
            setJumpsCounter((prev) => prev + 1);
            setAvailableEnergy(prev => prev - energyPerJump)
        }
        if(vector < 0 && jumpState === 'up'){
            setJumpState('down');
        }
    }

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
        setCameraReady(true)
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
                track.stop();  // Stop each track completely
            });
            // Clear the video element's source and pause playback
            video.srcObject = null;
            video.pause();
            video.removeAttribute('src');  // Clear any lingering src reference
            video.load();  // Reload the video element to reset
        } else {
            console.warn('No active camera stream found.');
        }
    };


    const mainLoop = async () => {
        const video: any = videoRef.current;
        const canvas: any = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (detectorRef.current && video.readyState === 4){
            drawVideoFrame2(ctx, video, canvas);
            const poses = await detectorRef.current.estimatePoses(video);
            setMoveVector(poses[0]?.keypoints, setMoveVectorY);
            const hipsVisible = detectHips(poses)
            setHipsVisible(hipsVisible)
        }
    };
    useEffect(() => {
        detectorRef.current = store.detector
    }, [store.detector]);
    // init camera and model
    useEffect(() => {
        setFlowStatus('loadingCamera');
        setupCamera();
        return () => {
            stopCamera()
        }
    }, []);

    useEffect(() => {
        console.log('init', videoRef, detectorRef.current, cameraReady)
        // @ts-ignore
        if(videoRef.current.srcObject && detectorRef.current){
            setFlowStatus('searchHips');
            setAppReady(true);
        }
    }, [cameraReady, detectorRef.current])

    useEffect(() => {
        const intervalId = setInterval(mainLoop, 50)
        const canvas = canvasRef.current;
        if (canvas) {
            // @ts-ignore
            canvas.width = window.innerWidth
            // @ts-ignore
            canvas.height = window.innerHeight;
        }
        return () => {
            clearInterval(intervalId)
        };
    }, []);
    // track hips and stillness
    useEffect(() => {
        if(flowStatus === 'jump' || !appReady || flowStatus.includes('end'))return
        if(!hipsVisible){
            setFlowStatus('searchHips');
            stopCountDown()
            return
        }
        if(hipsVisible && !moveVectorY.standStill){
            setFlowStatus('stayStill')
            stopCountDown()
            return
        }
        if(hipsVisible && moveVectorY.standStill && !isRunning){
            setFlowStatus('countDown')
            startCountDown()
            return
        }
        if(hipsVisible && moveVectorY.standStill && seconds === 0){
            setFlowStatus('jump')
            startTimer()
            return
        }
    }, [hipsVisible, moveVectorY.standStill, seconds, isRunning, flowStatus]);

    useEffect(() => {
        const jumpStarted = flowStatus === 'jump';
        if(!jumpStarted) return;
        detectUpAndDown(moveVectorY.currentVector)
    }, [moveVectorY.currentVector, flowStatus])

    useEffect(() => {
        if(flowStatus === 'endCountdown' && secondsUntilReward === 0 && isRewardRunning){
            setFlowStatus('end')
            stopRewardCountdown()
        }
    }, [flowStatus, secondsUntilReward, isRewardRunning]);

    return (
        <div className={twMerge("w-full h-full fixed top-0 left-0 bg-background-dark", availableEnergy < 50 && !flowStatus.includes('end')&& 'animate-pulse', isRewardRunning && 'animate-fade')}>
            {flowStatus !== 'end' && <Link href='/' className='block'>
                <button
                    className='relative z-50 rotate-90 p-[20px] text-white transition active:bg-slate-900 rounded-full'>
                    <Image src={arrow as any} alt='arrow-down' width={24} height={24}/>
                </button>
            </Link>}
            <div className='absolute top-[240px] w-full left-1/2 -translate-x-1/2 z-50'>
                <Title>{statusText}</Title>
                {isRunning && seconds > 0 && <Title>Старт через {seconds}</Title>}
            </div>
            {flowStatus === 'jump' &&
                <div className='absolute top-[72px] w-full left-1/2 -translate-x-1/2 z-50'>
                    <h1 className='flex items-center justify-center text-[54px] text-white font-bold'>{secondsToMinutesString(currentSeconds)}</h1>
                    <div className='flex items-center justify-center text-primary mb-[80px] -ml-[32px] text-[32px] font-bold'><Image height={32} src={energy as any} alt='energy'/>{availableEnergy}/{user?.max_energy}</div>
                    <h1 className='flex items-center justify-center text-white text-[140px] leading-[120px]'>{jumpsCounter}</h1>
                </div>
            }
            {flowStatus === 'end' && <Reward jumps={jumpsCounter} time={currentSeconds}/>}
            <video ref={videoRef} autoPlay playsInline className='hidden'></video>
            <canvas
                ref={canvasRef}
                className='absolute top-0 left-1/2 -translate-x-1/2 h-[100vh] w-full -scale-x-100 opacity-50'>
            </canvas>
        </div>
    );
};

export default JumpFlow;