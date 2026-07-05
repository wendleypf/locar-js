'use client'
import React from "react";
import {locAr} from "@/lib/locar";
import {GpsReceivedEvent} from "locar";
import * as THREE from 'three';

export default function Ar() {
    const arRef = React.useRef(null);
    const canvaRef = React.useRef<HTMLCanvasElement>(null);
    const [firstLocation, setFirstLocation] = React.useState(true);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/map-marker.png');
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
    });
    const geometry = new THREE.PlaneGeometry(10, 10);


    React.useEffect(() => {
        const initLocar = async () => {
            if (!canvaRef.current) {
                return;
            }
            try {
                const locar = await locAr(canvaRef.current);
                locar.on('gpserror', (error: GeolocationPositionError): void => {
                    console.log(`${error.code}`);
                });
                locar.on('gpsupdate', (event: GpsReceivedEvent): void => {
                    if (firstLocation) {
                        const boxProps = [{
                            latDis: 0.0005,
                            lonDis: 0,
                            colour: 0xff0000
                        }, {
                            latDis: -0.0005,
                            lonDis: 0,
                            colour: 0xffff00
                        }, {
                            latDis: 0,
                            lonDis: -0.0005,
                            colour: 0x00ffff
                        }, {
                            latDis: 0,
                            lonDis: 0.0005,
                            colour: 0x00ff00
                        }];

                        for(const boxProp of boxProps) {
                            const mesh = new THREE.Mesh(geometry, material);
                            const sprite = new THREE.Sprite(material);
                            sprite.scale.set(10, 10, 1);

                            locar.add(
                                mesh,
                                event.position.coords.longitude + boxProp.lonDis,
                                event.position.coords.latitude + boxProp.latDis
                            );
                        }

                    }
                    setFirstLocation(true);
                });
                await locar.startGps();
            } catch (e: unknown) {
                console.log(e);
            }
        }
        initLocar().then();
    }, [firstLocation, geometry, material]);

    return (<div ref={arRef} className='w-screen h-screen'>
        <canvas ref={canvaRef}></canvas>
    </div>)
}