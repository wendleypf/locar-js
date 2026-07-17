'use client'

import React from 'react';
import * as THREE from 'three';
import { locAr } from '@/lib/locar';
import { GpsReceivedEvent } from 'locar';

export default function Ar() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const locarRef = React.useRef<any>(null);
    const markersCreated = React.useRef(false);

    const texture = React.useMemo(() => {
        return new THREE.TextureLoader().load('/map-marker.png');
    }, []);

    function createMarker(title: string, distance: string) {
        const group = new THREE.Group();

        const marker = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
            })
        );

        marker.scale.set(8, 8, 1);

        marker.userData = {
            url: 'https://www.google.com',
        };

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;

        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = 'rgba(0,0,0,.7)';
        ctx.fillRect(0, 0, 512, 128);

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';

        ctx.font = 'bold 42px Arial';
        ctx.fillText(title, 256, 50);

        ctx.font = '30px Arial';
        ctx.fillText(distance, 256, 98);

        const labelTexture = new THREE.CanvasTexture(canvas);

        const label = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: labelTexture,
                transparent: true,
            })
        );

        label.position.y = 7;
        label.scale.set(15, 4, 1);

        group.add(marker);
        group.add(label);

        return group;
    }

    React.useEffect(() => {
        if (!canvasRef.current) return;

        let clickHandler: ((e: MouseEvent) => void) | null = null;

        async function init() {
            const locar = await locAr(canvasRef.current!);

            locarRef.current = locar;

            locar.on('gpserror', (err: GeolocationPositionError) => {
                console.error(err);
            });

            locar.on('gpsupdate', (event: GpsReceivedEvent) => {

                if (markersCreated.current) return;

                markersCreated.current = true;

                const markers = [
                    { lat: 0.005, lon: 0 },
                    { lat: -0.0005, lon: 0 },
                    { lat: 0, lon: -0.0005 },
                    { lat: 0, lon: 0.005 },
                ];

                markers.forEach((m, index) => {

                    const poi = createMarker(
                        `Museu ${index + 1}`,
                        '5 m'
                    );

                    locar.add(
                        poi,
                        event.position.coords.longitude + m.lon,
                        event.position.coords.latitude + m.lat
                    );
                });
            });

            const raycaster = new THREE.Raycaster();
            const pointer = new THREE.Vector2();

            clickHandler = (event: MouseEvent) => {

                const rect = canvasRef.current!.getBoundingClientRect();

                pointer.x =
                    ((event.clientX - rect.left) / rect.width) * 2 - 1;

                pointer.y =
                    -((event.clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(pointer, locar.camera);

                const intersects = raycaster.intersectObjects(
                    locar.scene.children,
                    true
                );

                if (!intersects.length) return;

                let obj: THREE.Object3D | null = intersects[0].object;

                while (obj) {
                    if (obj.userData?.url) {
                        window.open(obj.userData.url, '_blank');
                        return;
                    }
                    obj = obj.parent;
                }
            };

            canvasRef.current!.addEventListener('click', clickHandler);

            await locar.startGps();
        }

        init().then();

        return (): void => {
            if (canvasRef.current && clickHandler) {
                canvasRef.current.removeEventListener(
                    'click',
                    clickHandler
                );
            }
        };

    }, [texture]);

    return (
        <div className='w-screen h-screen'>
            <canvas
                ref={canvasRef}
                className='w-full h-full'
            />
        </div>
    );
}