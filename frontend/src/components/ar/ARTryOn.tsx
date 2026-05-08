'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Camera, X, Box, Info, RefreshCcw, Download } from "lucide-react";
import { Glasses } from "@/types/glasses";
import FaceTracker, { FaceTrackerRef } from "./FaceTracker";
import { cn, getProxyMediaUrl } from "@/lib/utils";

interface ARTryOnProps {
    product: Glasses;
}

export default function ARTryOn({ product }: ARTryOnProps) {
    const [isActive, setIsActive] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const productRef = useRef<Glasses>(product);
    const faceTrackerRef = useRef<FaceTrackerRef>(null);

    useEffect(() => {
        productRef.current = product;
    }, [product]);

    const handleLoad = useCallback(() => setIsLoaded(true), []);
    const handleFaceDetected = useCallback((detected: boolean) => setIsFaceDetected(detected), []);
    const handleError = useCallback((err: string) => setError(err), []);

    const toggleAR = () => {
        if (!isActive) {
            setError(null);
            setIsActive(true);
        } else {
            setIsActive(false);
            setIsFaceDetected(false);
            setPhotoPreview(null);
        }
    };

    const handleSwitchCamera = () => {
        if (faceTrackerRef.current) {
            faceTrackerRef.current.switchCamera();
        }
    };

    const handleTakePhoto = () => {
        if (faceTrackerRef.current) {
            const dataUrl = faceTrackerRef.current.capturePhoto();
            if (dataUrl) {
                setPhotoPreview(dataUrl);
            }
        }
    };

    return (
        <div className="relative h-full w-full bg-gray-50">
            {/* Vista Previa Estática */}
            {!isActive && (
                <div className="relative h-full w-full">
                    <Image
                        src={getProxyMediaUrl(product.thumbnail)}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                        loading="eager"
                    />
                    <div className="absolute z-20 inset-0 flex flex-col items-center justify-center bg-black/10 opacity-0 transition-opacity hover:opacity-100">
                        <button
                            onClick={toggleAR}
                            className="group flex items-center gap-3 bg-white px-8 py-3.5 text-sm font-black uppercase text-foreground border-2 border-border shadow-(--shadow-solid-btn) transition-all hover:-translate-y-1 hover:shadow-(--shadow-solid-hover) active:translate-y-0 active:shadow-none"
                        >
                            <Camera className="h-5 w-5 text-primary stroke-[2.5px] transition-transform group-hover:scale-110" />
                            Pruébatelos en 3D
                        </button>
                    </div>
                </div>
            )}

            {/* Interfaz AR Activa */}
            {isActive && (
                <div className="relative h-full w-full overflow-hidden bg-black">
                    {/* Componente que maneja MediaPipe y Three.js */}
                    <FaceTracker
                        ref={faceTrackerRef}
                        productRef={productRef}
                        onLoad={handleLoad}
                        onFaceDetected={handleFaceDetected}
                        onError={handleError}
                    />

                    {/* Controles Superpuestos */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md">
                            <div className={cn(
                                "h-2 w-2 rounded-full",
                                isFaceDetected ? "bg-green-500" : (isLoaded ? "bg-sky-500 animate-pulse" : "bg-amber-500 animate-pulse")
                            )} />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                {isFaceDetected ? "Live Tracker" : (isLoaded ? "Buscando Rostro..." : "Inicializando...")}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={toggleAR}
                                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {!isLoaded && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white transition-opacity duration-500">
                            <Box className="h-10 w-10 text-blue-400 animate-bounce mb-4" />
                            <p className="text-sm font-medium">Cargando motor de IA...</p>
                            <p className="text-[10px] text-gray-400 mt-2">Esto puede tardar unos segundos en el móvil</p>
                        </div>
                    )}

                    {isLoaded && !isFaceDetected && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent text-white pointer-events-none">
                            <div className="rounded-2xl border-2 border-dashed border-white/30 p-12 animate-pulse">
                                <p className="text-xs font-bold text-white/50 bg-black/20 px-4 py-2 rounded-full">Encuadra tu rostro</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-8 text-center text-white z-50">
                            <Info className="h-10 w-10 text-rose-500 mb-4" />
                            <p className="text-sm font-bold mb-2">Error de cámara</p>
                            <p className="text-xs text-gray-400 mb-6">{error}</p>
                            <button
                                onClick={toggleAR}
                                className="rounded-xl border border-white/20 px-6 py-2 text-sm hover:bg-white/10"
                            >
                                Cerrar
                            </button>
                        </div>
                    )}

                    {/* Controles Inferiores (Cámara y Captura) */}
                    {isLoaded && !error && (
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8 z-20 pointer-events-auto">
                            <button
                                onClick={handleSwitchCamera}
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 active:scale-95 border border-white/20 shadow-lg"
                                aria-label="Cambiar cámara"
                            >
                                <RefreshCcw className="h-5 w-5" />
                            </button>
                            <button
                                onClick={handleTakePhoto}
                                className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/30 hover:scale-105 active:scale-95 border-2 border-white shadow-xl"
                                aria-label="Tomar foto"
                            >
                                <div className="h-12 w-12 rounded-full bg-white shadow-inner flex items-center justify-center text-black">
                                    <Camera className="h-6 w-6" />
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Modal de Previsualización de Foto */}
                    {photoPreview && (
                        <div className="absolute inset-0 z-60 flex flex-col items-center justify-center bg-black/95 px-4 animate-in fade-in zoom-in duration-300">
                            <button
                                onClick={() => setPhotoPreview(null)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <div className="relative w-full max-w-sm aspect-3/4 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                <img
                                    src={photoPreview}
                                    alt="Captura AR"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="mt-8 flex gap-4 w-full max-w-sm">
                                <button
                                    onClick={() => setPhotoPreview(null)}
                                    className="flex-1 py-3.5 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                                >
                                    Descartar
                                </button>
                                <a
                                    href={photoPreview}
                                    download="ar-tryon-capture.png"
                                    className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    <Download className="h-5 w-5" />
                                    Descargar
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
