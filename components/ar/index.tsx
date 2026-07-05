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
    const geometry = new THREE.PlaneGeometry(20, 20);

    function createMarker(title: string, distance: string) {
        const group = new THREE.Group();

        const marker = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
            })
        );

        marker.scale.set(8, 8, 1);

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;

        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, 512, 128);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, 256, 55);

        ctx.font = '30px Arial';
        ctx.fillText(distance, 256, 100);

        const label = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: new THREE.CanvasTexture(canvas),
                transparent: true,
            })
        );

        label.scale.set(15, 4, 1);
        label.position.y = 7;

        group.add(marker);
        group.add(label);

        return group;
    }

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
                            const mesh = new THREE.Mesh(
                                geometry,
                                new THREE.MeshBasicMaterial({
                                    map: texture,
                                    transparent: true,
                                    side: THREE.DoubleSide,
                                })
                            );

                            const sprite = new THREE.Sprite(material);
                            sprite.scale.set(20, 20, 1);
                            const poi = createMarker("Museu Afro", "150 m");
                            locar.add(
                                poi,
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
    }, [firstLocation]);


    return (<div ref={arRef} className='w-screen h-screen'>
        <canvas ref={canvaRef}></canvas>
    </div>)
}