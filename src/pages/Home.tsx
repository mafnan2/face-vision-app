import Header from "../components/layout/Header";
import Container from "../components/layout/Container";
import Button from "../components/common/Button";
import WebcamFaceCapture from "../components/face/WebcamPlaceholder";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { startCamera, stopCamera } from "../features/ui/cameraSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

export default function Home() {
  const dispatch = useDispatch();
  const isRunning = useSelector((state: RootState) => state.camera.isRunning);

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
      dispatch(stopCamera()); // ensure camera stops
    }
  };

  return (
    <div className="min-h-screen relative">
      <Header />

      <Container className="relative">
        <AnimatePresence>
          {!isRunning && !uploadedImage && (
            <motion.div
              key="topContent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="py-16 text-center space-y-6"
            >
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Real-Time Facial Recognition
              </h2>

              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Detect faces, analyze emotions, and extract attributes using modern AI models.
              </p>

              <div className="flex justify-center gap-4 flex-wrap">
                <Button onClick={() => dispatch(startCamera())}>
                  Start Camera
                </Button>

                <Button onClick={handleUploadClick}>
                  Upload Image
                </Button>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          initial={{ height: "24rem" }}
          animate={{
            height:
              isRunning || uploadedImage
                ? "calc(100vh - 80px)"
                : "24rem",
          }}
          transition={{ duration: 0.6 }}
          className="mt-12 relative rounded-xl overflow-hidden"
        >
          <WebcamFaceCapture
            isRunning={isRunning}
            uploadedImage={uploadedImage}
          />

          {(isRunning || uploadedImage) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4 z-50"
            >
              <Button
                onClick={() => {
                  dispatch(stopCamera());
                  setUploadedImage(null);
                }}
              >
                Reset
              </Button>
            </motion.div>
          )}
        </motion.div>
      </Container>
    </div>
  );
}