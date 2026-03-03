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

// Definición de la clase KalmanFilter
class KalmanFilter {
    private R: number; // Ruido de medición
    private Q: number; // Ruido del proceso
    private A: number; // Factor de estado
    private B: number; // Control de entrada
    private C: number; // Factor de medición
    private cov: number; // Covarianza
    private x: number; // Estado estimado

    constructor(R: number, Q: number, A: number, B: number, C: number) {
        this.R = R;
        this.Q = Q;
        this.A = A;
        this.B = B;
        this.C = C;
        this.cov = NaN;
        this.x = NaN;
    }

    filter(z: number, u: number = 0): number {
        if (isNaN(this.x)) {
            this.x = (1 / this.C) * z;
            this.cov = (1 / this.C) * this.R * (1 / this.C);
        } else {
            // Predicción
            const predX = this.A * this.x + this.B * u;
            const predCov = (this.A * this.cov) * this.A + this.R;

            // Actualización
            const K = predCov * this.C * (1 / ((this.C * predCov * this.C) + this.Q));
            this.x = predX + K * (z - (this.C * predX));
            this.cov = predCov - (K * this.C * predCov);
        }

        return this.x;
    }
}

export default function FaceTracker({ product, onLoad, onFaceDetected, onError, debugOffsets }: FaceTrackerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [faceData, setFaceData] = useState<any>(null);
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
                    refineLandmarks: true,
                    minDetectionConfidence: 0.8,
                    minTrackingConfidence: 0.8,
                });

                let kalmanFilters: { x: KalmanFilter, y: KalmanFilter, z: KalmanFilter }[] = [];

                const smoothLandmarks = (landmarks: { x: number; y: number; z: number }[]): { x: number; y: number; z: number }[] => {
                    // Asegurarse de que kalmanFilters tenga la misma longitud que landmarks
                    if (kalmanFilters.length !== landmarks.length) {
                        kalmanFilters = Array.from({ length: landmarks.length }, () => ({
                            x: new KalmanFilter(0.8, 1, 1, 0, 1),
                            y: new KalmanFilter(0.8, 1, 1, 0, 1),
                            z: new KalmanFilter(0.8, 1, 1, 0, 1) // Reduce R noise filter slightly for faster settling
                        }));
                    }

                    return landmarks.map((point: { x: number; y: number; z: number }, index: number) => {
                        const filter = kalmanFilters[index];
                        if (!filter) {
                            return point; // Devuelve el punto original si no hay filtro
                        }
                        return {
                            x: filter.x.filter(point.x),
                            y: filter.y.filter(point.y),
                            z: filter.z.filter(point.z),
                        };
                    });
                };

                faceMesh.onResults((results: { multiFaceLandmarks?: { x: number; y: number; z: number }[][] }) => {
                    if (isUnmounted) return;
                    const hasFace = !!(results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0);
                    if (hasFace && results.multiFaceLandmarks) {
                        const smoothedData = smoothLandmarks(results.multiFaceLandmarks[0]);
                        setFaceData(smoothedData);
                    }
                    onFaceDetected(Boolean(hasFace));
                });


                // Comprobación de Contexto Seguro
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("La cámara solo está disponible en contextos seguros.");
                }

                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
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
                            onLoad(); // Notify that the engine is ready
                            processFrame(); // Start loop
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

        const processFrame = async () => {
            if (isUnmounted) return; // Prevent abort if WASM is closing

            if (videoRef.current && faceMesh && videoRef.current.readyState >= 2) {
                try {
                    await faceMesh.send({ image: videoRef.current });
                } catch (e) {
                    console.error("Error al procesar el fotograma:", e);
                }
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
            {/* Video Stream (Renderizado de forma Nativa por HTML y CSS para mejor rendimiento y colores puros) */}
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

            {/* Escena 3D de React Three Fiber */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <Canvas
                    camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, 5] }}
                    gl={{ antialias: true, alpha: true, sortObjects: true }}
                >
                    <ambientLight intensity={0.7} />
                    <pointLight position={[10, 10, 10]} intensity={1} />

                    {/* Los Lentes */}
                    {faceData && videoRef.current && (
                        <GlassesRenderer
                            product={product}
                            faceData={faceData}
                            debugOffsets={debugOffsets}
                            video={videoRef.current}
                        />
                    )}
                </Canvas>
            </div>
        </div>
    );
}
