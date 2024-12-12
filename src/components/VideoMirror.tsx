import { useEffect, useRef } from "react";

const VideoMirror = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    startCamera();

    // Cleanup function to stop the camera when component unmounts
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="video-mirror">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          transform: "scaleX(-1)", // Mirror the video horizontally
          maxWidth: "100%",
          width: "640px",
          height: "480px",
        }}
      />
    </div>
  );
};

export default VideoMirror;
