export {};
// 'use client'
// import React, {useEffect, useRef, useState} from 'react';
// import * as poseDetection from '@tensorflow-models/pose-detection';
// import * as tf from '@tensorflow/tfjs-core';
// // Register one of the TF.js backends.
// import '@tensorflow/tfjs-backend-webgl';
// import {eye} from "@tensorflow/tfjs-core";
//
// const Typography = ({children}: any) => <p className='text-[48px] leading-[60px] font-bold'>{children}</p>
// const constraints = {
//     video: true
// }
// const JumpFlow = () => {
//     const videoRef = useRef(null);
//     const canvasRef = useRef(null);
//     const detectorRef = useRef<any>(null);
//     const [jumpCount, setJumpCount] = useState(0); // State to keep track of jump count
//     const [isUp, setIsUp] = useState(false);
//     const [isReady, setIsReady] = useState(false);
//     const [hipsInView, setHipsInView] = useState(false);
//     const [hipsVerticalVector, setHipsVerticalVector] = useState({prevValue: 0, currentVector: 0});
//     const [startCounter, setStartCounter] = useState(0);
//     const [jumpAnchor, setJumpAnchor] = useState<number | null>(null);
//     const [eyesInView, setEyesInView] = useState(false);
//     const [caps, setCaps] = useState({width: 0, height: 0});
//
//     const loadModel = async () => {
//         const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
//         detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
//     };
//
//     async function getCameraCapabilities() {
//         try {
//             // Request access to the camera with minimal constraints
//             const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//
//             // Get the video track from the stream
//             const videoTrack = stream.getVideoTracks()[0];
//
//             // Get the capabilities of the video track
//             const capabilities = videoTrack.getCapabilities();
//
//             console.log('Camera capabilities:', capabilities);
//             setCaps({width: capabilities.width.max, height: capabilities.height.max})
//
//             // Stop the video track since we don't need to render the video yet
//             videoTrack.stop();
//         } catch (error) {
//             console.error('Error accessing camera:', error);
//         }
//     }
//
//     const setupCamera = async () => {
//         const video: any = videoRef.current;
//         const stream = await navigator?.mediaDevices.getUserMedia(constraints);
//         video.srcObject = stream;
//
//         return new Promise((resolve) => {
//             video.onloadedmetadata = () => {
//                 resolve(video);
//             };
//         });
//     };
//
//     const detectJump = (pose: any) => {
//         if (!pose) return
//         const left = pose.keypoints.find((point: any) => point.name === 'left_hip');
//         const right = pose.keypoints.find((point: any) => point.name === 'right_hip');
//         if (left.score > 0.5 && right.score > 0.5) {
//             const avgAnkleY = (left.y + right.y) / 2; // Average y position of both ankles
//             if(!jumpAnchor) return
//             if (jumpAnchor - avgAnkleY > 10 && !isUp) {
//                 setJumpCount(prevState => prevState + 1)
//                 setIsUp(prevState => true)
//             }
//             if (jumpAnchor - avgAnkleY < 10) {
//                 setIsUp(prevState => false)
//             }
//         }
//     }
//
//     const getBgColor = (vector: number) => {
//         if (!eyesInView) return 'rgb(0,0,20)'
//         const absVector = Math.abs(vector) // absolute value of vector from 0 to 100
//         const colorRGBdefault = [0, 0, 20] // rgb color of default background
//         // color gets darker when vector less and lighter when vector more
//         const colorRGB = colorRGBdefault.map((color, index) => {
//             const result = color + absVector
//             return result
//         })
//         return `rgb(${colorRGB.join(',')})`
//     }
//
//     const drawKeyPoints = (pose: any, ctx: any) => {
//         pose?.keypoints.forEach((keypoint: any, index: any) => {
//             if (keypoint.score > 0.3) {
//                 ctx.beginPath();
//                 ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
//                 if (index === 11 || index === 12) {
//                     ctx.fillStyle = 'red';
//                 } else {
//                     ctx.fillStyle = 'blue';
//                 }
//                 ctx.fill();
//             }
//         });
//     }
//
//     const getEyes = (pose: any) => {
//         const left = pose?.keypoints.find((point: any) => point.name === 'left_hip');
//         const right = pose?.keypoints.find((point: any) => point.name === 'right_hip');
//         return {left, right}
//     }
//
//     const checkEyes = (pose: any, benchmark: any) => {
//         const {left, right} = getEyes(pose)
//         if (left?.score > benchmark && right?.score > benchmark) {
//             setEyesInView(true)
//         } else {
//             setEyesInView(false)
//         }
//     }
//
//     const getHips = (pose: any) => {
//         const left = pose?.keypoints.find((point: any) => point.name === 'left_hip');
//         const right = pose?.keypoints.find((point: any) => point.name === 'right_hip');
//         return {left, right}
//     }
//
//     const checkHips = (pose:any, benchmark: any) => {
//         const {left, right} = getHips(pose)
//         if (left?.score > benchmark && right?.score > benchmark) {
//             setHipsInView(true)
//         } else {
//             setHipsInView(false)
//         }
//     }
//
//     const updateVerticalVector = (y: number) => {
//         if (!hipsVerticalVector.prevValue) {
//             setHipsVerticalVector({prevValue: y, currentVector: 0})
//             return
//         }
//         const getGravity = (vector: number) => {
//             if (vector > 0 && vector < 15) return -0.5
//             if (vector < 0 && vector > -15) return 0.5
//             if (vector > 15) return -3
//             if (vector < -15) return 3
//             return 0
//         }
//         const diff = hipsVerticalVector.prevValue - y
//         setHipsVerticalVector({
//             prevValue: y,
//             currentVector: hipsVerticalVector.currentVector + diff + getGravity(hipsVerticalVector.currentVector)
//         })
//     }
//
//     const mainLoop = async () => {
//         const video: any = videoRef.current;
//         const canvas: any = canvasRef.current;
//         const ctx = canvas.getContext('2d');
//         if (detectorRef.current && video.readyState === 4) {
//             const poses: any = await detectorRef.current.estimatePoses(video);
//             // Clear canvas
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//             ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//             drawKeyPoints(poses[0], ctx)
//             checkHips(poses[0], 0.7)
//             if (hipsInView && !jumpAnchor) {
//                 const {left, right} = getHips(poses[0])
//                 const avgY = (left.y + right.y) / 2
//                 updateVerticalVector(avgY)
//             }
//             if (jumpAnchor) {
//                 detectJump(poses[0])
//             }
//         }
//     };
//
//     useEffect(() => {
//         getCameraCapabilities()
//     }, []);
//
//     useEffect(() => {
//         if(!caps) return
//         const runPoseDetection = async () => {
//             await tf.ready()
//             await loadModel();
//             await setupCamera();
//             setIsReady(true)
//         };
//         runPoseDetection()
//     }, [caps]);
//
//     useEffect(() => {
//         const intervalId = setInterval(mainLoop, 50)
//         return () => {
//             clearInterval(intervalId)
//         };
//     }, [hipsInView, hipsVerticalVector, isUp, jumpAnchor]);
//
//     useEffect(() => {
//         if (jumpAnchor) return
//         if (startCounter === 59) {
//             setJumpAnchor(hipsVerticalVector.prevValue)
//         }
//         if (!hipsInView || startCounter > 59) {
//             setStartCounter(0)
//             return
//         }
//         if (Math.abs(hipsVerticalVector.currentVector) < 7) {
//             setStartCounter(prevState => prevState + 1)
//         } else if (startCounter > 0) {
//             setStartCounter(0)
//         }
//     }, [hipsInView, hipsVerticalVector.currentVector]);
//
//     const getCounter = (counter: number) => {
//         let one, two, three
//         const activeClass = 'text-[#D2FA63] opacity-1'
//         if(Math.ceil(counter / 20) === 1)  one = activeClass
//         if(Math.ceil(counter / 20) === 2)  two = activeClass
//         if(Math.ceil(counter / 20) === 3)  three = activeClass
//         return (<div className='flex justify-center gap-4'>
//             <span className={`${one} text-[80px]`}>1</span>
//             <span className={`${two} text-[80px]`}>2</span>
//             <span className={`${three} text-[80px]`}>3</span>
//         </div>)
//     }
//
//     return (
//         <div
//             // style={{
//             //     background: getBgColor(hipsVerticalVector.currentVector)
//             // }}
//             className='h-[100vh]'
//             >
//             <div>
//                 <video ref={videoRef} autoPlay playsInline className='h-[50vh] hidden'></video>
//                 <canvas
//                     ref={canvasRef}
//                     // style={{width: config.width, height: config.height}}
//                     width={1920}
//                     height={1920}
//                     className='border border-4 border-red-500 -scale-x-[1'>
//                 </canvas>
//                 {/*{videoRef.current.videoHeight} {videoRef.current.videoWidth}*/}
//                 {/*{!jumpAnchor && !hipsInView && <Typography>Stand so <br/> you can see <span className='text-[#D2FA63]'>your hips</span></Typography>}*/}
//                 {/*{!jumpAnchor && hipsInView && Math.abs(hipsVerticalVector.currentVector) > 7 &&*/}
//                 {/*    <Typography>Choose your <span className='text-[#D2FA63]'>position</span> and stand still</Typography>}*/}
//                 {/*{!jumpAnchor && hipsInView && Math.abs(hipsVerticalVector.currentVector) <= 7 &&*/}
//                 {/*    <Typography><p className='mb-[16px]'>Start jumping in</p> {getCounter(startCounter)}</Typography>}*/}
//                 {/*{jumpAnchor && <Typography><p className='mb-[32px]'>Jump!</p></Typography>}*/}
//                 {/*{jumpAnchor && <Typography><p className='text-[80px] text-[#D2FA63]'>{jumpCount}</p></Typography>}*/}
//             </div>
//             {/*<div className='absolute left-1/2 -translate-x-1/2'>*/}
//                 {/*<video ref={videoRef} autoPlay playsInline ></video>*/}
//                 {/*<canvas ref={canvasRef} style={{width: config.width, height: config.height}} width={config.width} height={config.height} className='border border-black'></canvas>*/}
//             {/*</div>*/}
//         </div>
//     );
// };
//
// export default JumpFlow;