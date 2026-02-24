'use client';

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Glasses } from "@/types/glasses";
import GlassesRenderer from "./GlassesRenderer";
import * as THREE from 'three';

declare global {
    interface Window {
        FaceMesh: any;
    }
}

interface FaceTrackerProps {
    product: Glasses;
    onLoad: () => void;
    onFaceDetected: (detected: boolean) => void;
    onError: (msg: string) => void;
    debugOffsets?: { x: number, y: number, z: number, scale: number };
}

export default function FaceTracker({ product, onLoad, onFaceDetected, onError, debugOffsets }: FaceTrackerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [faceData, setFaceData] = useState<any>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    useEffect(() => {
        let faceMesh: any = null;
        let animationFrameId: number;
        let stream: MediaStream | null = null;

        const initialize = async () => {
            if (!videoRef.current) return;

            try {
                // @ts-ignore
                const FaceMeshConstructor = window.FaceMesh;

                if (!FaceMeshConstructor) {
                    throw new Error("No se pudo cargar el constructor de FaceMesh desde el CDN.");
                }

                faceMesh = new FaceMeshConstructor({
                    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
                });

                faceMesh.setOptions({
                    maxNumFaces: 1,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                faceMesh.onResults((results: any) => {
                    const hasFace = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;
                    if (hasFace) {
                        setFaceData(results.multiFaceLandmarks[0]);
                    }
                    onFaceDetected(hasFace);
                });

                onLoad();

                // Comprobación de Contexto Seguro (Requerido para getUserMedia)
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("La cámara solo está disponible en contextos seguros (HTTPS o localhost). Si estás en un móvil, necesitas un túnel HTTPS (como ngrok) o habilitar flags de desarrollo.");
                }

                // Acceso manual a la cámara manejo específico para móviles
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: { ideal: 640 },
                            height: { ideal: 640 },
                            facingMode: 'user'
                        },
                        audio: false,
                    });
                } catch (camErr: any) {
                    throw new Error(`Permiso denegado o cámara en uso: ${camErr.name} - ${camErr.message}`);
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;

                    // Asegurar reproducción en móviles
                    videoRef.current.onloadedmetadata = async () => {
                        try {
                            await videoRef.current?.play();
                            setIsCameraReady(true);
                            requestAnimationFrame(processFrame);
                        } catch (playErr) {
                            console.error("Error al iniciar reproducción:", playErr);
                            onError("El navegador bloqueó la reproducción automática. Toca la pantalla para intentar de nuevo.");
                        }
                    };
                }
            } catch (err: any) {
                console.error(err);
                onError(err.message || "No se pudo acceder a la cámara.");
            }
        };

        const processFrame = async () => {
            if (videoRef.current && faceMesh && videoRef.current.readyState >= 2) {
                await faceMesh.send({ image: videoRef.current });
            }
            animationFrameId = requestAnimationFrame(processFrame);
        };

        initialize();

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (faceMesh) faceMesh.close();
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="relative h-full w-full">
            {/* Video Stream (Oculto, usado como textura y por MediaPipe) */}
            <video
                ref={videoRef}
                className="absolute opacity-0 w-[1px] h-[1px] pointer-events-none z-[-1]"
                playsInline
                autoPlay
                muted
                // @ts-ignore
                webkit-playsinline="true"
                style={{ transform: 'scaleX(-1)' }}
            />

            {/* Escena 3D de React Three Fiber */}
            <div className="absolute inset-0">
                <Canvas
                    camera={{ fov: 45, near: 0.1, far: 1000 }}
                    gl={{ antialias: true, alpha: true }}
                >
                    <ambientLight intensity={0.7} />
                    <pointLight position={[10, 10, 10]} intensity={1} />

                    {/* Fondo de Video */}
                    {isCameraReady && videoRef.current && (
                        <VideoBackground video={videoRef.current} />
                    )}

                    {/* Los Lentes */}
                    {faceData && (
                        <GlassesRenderer
                            product={product}
                            faceData={faceData}
                            debugOffsets={debugOffsets}
                        />
                    )}
                </Canvas>
            </div>
        </div>
    );
}

function VideoBackground({ video }: { video: HTMLVideoElement }) {
    const texture = useRef<THREE.VideoTexture>(null);

    useEffect(() => {
        if (video) {
            // @ts-ignore
            texture.current = new THREE.VideoTexture(video);
            texture.current.center.set(0.5, 0.5);
            texture.current.repeat.set(-1, 1); // Mirror effect
        }
    }, [video]);

    return (
        <mesh position={[0, 0, -5]}>
            <planeGeometry args={[10, 10]} />
            {texture.current && <meshBasicMaterial map={texture.current} />}
        </mesh>
    );
}
