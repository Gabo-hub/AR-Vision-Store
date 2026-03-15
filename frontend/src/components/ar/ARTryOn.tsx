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

    const productRef = useRef<Glasses>(product);

    useEffect(() => {
        productRef.current = product;
    }, [product]);

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
                    <div className="absolute z-20 inset-0 flex flex-col items-center justify-center bg-black/10 opacity-0 transition-opacity hover:opacity-100">
                        <button
                            onClick={toggleAR}
                            className="group flex items-center gap-3 bg-white px-8 py-3.5 text-sm font-black uppercase text-foreground border-2 border-border shadow-[var(--shadow-solid-btn)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-solid-hover)] active:translate-y-0 active:shadow-none"
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
                        productRef={productRef}
                        onLoad={() => setIsLoaded(true)}
                        onFaceDetected={(detected: boolean) => setIsFaceDetected(detected)}
                        onError={(err: string) => setError(err)}
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
