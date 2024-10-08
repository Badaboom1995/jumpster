import React, { useEffect, useRef } from 'react';

const VideoCanvas = () => {
    const videoRef = useRef<any>(null);
    const canvasRef = useRef<any>(null);

    useEffect(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        // @ts-ignore
        const context = canvasElement.getContext('2d');

        // Get video stream from the camera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                console.log("Camera access granted, starting stream.");
                videoElement.srcObject = stream;
                videoElement.play();
            })
            .catch((err) => console.error('Error accessing camera:', err));

        // Draw video onto canvas
        const drawVideo = () => {
            if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                console.log("Drawing video frame.");
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

                context.clearRect(0, 0, canvasWidth, canvasHeight);
                context.drawImage(videoElement, offsetX, offsetY, drawWidth, drawHeight);
            } else {
                console.log("Video not ready yet, skipping frame.");
            }

            // Keep drawing the video in a loop
            requestAnimationFrame(drawVideo);
        };

        // Start drawing video once video metadata is loaded
        videoElement.addEventListener('loadedmetadata', () => {
            console.log("Video metadata loaded.");
            canvasElement.width = canvasElement.offsetWidth;
            canvasElement.height = canvasElement.offsetHeight;

            // Ensure the video is playing before drawing frames
            videoElement.play().then(() => {
                console.log("Video playback started.");
                requestAnimationFrame(drawVideo);
            }).catch((error: any) => {
                console.error("Error starting video playback:", error);
            });
        });

    }, [videoRef, canvasRef]);

    return (
        <div className="w-full h-full fixed top-0 left-0">
            <video ref={videoRef} className="hidden" />
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
};

export default VideoCanvas;
