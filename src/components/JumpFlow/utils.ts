
const KEYPOINT_PAIRS = [
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    ['left_hip', 'right_hip'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle']
];

// Draw lines between keypoints (joints)
// KEYPOINT_PAIRS.forEach(([partA, partB]) => {
//     const keypointA = keypoints.find((keypoint) => keypoint.name === partA);
//     const keypointB = keypoints.find((keypoint) => keypoint.name === partB);
//
//     if (keypointA && keypointB && keypointA.score > 0.3 && keypointB.score > 0.3) {
//         context.beginPath();
//         context.moveTo(keypointA.x * scale + offsetX, keypointA.y * scale + offsetY);
//         context.lineTo(keypointB.x * scale + offsetX, keypointB.y * scale + offsetY);
//         context.strokeStyle = '#D2FA63';
//         context.lineWidth = 2;
//         context.stroke();
//     }
// });
export const drawPoses = (poses: any, context: any, offsetX: any, offsetY: any, scale: any) => {
    poses.forEach((pose: any) => {
        const keypoints = pose.keypoints;
        // Draw keypoints as blue dots
        keypoints.forEach((keypoint: any) => {
            if (keypoint.score > 0.3) {
                const { x, y } = keypoint;
                context.beginPath();
                context.arc(x * scale + offsetX, y * scale + offsetY, 5, 0, 2 * Math.PI);
                context.fillStyle = '#D2FA63';
                context.fill();
            }
        });
    });
};

const drawMarker = (context: any, keypoint: any, offsetX: any, offsetY: any, scale: any) => {
    context.beginPath();
    context.arc(keypoint.x * scale + offsetX, keypoint.y * scale + offsetY, 5, 0, 2 * Math.PI);
    context.fillStyle = '#D2FA63';
    context.fill();
};
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

// Start the camera stream
export const startCamera = async (video: any) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();
    } catch (err) {
        console.error('Error accessing camera:', err);
    }
};

export const drawVideoFrame = (context: any, videoElement: any, canvasElement: any) => {
    const videoAspectRatio = videoElement.videoWidth / videoElement.videoHeight;
    const canvasWidth = canvasElement.width;
    const canvasHeight = canvasElement.height;
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

    // Clear canvas and draw video frame
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(videoElement, offsetX, offsetY, drawWidth, drawHeight);

    return { offsetX, offsetY, scale: drawWidth / videoElement.videoWidth };
};

export const drawPoses2 = (
    poses: any,
    context: any,
    sx: number,
    sy: number,
    sWidth: number,
    sHeight: number,
    canvasWidth: number,
    canvasHeight: number
) => {
    poses.forEach((pose: any) => {
        const keypoints = pose.keypoints;
        keypoints.forEach((keypoint: any) => {
            if (keypoint.score > 0.3) {
                const { x, y } = keypoint;

                // Map the keypoint coordinates to the canvas
                const canvasX = ((x - sx) / sWidth) * canvasWidth;
                const canvasY = ((y - sy) / sHeight) * canvasHeight;

                context.beginPath();
                context.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
                context.fillStyle = '#D2FA63';
                context.fill();
            }
        });
    });
};

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
    if(!(leftHip.score > 0.5) || !(rightHip > 0.5)) return;
    const avgHipY = (leftHip.y + rightHip.y) / 2;
    setVector((prev: any) => {
        if(prev.prevValue === 0) return {prevValue: avgHipY, currentVector: 0, standStill: false};
        const diff = prev.prevValue - avgHipY;
        let gravity = 0;
        const vector = prev.currentVector;
        if (vector > 0 && vector < 10) gravity = -1;
        if (vector < 0 && vector > -10) gravity = 1;
        if (vector > 10) gravity = -5;
        if (vector < -10) gravity = 5;
        const nextValue = vector + diff + gravity;
        if(Math.abs(prev.currentVector - nextValue) < 5){
            return {prevValue: prev.prevValue, currentVector:prev.currentVector + gravity, standStill: Math.abs(prev.currentVector + gravity) < 10};
        }
        return {prevValue: avgHipY, currentVector:nextValue, standStill: Math.abs(nextValue) < 10};
    });
}

export const requestWithRetry = async (request: any, retries = 3) => {
    try {
        return await request();
    } catch (error) {
        if (retries === 0) {
            throw new Error('Max retries reached');
        }
        return requestWithRetry(request, retries - 1);
    }
}
