'use client'
import React, {useEffect, useRef, useState} from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
import {
    drawPoses,
    drawPoses2,
    drawVideoFrame,
    drawVideoFrame2,
    requestWithRetry,
    setMoveVector
} from "@/components/JumpFlow/utils";

const constraints = {
    video: true
}
const JumpFlow = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const detectorRef = useRef<any>(null);
    const [loadingStatus, setLoadingStatus] = useState('initial');
    const [moveVectorY, setMoveVectorY] = useState({prevValue: 0, currentVector: 0, standStill: false});

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
            // const {offsetX, offsetY, scale} = drawVideoFrame(ctx, video, canvas);
            const {sx, sy, scale, sWidth, sHeight} = drawVideoFrame2(ctx, video, canvas);
            const poses = await detectorRef.current.estimatePoses(video);
            setMoveVector(poses[0]?.keypoints, setMoveVectorY);
            drawPoses2(poses, ctx, sx, sy, sWidth, sHeight, canvas.width, canvas.height);
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'initial':
                return 'Загрузка...';
            case 'loadingModel':
                return 'Настраиваем нейросети...';
            case 'loadingCamera':
                return 'Настраиваем камеру...';
            case 'running':
                return 'Настройка завершена!';
            default:
                return '';
        }
    }

    useEffect(() => {
        const init = async () => {
            await tf.ready()
            setLoadingStatus('loadingModel');
            await loadModel();
            setLoadingStatus('loadingCamera');
            await setupCamera();
            setLoadingStatus('running');
        };
        init()
    }, []);

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

    return (
        <div className="relative w-full h-full fixed top-0 left-0">
                {getStatusText(loadingStatus)}
                {moveVectorY.currentVector}
                <video ref={videoRef} autoPlay playsInline className='hidden'></video>
                <canvas
                    ref={canvasRef}
                    className='absolute top-0 left-1/2 -translate-x-1/2 border-4 border-red-500 h-[100vh] w-full'>
                </canvas>
        </div>
    );
};

export default JumpFlow;