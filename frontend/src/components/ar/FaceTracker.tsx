'use client';

import { useRef, useEffect, useState, MutableRefObject } from "react";
import { Canvas } from "@react-three/fiber";
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
    const faceDataRef = useRef<{ x: number; y: number; z: number }[] | null>(null);
    const faceDetectedRef = useRef(false);
    const [isCameraReady, setIsCameraReady] = useState(false);

    useEffect(() => {
        let faceMesh: any = null;
        let animationFrameId: number;
        let stream: MediaStream | null = null;
        let isUnmounted = false;

        const initialize = async () => {
            if (!videoRef.current || isUnmounted) return;

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
                    refineLandmarks: false,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                faceMesh.onResults((results: { multiFaceLandmarks?: { x: number; y: number; z: number }[][] }) => {
                    if (isUnmounted) return;
                    const hasFace = !!(results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0);
                    if (hasFace && results.multiFaceLandmarks) {
                        faceDataRef.current = results.multiFaceLandmarks[0];
                    }
                    if (hasFace !== faceDetectedRef.current) {
                        faceDetectedRef.current = hasFace;
                        onFaceDetected(hasFace);
                    }
                });

                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("La cámara solo está disponible en contextos seguros.");
                }

                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    },
                    audio: false,
                });

                if (videoRef.current && !isUnmounted) {
                    videoRef.current.srcObject = stream;

                    videoRef.current.onloadedmetadata = async () => {
                        try {
                            if (isUnmounted) return;
                            await videoRef.current?.play();
                            setIsCameraReady(true);
                            onLoad();
                            processFrame();
                        } catch (playErr) {
                            console.error("Error al iniciar reproducción:", playErr);
                            if (!isUnmounted) onError((playErr as Error).message || "No se pudo acceder a la cámara.");
                        }
                    };
                }
            } catch (error) {
                console.error("Error durante la inicialización:", error);
                if (!isUnmounted) onError((error as Error).message || "No se pudo acceder a la cámara.");
            }
        };

        let isProcessing = false;

        /** Non-blocking inference loop: fires detection without awaiting, preventing pipeline stalls on mobile. */
        const processFrame = () => {
            if (isUnmounted) return;

            if (videoRef.current && faceMesh && videoRef.current.readyState >= 2 && !isProcessing) {
                isProcessing = true;
                faceMesh.send({ image: videoRef.current })
                    .then(() => { isProcessing = false; })
                    .catch(() => { isProcessing = false; });
            }

            if (!isUnmounted) {
                animationFrameId = requestAnimationFrame(processFrame);
            }
        };

        initialize();

        return () => {
            isUnmounted = true;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            if (faceMesh) {
                try {
                    faceMesh.close();
                } catch (e) { }
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="relative h-full w-full">
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover z-0"
                playsInline
                autoPlay
                muted
                // @ts-ignore
                webkit-playsinline="true"
                style={{ transform: 'scaleX(-1)' }}
            />

            {/* 3D Scene */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <Canvas
                    camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, 5] }}
                    gl={{ antialias: false, alpha: true, sortObjects: true, powerPreference: 'high-performance' }}
                    dpr={[1, 1.5]}
                >
                    <ambientLight intensity={0.7} />
                    <pointLight position={[10, 10, 10]} intensity={1} />

                    {videoRef.current && (
                        <GlassesRenderer
                            product={product}
                            faceDataRef={faceDataRef}
                            debugOffsets={debugOffsets}
                            video={videoRef.current}
                        />
                    )}
                </Canvas>
            </div>
        </div>
    );
}
