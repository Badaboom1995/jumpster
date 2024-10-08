'use client'
import React, {useEffect, useRef, useState} from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';

const constraints = {
    video: true
}
const JumpFlow = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const detectorRef = useRef<any>(null);

    const loadModel = async () => {
        const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
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
            const videoAspectRatio = video.videoWidth / video.videoHeight;
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const canvasAspectRatio = canvasWidth / canvasHeight;

            let drawWidth, drawHeight, offsetX, offsetY;

            // Adjust draw size and position to maintain aspect ratio
            if (canvasAspectRatio > videoAspectRatio) {
                drawHeight = canvasHeight;
                drawWidth = canvasHeight * videoAspectRatio;
                offsetX = (canvasWidth - drawWidth) / 2;
                offsetY = 0;
            } else {
                drawWidth = canvasWidth;
                drawHeight = canvasWidth / videoAspectRatio;
                offsetX = 0;
                offsetY = (canvasHeight - drawHeight) / 2;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
        }
    };

    useEffect(() => {
        const runPoseDetection = async () => {
            await tf.ready()
            await loadModel();
            await setupCamera();
        };
        runPoseDetection()
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
        <div className="w-full h-full fixed top-0 left-0">
                <video ref={videoRef} autoPlay playsInline className='hidden'></video>
                <canvas
                    ref={canvasRef}
                    className='border border-4 border-red-500 h-[100vh] w-full'>
                </canvas>
        </div>
    );
};

export default JumpFlow;