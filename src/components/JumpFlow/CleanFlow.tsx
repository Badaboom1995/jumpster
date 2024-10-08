import React, { useEffect, useRef } from 'react';

const VideoCanvas = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        const context = canvasElement.getContext('2d');

        // Get video stream from the camera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                videoElement.srcObject = stream;
                videoElement.play();
            })
            .catch((err) => console.error('Error accessing camera:', err));

        // Draw video onto canvas while maintaining aspect ratio
        const drawVideo = () => {
            if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
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
            }
            requestAnimationFrame(drawVideo);
        };

        videoElement.addEventListener('loadedmetadata', () => {
            canvasElement.width = canvasElement.offsetWidth;
            canvasElement.height = canvasElement.offsetHeight;
            drawVideo();
        });
    }, []);

    return (
        <div className="w-full h-full fixed top-0 left-0">
            <video ref={videoRef} className="hidden" />
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
};

export default VideoCanvas;
