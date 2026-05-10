'use client';

import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface StandaloneModelPreviewProps {
    modelUrl: string | null;
    scale?: number;
}

function ModelLoader({ url, scale = 1 }: { url: string; scale: number }) {
    let finalUrl = url;

    // Proxy transform for local dev if necessary
    if (finalUrl.includes(':8000/media/')) {
        finalUrl = finalUrl.replace(/http:\/\/[^\/]+:8000\/media\//, '/django-media/');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { scene } = useGLTF(finalUrl) as any;

    useEffect(() => {
        if (scene) {
            scene.traverse((child: THREE.Object3D) => {
                if (child instanceof THREE.Mesh && child.material) {
                    child.material.side = THREE.DoubleSide;
                }
            });
        }
    }, [scene]);

    return <primitive object={scene} scale={[scale, scale, scale]} position={[0, 0, 0]} />;
}

export default function StandaloneModelPreview({ modelUrl, scale = 10 }: StandaloneModelPreviewProps) {
    if (!modelUrl) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-zinc-100 border-2 border-dashed border-border text-zinc-500 font-bold uppercase text-sm p-4 text-center">
                Sube un archivo .GLTF o .GLB para visualizarlo en 3D
            </div>
        );
    }

    /* We divide scale by 5 since the face tracker scales up by distance, whereas the standalone viewport doesn't have a face relative distance. */
    const normalizedScale = scale * 0.2;

    return (
        <div className="relative h-full w-full bg-zinc-100 border-2 border-border overflow-hidden shadow-[var(--shadow-solid-hover)] cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Environment preset="city" />
                <Suspense fallback={null}>
                    <ModelLoader url={modelUrl} scale={normalizedScale} />
                </Suspense>
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    minDistance={1}
                    maxDistance={20}
                    autoRotate={true}
                    autoRotateSpeed={2}
                />
            </Canvas>
            <div className="absolute bottom-4 left-4 bg-white border-2 border-border px-3 py-1 text-[10px] font-black uppercase shadow-[var(--shadow-solid-sm)]">
                Modo Interactivo (Arrastra para rotar)
            </div>
        </div>
    );
}
