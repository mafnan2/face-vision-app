declare module "@tensorflow-models/blazeface" {
    import type * as tf from "@tensorflow/tfjs";
  
    export interface FacePrediction {
      topLeft: [number, number];
      bottomRight: [number, number];
      probability?: number[];
    }
  
    export interface BlazeFaceModel {
      estimateFaces(
        input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
        returnTensors?: boolean
      ): Promise<FacePrediction[]>;
    }
  
    export function load(): Promise<BlazeFaceModel>;
  }