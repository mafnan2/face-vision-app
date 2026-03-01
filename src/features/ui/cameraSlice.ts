import { createSlice } from "@reduxjs/toolkit";

interface CameraState {
  isRunning: boolean;
}

const initialState: CameraState = {
  isRunning: false,
};

const cameraSlice = createSlice({
  name: "camera",
  initialState,
  reducers: {
    startCamera(state) {
      state.isRunning = true;
    },
    stopCamera(state) {
      state.isRunning = false;
    },
  },
});

export const { startCamera, stopCamera } = cameraSlice.actions;
export default cameraSlice.reducer;