// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core'; // Import TensorFlow.js
import {  drawPoses, drawVideoFrame, startCamera} from "@/components/JumpFlow/utils";
// import useCountdown from "@/hooks/useCountDown"; // Import the WebGL backend

const VideoCanvas = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const detectorRef = useRef(null);

    // const [flowStarted, setFlowStarted] = useState(false);
    // const [hipsDetected, setHipsDetected] = useState(false);
    // const [moveVectorY, setMoveVectorY] = useState({prevValue: 0, currentVector: 0, standStill: false});
    // const {isRunning, seconds, startCountDown, stopCountDown} = useCountdown();
    // const [jumpStarted, setJumpStarted] = useState(false);
    // const [jumpState, setJumpState] = useState<'up' | 'down'>('down');
    // const [jumpsCounter, setJumpsCounter] = useState(0);
    // const [modelLoaded, setModelLoaded] = useState(false);
    // const [cameraStarted, setCameraStarted] = useState(false);

    // const detectUpAndDown = (vector: any) => {
    //     if(vector > 10 && jumpState === 'down'){
    //         setJumpState('up');
    //         setJumpsCounter((prev) => prev + 1);
    //     }
    //     if(vector < 0 && jumpState === 'up'){
    //         setJumpState('down');
    //     }
    // }

    const loadModel = async () => {
        const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
        // @ts-ignore
        detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    };

    // const setMoveVector = (keypoints: any) => {
    //     if(!keypoints) return;
    //     const leftHip = keypoints.find((keypoint: any) => keypoint.name === 'left_hip');
    //     const rightHip = keypoints.find((keypoint: any) => keypoint.name === 'right_hip');
    //     const avgHipY = (leftHip.y + rightHip.y) / 2;
    //     setMoveVectorY((prev) => {
    //         if(prev.prevValue === 0) return {prevValue: avgHipY, currentVector: 0, standStill: false};
    //         const diff = prev.prevValue - avgHipY;
    //         let gravity = 0;
    //         const vector = prev.currentVector;
    //         if (vector > 0 && vector < 10) gravity = -0.2;
    //         if (vector < 0 && vector > -10) gravity = 0.2;
    //         if (vector > 10) gravity = -0.5;
    //         if (vector < -10) gravity = 0.5;
    //         const nextValue = vector + diff + gravity;
    //         // don't change vector if the difference is less than 5
    //         if(Math.abs(prev.currentVector - nextValue) < 5){
    //             return {prevValue: prev.prevValue, currentVector:prev.currentVector + gravity, standStill: Math.abs(prev.currentVector + gravity) < 10};
    //         }
    //         return {prevValue: avgHipY, currentVector:nextValue, standStill: Math.abs(nextValue) < 10};
    //     });
    // }

    const processVideoFrame = async () => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        // @ts-ignore
        const context = canvasElement.getContext('2d');
        // @ts-ignore
        if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            const { offsetX, offsetY, scale } = drawVideoFrame(context, videoElement, canvasElement);
            if (detectorRef.current) {
                const poses = await detectorRef.current.estimatePoses(videoElement);
                // const moveVector = setMoveVector(poses[0]?.keypoints);
                drawPoses(poses, context, offsetX, offsetY, scale);
            }
        }
        requestAnimationFrame(processVideoFrame);
    };

    const initialize = async () => {
        await tf.ready(); // Wait for TensorFlow.js to be ready
        await tf.setBackend('webgl'); // Ensure WebGL backend is set up
        await loadModel();
        await startCamera(videoRef.current);
        videoRef.current.addEventListener('loadedmetadata', () => {
            canvasRef.current.width = canvasRef.current.offsetWidth;
            canvasRef.current.height = canvasRef.current.offsetHeight;
            processVideoFrame();
            // setFlowStarted(true);
        });
    };

    useEffect(() => {
        initialize();
    }, []);

    // Track hips once the flow has started
    // useEffect(() => {
    //     if(!flowStarted) return
    //     let interval;
    //     const videoElement = videoRef.current;
    //     interval = setInterval(async () => {
    //         if(!videoElement) return;
    //         const poses = await detectorRef.current.estimatePoses(videoElement);
    //         const hipsFound = detectHips(poses);
    //         if(hipsFound){
    //             setHipsDetected(true);
    //         } else {
    //             setHipsDetected(false);
    //         }
    //     }, 1000);
    //     return () => clearInterval(interval);
    // }, [flowStarted]);
    //
    // // Start countdown if hips detected and user is standing still
    // useEffect(() => {
    //     if(hipsDetected && moveVectorY.standStill && !jumpStarted){
    //         startCountDown();
    //     } else {
    //         stopCountDown();
    //     }
    // }, [hipsDetected, moveVectorY.standStill, jumpStarted]);
    //
    // useEffect(() => {
    //     if(seconds === 0){
    //         setJumpStarted(true);
    //     }
    // }, [seconds, moveVectorY.prevValue]);
    //
    // useEffect(() => {
    //     if(!jumpStarted) return;
    //     detectUpAndDown(moveVectorY.currentVector)
    // }, [moveVectorY.currentVector, jumpStarted])

    // ${hipsDetected && Math.abs(moveVectorY.currentVector) < 10 && isRunning && "animate-flash"}`}
    return (
        <div className={`w-full h-full overflow-scroll fixed top-0 left-0 z-50 bg-slate-800`}>
            <video ref={videoRef} />
            <canvas ref={canvasRef} className="w-full h-full -scale-x-100" />
             {/*<div className="absolute top-[24px] left-1/2 -translate-x-1/2 text-white p-4">*/}
             {/*    <p className='text-[48px] font-bold text-center'>*/}
             {/*        {!flowStarted && <span>Подготовка...</span>}*/}
             {/*        {!jumpStarted && flowStarted && !hipsDetected && <span>Встаньте в кадр</span>}*/}
             {/*        {!jumpStarted && hipsDetected && !moveVectorY.standStill && <span>Стойте спокойно</span>}*/}
             {/*        {!jumpStarted && hipsDetected && moveVectorY.standStill && !jumpStarted && <span>Прыгайте через <p className='text-[80px] text-center'>{seconds}</p></span>}*/}
             {/*        {jumpStarted && <span className='text-[200px]'>{jumpsCounter}</span>}*/}
             {/*    </p>*/}
             {/*</div>*/}
        </div>
    );
};

export default VideoCanvas;
