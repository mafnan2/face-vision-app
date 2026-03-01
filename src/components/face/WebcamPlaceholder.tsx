// WebcamFaceCapture.tsx
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "@vladmandic/face-api";

interface Props {
  isRunning: boolean;
  uploadedImage?: File | null;
}

const WebcamFaceCapture: FC<Props> = ({ isRunning, uploadedImage }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [uploadedImgEl, setUploadedImgEl] =
    useState<HTMLImageElement | null>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);

  /* ===============================
     TensorFlow Backend
  =============================== */
  useEffect(() => {
    const initTF = async () => {
      await tf.ready();
      await tf.setBackend("webgl");
      console.log("✅ TensorFlow backend:", tf.getBackend());
    };
    initTF();
  }, []);

  /* ===============================
     Load Models
  =============================== */
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.ageGenderNet.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");

        setModelsLoaded(true);
        console.log("✅ FaceAPI models loaded");
      } catch (err) {
        console.error("❌ Model load error:", err);
      }
    };

    loadModels();
  }, []);

  /* ===============================
     Handle Uploaded Image
  =============================== */
  useEffect(() => {
    if (!uploadedImage) {
      setUploadedImgEl(null);
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(uploadedImage);
    img.onload = () => {
      console.log("🖼 Uploaded image loaded");
      setUploadedImgEl(img);
    };

    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [uploadedImage]);

  /* ===============================
     Start / Stop Webcam
  =============================== */
  useEffect(() => {
    if (!isRunning) return;

    let stream: MediaStream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          console.log("🎥 Webcam started");
        }
      } catch (err) {
        console.error("❌ Webcam error:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }

      console.log("🛑 Webcam stopped");
    };
  }, [isRunning]);

  /* ===============================
   Detection Loop (FaceAPI Built-in Drawing)
================================ */
  useEffect(() => {
    if (!modelsLoaded) return;
    if (!isRunning && !uploadedImgEl) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let interval: any;

    const startDetection = () => {
      const displaySize = {
        width: uploadedImgEl
          ? uploadedImgEl.naturalWidth
          : video?.videoWidth || 0,
        height: uploadedImgEl
          ? uploadedImgEl.naturalHeight
          : video?.videoHeight || 0,
      };

      if (!displaySize.width || !displaySize.height) return;

      faceapi.matchDimensions(canvas, displaySize);

      interval = setInterval(async () => {
        const sourceEl = uploadedImgEl || video;
        if (!sourceEl) return;

        const detections = await faceapi
          .detectAllFaces(
            sourceEl,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withAgeAndGender()
          .withFaceExpressions();

        const resized = faceapi.resizeResults(detections, displaySize);

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (uploadedImgEl) {
          ctx.drawImage(uploadedImgEl, 0, 0, canvas.width, canvas.height);
        }

        // 🔥 BUILT-IN BOX DRAWING
        faceapi.draw.drawDetections(canvas, resized);

        // 🔥 BUILT-IN LABEL DRAWING
        resized.forEach((d) => {
          const { age, gender, expressions } = d;
          const box = d.detection.box;

          const bestExpression = Object.entries(expressions).reduce((a, b) =>
            b[1] > a[1] ? b : a
          )[0];

          new faceapi.draw.DrawTextField(
            [`${gender} (${age.toFixed(0)})`, bestExpression],
            box.bottomLeft
          ).draw(canvas);
        });
      }, 150);
    };

    if (video && isRunning) {
      if (video.readyState >= 2) {
        startDetection();
      } else {
        video.onloadedmetadata = startDetection;
      }
    } else if (uploadedImgEl) {
      startDetection();
    }

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, uploadedImgEl, modelsLoaded]);

  /* ===============================
   Clear Canvas On Reset
================================ */
  useEffect(() => {
    if (isRunning || uploadedImgEl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [isRunning, uploadedImgEl]);

  /* ===============================
     Render
  =============================== */
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute w-full h-full object-cover"
        style={{ display: isRunning ? "block" : "none" }}
        muted
      />

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />

      {!isRunning && !uploadedImgEl && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black/40">
          Camera is OFF
        </div>
      )}
    </div>
  );
};

export default WebcamFaceCapture;