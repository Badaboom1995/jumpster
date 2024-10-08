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
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
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
        return () => {
            clearInterval(intervalId)
        };
    }, []);


    return (
        <div>
            <div>
                <video ref={videoRef} autoPlay playsInline className='h-[50vh] hidden'></video>
                <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    className='border border-4 border-red-500 -scale-x-[1'>
                </canvas>
            </div>
        </div>
    );
};

export default JumpFlow;