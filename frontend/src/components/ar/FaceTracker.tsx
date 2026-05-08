'use client';

import { useRef, useEffect, useState, MutableRefObject, memo, forwardRef, useImperativeHandle } from "react";
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
    productRef: MutableRefObject<Glasses>;
    onLoad: () => void;
    onFaceDetected: (detected: boolean) => void;
    onError: (msg: string) => void;
}

export interface FaceTrackerRef {
    switchCamera: () => void;
    capturePhoto: () => string | null;
}

const FaceTracker = memo(forwardRef<FaceTrackerRef, FaceTrackerProps>(function FaceTracker({ productRef, onLoad, onFaceDetected, onError }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const faceDataRef = useRef<{ x: number; y: number; z: number }[] | null>(null);
    const faceDetectedRef = useRef(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const debugRef = useRef<Record<string, string | number> | null>(null);
    const [debugText, setDebugText] = useState('');

    // Índices de landmarks y sus colores de depuración
    /*
    const TRACKED_LANDMARKS: { idx: number; color: string; label: string }[] = [
        { idx: 33,  color: '#FF4444', label: 'L-Eye' },   // rojo
        { idx: 263, color: '#FF4444', label: 'R-Eye' },   // rojo
        { idx: 168, color: '#44FF44', label: 'Nose' },    // verde
        { idx: 10,  color: '#4488FF', label: 'Head' },    // azul
        { idx: 152, color: '#4488FF', label: 'Chin' },    // azul
        { idx: 454, color: '#FFDD44', label: 'TmpL' },    // amarillo
        { idx: 234, color: '#FFDD44', label: 'TmpR' },    // amarillo
    ];
    */

    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const streamRef = useRef<MediaStream | null>(null);
    const faceMeshRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
        switchCamera: () => {
            setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
        },
        capturePhoto: () => {
            if (!videoRef.current || !containerRef.current) return null;

            const cw = containerRef.current.clientWidth;
            const ch = containerRef.current.clientHeight;
            const canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            const vw = videoRef.current.videoWidth;
            const vh = videoRef.current.videoHeight;

            const videoRatio = vw / vh;
            const canvasRatio = cw / ch;

            let drawW = vw;
            let drawH = vh;
            let offsetX = 0;
            let offsetY = 0;

            if (videoRatio > canvasRatio) {
                drawW = vh * canvasRatio;
                offsetX = (vw - drawW) / 2;
            } else {
                drawH = vw / canvasRatio;
                offsetY = (vh - drawH) / 2;
            }

            ctx.save();
            if (facingMode === 'user') {
                ctx.translate(cw, 0);
                ctx.scale(-1, 1);
            }
            ctx.drawImage(videoRef.current, offsetX, offsetY, drawW, drawH, 0, 0, cw, ch);
            ctx.restore();

            const glCanvas = containerRef.current.querySelector('canvas');
            if (glCanvas) {
                ctx.drawImage(glCanvas, 0, 0, cw, ch);
            }

            return canvas.toDataURL('image/png');
        }
    }));

    // FaceMesh Initialization & Process Loop
    useEffect(() => {
        let animationFrameId: number;
        let isUnmounted = false;
        let isProcessing = false;

        const initializeFaceMesh = async () => {
            try {
                // @ts-ignore
                const FaceMeshConstructor = window.FaceMesh;
                if (!FaceMeshConstructor) {
                    throw new Error("No se pudo cargar el constructor de FaceMesh desde el CDN.");
                }

                const faceMesh = new FaceMeshConstructor({
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
                    } else {
                        faceDataRef.current = null;
                    }

                    if (hasFace !== faceDetectedRef.current) {
                        faceDetectedRef.current = hasFace;
                        onFaceDetected(hasFace);
                    }
                });

                faceMeshRef.current = faceMesh;
                onLoad(); // Señalamos que el motor de IA está listo (la cámara puede tardar un poco más)
                processFrame();

            } catch (error) {
                console.error("Error inicializando FaceMesh:", error);
                if (!isUnmounted) onError((error as Error).message || "Error al cargar el motor de IA.");
            }
        };

        const processFrame = () => {
            if (isUnmounted) return;

            if (videoRef.current && faceMeshRef.current && videoRef.current.readyState >= 2 && !isProcessing) {
                isProcessing = true;
                faceMeshRef.current.send({ image: videoRef.current })
                    .then(() => { isProcessing = false; })
                    .catch(() => { isProcessing = false; });
            }

            if (!isUnmounted) {
                animationFrameId = requestAnimationFrame(processFrame);
            }
        };

        initializeFaceMesh();

        return () => {
            isUnmounted = true;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (faceMeshRef.current) {
                try { faceMeshRef.current.close(); } catch (e) {}
            }
        };
    }, [onLoad, onFaceDetected, onError]);

    // Camera Initialization
    useEffect(() => {
        let isUnmounted = false;

        const initCamera = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                if (!isUnmounted) onError("La cámara solo está disponible en contextos seguros.");
                return;
            }

            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: facingMode
                    },
                    audio: false,
                });

                if (isUnmounted) return;
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = async () => {
                        try {
                            if (isUnmounted) return;
                            await videoRef.current?.play();
                            setIsCameraReady(true);
                        } catch (playErr) {
                            console.error("Error al iniciar reproducción:", playErr);
                            if (!isUnmounted) onError((playErr as Error).message || "No se pudo acceder a la cámara.");
                        }
                    };
                }
            } catch (error) {
                console.error("Error al acceder a la cámara:", error);
                if (!isUnmounted) onError((error as Error).message || "No se pudo acceder a la cámara.");
            }
        };

        initCamera();

        return () => {
            isUnmounted = true;
            // No detenemos el stream aquí porque queremos mantenerlo vivo a menos que el componente completo se desmonte o cambie facingMode.
            // Lo detendremos en el desmontaje final.
        };
    }, [facingMode, onError]);

    // Limpieza final del stream
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="relative h-full w-full" ref={containerRef}>
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover z-0"
                playsInline
                autoPlay
                muted
                // @ts-ignore
                webkit-playsinline="true"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />

            {/* Overlay de Canvas 2D para puntos de depuración (Opcional) */}
            {/* 
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover z-5 pointer-events-none"
                style={{ transform: 'scaleX(-1)' }}
            />
            */}

            {/* Escena 3D */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <Canvas
                    camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, 5] }}
                    gl={{ antialias: false, alpha: true, sortObjects: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
                    dpr={[1, 1.5]}
                >
                    <ambientLight intensity={0.7} />
                    <pointLight position={[10, 10, 10]} intensity={1} />

                    {videoRef.current && (
                        <GlassesRenderer
                            productRef={productRef}
                            faceDataRef={faceDataRef}
                            video={videoRef.current}
                            debugRef={debugRef}
                        />
                    )}
                </Canvas>
            </div>

            {/* HUD de Depuración (Comentado para producción) */}
            {/* <DebugHUD debugRef={debugRef} /> */}
        </div>
    );
}));

export default FaceTracker;
