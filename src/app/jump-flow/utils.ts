
// export const drawPoses = (poses: any, context: any, offsetX: any, offsetY: any, scale: any) => {
//     poses.forEach((pose: any) => {
//         const keypoints = pose.keypoints;
//         // Draw keypoints as blue dots
//         keypoints.forEach((keypoint: any) => {
//             if (keypoint.score > 0.3) {
//                 const { x, y } = keypoint;
//                 context.beginPath();
//                 context.arc(x * scale + offsetX, y * scale + offsetY, 5, 0, 2 * Math.PI);
//                 context.fillStyle = '#D2FA63';
//                 context.fill();
//             }
//         });
//     });
// };
//
// const drawMarker = (context: any, keypoint: any, offsetX: any, offsetY: any, scale: any) => {
//     context.beginPath();
//     context.arc(keypoint.x * scale + offsetX, keypoint.y * scale + offsetY, 5, 0, 2 * Math.PI);
//     context.fillStyle = '#D2FA63';
//     context.fill();
// };

export const detectHips = (poses: any) => {
    let leftHipDetected = false;
    let rightHipDetected = false;

    poses.forEach((pose: any) => {
        const keypoints = pose.keypoints;
        const leftHip = keypoints.find((keypoint: any) => keypoint.name === 'left_hip');
        const rightHip = keypoints.find((keypoint: any) => keypoint.name === 'right_hip');

        // Check if hips are detected and draw markers
        if (leftHip && leftHip.score > 0.3) {
            leftHipDetected = true;
            // drawMarker(context, leftHip, offsetX, offsetY, scale);
        }

        if (rightHip && rightHip.score > 0.3) {
            rightHipDetected = true;
            // drawMarker(context, rightHip, offsetX, offsetY, scale);
        }
    });

    return leftHipDetected && rightHipDetected;
};

export const secondsToMinutesString = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function calculateCaloriesBurned(jumps: number, timeInSeconds: number): number {
    const MET = 11.8; // MET for moderate skipping rope pace
    const timeInMinutes = timeInSeconds / 60;
    const averageJumpsPerMinute = jumps / timeInMinutes;

    // Using the standard calorie burning formula
    const caloriesPerMinute = (MET * 3.5 * 68) / 200; // Assuming 68kg as a baseline weight
    const totalCaloriesBurned = caloriesPerMinute * timeInMinutes;

    return totalCaloriesBurned;
}


// Start the camera stream
// export const startCamera = async (video: any) => {
//     try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         video.srcObject = stream;
//         video.play();
//     } catch (err) {
//         console.error('Error accessing camera:', err);
//     }
// };

// export const drawVideoFrame = (context: any, videoElement: any, canvasElement: any) => {
//     const videoAspectRatio = videoElement.videoWidth / videoElement.videoHeight;
//     const canvasWidth = canvasElement.width;
//     const canvasHeight = canvasElement.height;
//     const canvasAspectRatio = canvasWidth / canvasHeight;
//
//     let drawWidth, drawHeight, offsetX, offsetY;
//
//     // Adjust draw size and position to maintain aspect ratio
//     if (canvasAspectRatio > videoAspectRatio) {
//         drawHeight = canvasHeight;
//         drawWidth = canvasHeight * videoAspectRatio;
//         offsetX = (canvasWidth - drawWidth) / 2;
//         offsetY = 0;
//     } else {
//         drawWidth = canvasWidth;
//         drawHeight = canvasWidth / videoAspectRatio;
//         offsetX = 0;
//         offsetY = (canvasHeight - drawHeight) / 2;
//     }
//
//     // Clear canvas and draw video frame
//     context.clearRect(0, 0, canvasWidth, canvasHeight);
//     context.drawImage(videoElement, offsetX, offsetY, drawWidth, drawHeight);
//
//     return { offsetX, offsetY, scale: drawWidth / videoElement.videoWidth };
// };
//
// export const drawPoses2 = (
//     poses: any,
//     context: any,
//     sx: number,
//     sy: number,
//     sWidth: number,
//     sHeight: number,
//     canvasWidth: number,
//     canvasHeight: number
// ) => {
//     poses.forEach((pose: any) => {
//         const keypoints = pose.keypoints;
//         keypoints.forEach((keypoint: any) => {
//             if (keypoint.score > 0.3) {
//                 const { x, y } = keypoint;
//
//                 // Map the keypoint coordinates to the canvas
//                 const canvasX = ((x - sx) / sWidth) * canvasWidth;
//                 const canvasY = ((y - sy) / sHeight) * canvasHeight;
//
//                 context.beginPath();
//                 context.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
//                 context.fillStyle = '#D2FA63';
//                 context.fill();
//             }
//         });
//     });
// };

export const drawVideoFrame2 = (context: any, videoElement: any, canvasElement: any) => {
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    const canvasWidth = canvasElement.width;
    const canvasHeight = canvasElement.height;

    const videoAspectRatio = videoWidth / videoHeight;
    const canvasAspectRatio = canvasWidth / canvasHeight;

    let sx, sy, sWidth, sHeight;

    if (videoAspectRatio > canvasAspectRatio) {
        // Video is wider than canvas; crop the sides
        sHeight = videoHeight;
        sWidth = sHeight * canvasAspectRatio;
        sx = (videoWidth - sWidth) / 2;
        sy = 0;
    } else {
        // Video is taller than canvas; crop the top and bottom
        sWidth = videoWidth;
        sHeight = sWidth / canvasAspectRatio;
        sx = 0;
        sy = (videoHeight - sHeight) / 2;
    }

    // Clear canvas and draw the video frame
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(
        videoElement,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        canvasWidth,
        canvasHeight
    );

    // Optionally, return values if needed for further processing
    return { sx, sy, sWidth, sHeight, scale: canvasWidth / sWidth };
};


export const setMoveVector = (keypoints: any, setVector: any) => {
    if(!keypoints) return;
    const leftHip = keypoints.find((keypoint: any) => keypoint.name === 'left_hip');
    const rightHip = keypoints.find((keypoint: any) => keypoint.name === 'right_hip');
    // if(!(leftHip.score > 0.5) || !(rightHip > 0.5)) return;
    if(leftHip.score > 0.5 && rightHip.score > 0.5) {
        const avgHipY = (leftHip.y + rightHip.y) / 2;
        setVector((prev: any) => {
            if(prev.prevValue === 0) return {prevValue: avgHipY, currentVector: 0, standStill: false};
            const diff = prev.prevValue - avgHipY;
            let gravity = 0;
            const vector = prev.currentVector;
            if (vector > 0 && vector < 10) gravity = -0.7;
            if (vector < 0 && vector > -10) gravity = 0.7;
            if (vector > 10) gravity = -3;
            if (vector < -10) gravity = 3;
            const nextValue = Math.floor(vector + diff + gravity);
            if(Math.abs(prev.currentVector - nextValue) < 5){
                return {prevValue: prev.prevValue, currentVector:prev.currentVector + gravity, standStill: Math.abs(prev.currentVector + gravity) < 10};
            }
            return {prevValue: avgHipY, currentVector:nextValue, standStill: Math.abs(nextValue) < 10};
        });
    } else {
        setVector(() => ({prevValue: 0, currentVector: 0, standStill: false}));
    }
}

export const requestWithRetry = async (request: any, retries = 3): Promise<any> => {
    try {
        return await request();
    } catch (error) {
        if (retries === 0) {
            throw new Error('Max retries reached');
        }
        return requestWithRetry(request, retries - 1);
    }
}

export const getStatusText = (status: string) => {
    switch (status) {
        case 'initial':
            return 'Начинаем загрузку';
        case 'loadingModel':
            return 'Настраиваем нейросети';
        case 'loadingCamera':
            return 'Настраиваем камеру';
        case 'searchHips':
            return 'Встаньте в кадр';
        case 'stayStill':
            return 'Стойте спокойно';
        case 'countdown':
            return 'Прыгайте через';
        case 'jumping':
            return 'Старт!';
        default:
            return '';
    }
}

function drawDynamicPattern(ctx: CanvasRenderingContext2D, colors: string[]) {
    let t = 0;

    // Helper function to set fill style and draw a pixel
    const col = (x: number, y: number, r: number, g: number, b: number) => {
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
    };

    // Functions to calculate R, G, and B values based on time
    const R = (x: number, y: number, t: number) => {
        return Math.floor(192 + 64 * Math.cos((x * x - y * y) / 300 + t));
    };

    const G = (x: number, y: number, t: number) => {
        return Math.floor(
            192 +
            64 *
            Math.sin(
                (x * x * Math.cos(t / 4) + y * y * Math.sin(t / 3)) / 300
            )
        );
    };

    const B = (x: number, y: number, t: number) => {
        return Math.floor(
            192 +
            64 *
            Math.sin(
                5 * Math.sin(t / 9) +
                ((x - 100) * (x - 100) + (y - 100) * (y - 100)) / 1100
            )
        );
    };

    // Main function to animate the pattern
    const run = () => {
        for (let x = 0; x <= 35; x++) {
            for (let y = 0; y <= 35; y++) {
                // Calculate RGB values and render the pattern
                col(x, y, R(x, y, t), G(x, y, t), B(x, y, t));
            }
        }
        t += 0.12;
        window.requestAnimationFrame(run);
    };

    // Start the animation
    run();
}


