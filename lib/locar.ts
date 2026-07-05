import {App, LocAR} from "locar";

export const locAr = (canvas: HTMLCanvasElement) => {
    const app = new App({
        cameraOptions: {
            hFov: 80,
            near: 0.001,
            far: 1000
        },
        canvas
    });
    return app.start();
}