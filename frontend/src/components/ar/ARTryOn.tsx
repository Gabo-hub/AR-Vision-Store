'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, X, Box, Info, Settings2, Smile, Zap } from "lucide-react";
import { Glasses } from "@/types/glasses";
import FaceTracker from "./FaceTracker";
import { cn, getProxyMediaUrl } from "@/lib/utils";

interface ARTryOnProps {
    product: Glasses;
}

export default function ARTryOn({ product }: ARTryOnProps) {
    const [isActive, setIsActive] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDebug, setShowDebug] = useState(false);
    const [offsets, setOffsets] = useState({
        x: product.offset_x || 0,
        y: product.offset_y || 0,
        z: product.offset_z || 0,
        scale: product.scale_factor || 10
    });

    const toggleAR = () => {
        if (!isActive) {
            setError(null);
            setIsActive(true);
        } else {
            setIsActive(false);
            setIsFaceDetected(false);
        }
    };

    return (
        <div className="relative h-full w-full bg-[#f4ede8]">
            {!isActive && (
                <div className="relative h-full w-full">
                    <Image
                        src={getProxyMediaUrl(product.thumbnail || '')}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                        loading="eager"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-[#2d2926]/70 via-[#2d2926]/20 to-transparent pb-4 md:pb-8">
                        <button
                            onClick={toggleAR}
                            className="group flex items-center gap-2.5 md:gap-3 rounded-2xl bg-white px-5 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-[#2d2926] shadow-2xl transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-[#e86f50]">
                                <Camera className="h-4 w-4 md:h-5 md:w-5 text-white" />
                            </div>
                            Pruébatelos en 3D
                        </button>
                        <p className="text-xs text-white/70 mt-2 md:mt-3 hidden md:block">Usa tu cámara para ver cómo te quedan</p>
                    </div>
                </div>
            )}

            {isActive && (
                <div className="relative h-full w-full overflow-hidden bg-[#1a1a1a] rounded-2xl md:rounded-3xl">
                    <FaceTracker
                        product={product}
                        onLoad={() => setIsLoaded(true)}
                        onFaceDetected={(detected: boolean) => setIsFaceDetected(detected)}
                        onError={(err: string) => setError(err)}
                        debugOffsets={offsets}
                    />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2">
                            <div className={cn(
                                "h-2 w-2 md:h-2.5 md:w-2.5 rounded-full",
                                isFaceDetected ? "bg-[#22c55e]" : (isLoaded ? "bg-[#e86f50] animate-pulse" : "bg-[#f59e0b] animate-pulse")
                            )} />
                            <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">
                                {isFaceDetected ? (
                                    <span className="flex items-center gap-1">
                                        <Smile className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                        <span className="hidden md:inline">¡Rostro detectado!</span>
                                        <span className="md:hidden">¡Listo!</span>
                                    </span>
                                ) : (isLoaded ? "Buscando rostro..." : "Inicializando...")}
                            </span>
                        </div>
                        <div className="flex gap-1.5 md:gap-2">
                            <button
                                onClick={() => setShowDebug(!showDebug)}
                                className={cn("rounded-full p-2 text-white transition-all", showDebug ? "bg-[#e86f50]" : "bg-white/10 hover:bg-white/20")}
                            >
                                <Settings2 className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                            <button
                                onClick={toggleAR}
                                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-all"
                            >
                                <X className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                        </div>
                    </div>

                    {showDebug && (
                        <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-4 md:right-4 rounded-xl md:rounded-2xl bg-white/95 backdrop-blur-md p-3 md:p-5 text-[#2d2926] z-20 shadow-2xl">
                            <div className="mb-3 md:mb-4 flex justify-between items-center">
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#e86f50] flex items-center gap-1">
                                    <Zap className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                    Calibración
                                </span>
                                <button onClick={() => setOffsets({ x: 0, y: 0.02, z: 0, scale: 10 })} className="text-[9px] md:text-[10px] bg-[#f4ede8] px-2 py-1 rounded-full font-medium hover:bg-[#e8e3de] transition-colors">Reset</button>
                            </div>
                            <div className="space-y-2 md:space-y-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between text-[10px] md:text-xs font-medium text-[#5c5552]"><span>X</span> <span>{offsets.x.toFixed(2)}</span></div>
                                    <input type="range" min="-1" max="1" step="0.01" value={offsets.x} onChange={(e) => setOffsets({ ...offsets, x: parseFloat(e.target.value) })} className="w-full accent-[#e86f50] h-1.5" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between text-[10px] md:text-xs font-medium text-[#5c5552]"><span>Y</span> <span>{offsets.y.toFixed(2)}</span></div>
                                    <input type="range" min="-1" max="1" step="0.01" value={offsets.y} onChange={(e) => setOffsets({ ...offsets, y: parseFloat(e.target.value) })} className="w-full accent-[#e86f50] h-1.5" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between text-[10px] md:text-xs font-medium text-[#5c5552]"><span>Z</span> <span>{offsets.z.toFixed(2)}</span></div>
                                    <input type="range" min="-5" max="5" step="0.1" value={offsets.z} onChange={(e) => setOffsets({ ...offsets, z: parseFloat(e.target.value) })} className="w-full accent-[#e86f50] h-1.5" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between text-[10px] md:text-xs font-medium text-[#5c5552]"><span>Escala</span> <span>{offsets.scale.toFixed(2)}</span></div>
                                    <input type="range" min="0.01" max="25" step="0.05" value={offsets.scale} onChange={(e) => setOffsets({ ...offsets, scale: parseFloat(e.target.value) })} className="w-full accent-[#e86f50] h-1.5" />
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoaded && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a]/80 text-white">
                            <Box className="h-10 w-10 md:h-12 md:w-12 text-[#e86f50] animate-bounce mb-3 md:mb-4" />
                            <p className="text-sm md:text-base font-medium">Cargando motor de IA...</p>
                            <p className="text-[10px] md:text-xs text-white/50 mt-1 md:mt-2">Esto puede tardar unos segundos</p>
                        </div>
                    )}

                    {isLoaded && !isFaceDetected && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent text-white pointer-events-none">
                            <div className="rounded-2xl md:rounded-3xl border-2 border-dashed border-white/30 p-8 md:p-10 animate-pulse">
                                <div className="text-center">
                                    <Smile className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-2 md:mb-3 opacity-50" />
                                    <p className="text-xs md:text-sm font-medium text-white/70">Encuadra tu rostro</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a]/90 px-4 md:px-8 text-center text-white">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#fef6f4] rounded-full flex items-center justify-center mb-3 md:mb-4">
                                <Info className="h-7 w-7 md:h-8 md:w-8 text-[#e86f50]" />
                            </div>
                            <p className="text-sm md:text-base font-bold mb-2">Error de cámara</p>
                            <p className="text-xs md:text-sm text-white/60 mb-4 md:mb-6 max-w-xs">{error}</p>
                            <button
                                onClick={toggleAR}
                                className="rounded-full border border-white/20 px-5 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-medium hover:bg-white/10 transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
