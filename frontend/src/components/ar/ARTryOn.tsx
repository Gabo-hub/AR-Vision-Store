'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, X, Box, Info, Settings2 } from "lucide-react";
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 opacity-0 transition-opacity hover:opacity-100">
                        <button
                            onClick={toggleAR}
                            className="group flex items-center gap-3 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-gray-900 shadow-2xl transition-all hover:scale-105 active:scale-95"
                        >
                            <Camera className="h-5 w-5 text-blue-600 transition-transform group-hover:rotate-12" />
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
                        product={product}
                        onLoad={() => setIsLoaded(true)}
                        onFaceDetected={(detected: boolean) => setIsFaceDetected(detected)}
                        onError={(err: string) => setError(err)}
                        debugOffsets={offsets}
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
                                onClick={() => setShowDebug(!showDebug)}
                                className={cn("rounded-full p-2 text-white transition-colors", showDebug ? "bg-blue-600 hover:bg-blue-700" : "bg-white/10 hover:bg-white/20")}
                            >
                                <Settings2 className="h-5 w-5" />
                            </button>
                            <button
                                onClick={toggleAR}
                                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {showDebug && (
                        <div className="absolute bottom-6 left-4 right-4 rounded-2xl bg-black/80 p-4 text-white backdrop-blur-md z-20 shadow-2xl border border-white/10">
                            <div className="mb-4 flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-widest text-blue-400">Calibración en Vivo</span>
                                <button onClick={() => setOffsets({ x: 0, y: 0.02, z: 0, scale: 10 })} className="text-[10px] bg-white/10 px-2 py-1 rounded">Reset</button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between text-[11px] font-medium text-gray-300"><span>Posición X (Centro)</span> <span>{offsets.x.toFixed(2)}</span></div>
                                    <input type="range" min="-1" max="1" step="0.01" value={offsets.x} onChange={(e) => setOffsets({ ...offsets, x: parseFloat(e.target.value) })} className="w-full accent-blue-500" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between text-[11px] font-medium text-gray-300"><span>Posición Y (Altura)</span> <span>{offsets.y.toFixed(2)}</span></div>
                                    <input type="range" min="-1" max="1" step="0.01" value={offsets.y} onChange={(e) => setOffsets({ ...offsets, y: parseFloat(e.target.value) })} className="w-full accent-blue-500" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between text-[11px] font-medium text-gray-300"><span>Posición Z (Profundidad)</span> <span>{offsets.z.toFixed(2)}</span></div>
                                    <input type="range" min="-5" max="5" step="0.1" value={offsets.z} onChange={(e) => setOffsets({ ...offsets, z: parseFloat(e.target.value) })} className="w-full accent-blue-500" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between text-[11px] font-medium text-gray-300"><span>Escala (Tamaño)</span> <span>{offsets.scale.toFixed(2)}</span></div>
                                    <input type="range" min="0.01" max="10" step="0.01" value={offsets.scale} onChange={(e) => setOffsets({ ...offsets, scale: parseFloat(e.target.value) })} className="w-full accent-blue-500" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-gray-400 leading-relaxed text-center">
                                Usa estos valores en el <b>Panel de Administración de Django</b> para guardar el ajuste permanentemente.
                            </div>
                        </div>
                    )}

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
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-8 text-center text-white">
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
                </div>
            )}
        </div>
    );
}
