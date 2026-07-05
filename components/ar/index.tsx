'use client'
import React from "react";
import {locAr} from "@/lib/locar";
import {GpsReceivedEvent} from "locar";
import * as THREE from 'three';

export default function Ar() {
    const arRef = React.useRef(null);
    const canvaRef = React.useRef<HTMLCanvasElement>(null);
    React.useEffect(() => {
        const initLocar = async () => {
            if (!canvaRef.current) {
                return;
            }
            try {
                const locar = await locAr(canvaRef.current);
                locar.on("gpserror", (error : GeolocationPositionError) => {
                    console.log(`GPS error: ${error.code}`);
                });
                locar.on("gpsupdate", (ev: GpsReceivedEvent) => {
                    console.log("GPS update", ev);
                    const geom = new THREE.BoxGeometry(10,10,10);
                    const mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({color: 0xff0000 }));
                    locar.add(mesh, ev.position.coords.longitude, ev.position.coords.latitude + 0.0005);
                })
                // const geom = new THREE.BoxGeometry(10, 10, 10);
                // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                // const mesh = new THREE.Mesh(geom, material);
                // locar.add(mesh, -0.72, 51.0505);
                await locar.startGps();
            } catch (e: unknown) {
                console.log(e);
            }
        }
        initLocar().then();
    }, [])
    return <div ref={arRef} className='w-screen h-screen'>
        <canvas ref={canvaRef}></canvas>
    </div>
}