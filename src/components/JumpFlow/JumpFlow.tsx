'use client'
import React, {PropsWithChildren, useEffect, useRef, useState} from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
import {
    detectHips,
    drawPoses2,
    drawVideoFrame2, getStatusText,
    requestWithRetry,
    setMoveVector
} from "@/components/JumpFlow/utils";
import useCountdown from "@/hooks/useCountDown";

const constraints = {
    video: true
}

const Title = ({children}: PropsWithChildren) => {
    return (
        <p className="text-[48px] font-bold leading-[56px] text-white text-center">{children}</p>
    )
}

const JumpFlow = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const detectorRef = useRef<any>(null);
    const [flowStatus, setFlowStatus] = useState('initial');
    const [moveVectorY, setMoveVectorY] = useState({prevValue: 0, currentVector: 0, standStill: false});
    const [hipsVisible, setHipsVisible] = useState(false);
    const [appReady, setAppReady] = useState(false);
    const [jumpState, setJumpState] = useState('down');
    const [jumpsCounter, setJumpsCounter] = useState(0);
    const status = getStatusText(flowStatus);

    const {seconds, startCountDown, stopCountDown, isRunning} = useCountdown()

    const detectUpAndDown = (vector: any) => {
        if(vector > 10 && jumpState === 'down'){
            setJumpState('up');
            setJumpsCounter((prev) => prev + 1);
        }
        if(vector < 0 && jumpState === 'up'){
            setJumpState('down');
        }
    }

    const loadModel = async () => {
        const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
        await requestWithRetry(async () => await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig))
        detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    };

    const setupCamera = async () => {
        const video: any = videoRef.current;
        const stream = await navigator?.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;

        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    };

    const mainLoop = async () => {
        const video: any = videoRef.current;
        const canvas: any = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (detectorRef.current && video.readyState === 4) {
            drawVideoFrame2(ctx, video, canvas);
            const poses = await detectorRef.current.estimatePoses(video);
            setMoveVector(poses[0]?.keypoints, setMoveVectorY);
            const hipsVisible = detectHips(poses)
            setHipsVisible(hipsVisible)
        }
    };
    // init camera and model
    useEffect(() => {
        const init = async () => {
            await tf.ready()
            setFlowStatus('loadingModel');
            await loadModel();
            setFlowStatus('loadingCamera');
            await setupCamera();
            setFlowStatus('searchHips');
            setAppReady(true);
        };
        init()
    }, []);

    // run main loop
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
        if(flowStatus === 'jump' || !appReady) return
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
            return
        }
    }, [hipsVisible, moveVectorY.standStill, seconds, isRunning, flowStatus]);

    useEffect(() => {
        const jumpStarted = flowStatus === 'jump';
        if(!jumpStarted) return;
        detectUpAndDown(moveVectorY.currentVector)
    }, [moveVectorY.currentVector, flowStatus])

    return (
        <div className="relative w-full h-full fixed top-0 left-0 bg-slate-800">
                <div className='absolute top-[100px] left-1/2 -translate-x-1/2 z-50'>
                    <Title>{status}</Title>
                    {isRunning && seconds > 0 && <Title>Start in  {seconds}</Title>}
                    {flowStatus === 'jump' && <Title>{jumpsCounter}</Title>}
                </div>
                <video ref={videoRef} autoPlay playsInline className='hidden'></video>
                <canvas
                    ref={canvasRef}
                    className='absolute top-0 left-1/2 -translate-x-1/2 h-[100vh] w-full -scale-x-100 opacity-80'>
                </canvas>
        </div>
    );
};

export default JumpFlow;