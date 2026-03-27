'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import StandaloneModelPreview from '@/components/admin/StandaloneModelPreview';
import FaceTracker from '@/components/ar/FaceTracker';
import { Glasses } from '@/types/glasses';
import { fetchApi, getProxyMediaUrl } from '@/lib/api';
import { ArrowLeft, Save, Upload, Box, Camera } from 'lucide-react';

export default function ProductAdminForm() {
    const router = useRouter();
    const params = useParams();
    const isNew = params.id === 'new';

    // Product State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');

    // Thumbnails & Models
    const [thumbnailPath, setThumbnailPath] = useState<string | null>(null);
    const [modelPath, setModelPath] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [modelFile, setModelFile] = useState<File | null>(null);

    // Calibration
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [offsetZ, setOffsetZ] = useState(0);
    const [scale, setScale] = useState(10);

    const [previewMode, setPreviewMode] = useState<'3d' | 'ar'>('3d');
    const [isFaceTrackerLoaded, setIsFaceTrackerLoaded] = useState(false);
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [faceTrackerError, setFaceTrackerError] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(!isNew);

    useEffect(() => {
        if (!isNew) {
            const loadProduct = async () => {
                try {
                    const res = await fetchApi(`/products/${params.id}/`);
                    if (res.ok) {
                        const data = await res.json();
                        setName(data.name);
                        setDescription(data.description || '');
                        setPrice(data.price);
                        setThumbnailPath(data.thumbnail);
                        setModelPath(data.model_3d_file);

                        setOffsetX(data.offset_x || 0);
                        setOffsetY(data.offset_y || 0);
                        setOffsetZ(data.offset_z || 0);
                        setScale(data.scale_factor || 10);
                    } else {
                        alert('Producto no encontrado');
                        router.push('/admin');
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsFetching(false);
                }
            };
            loadProduct();
        }
    }, [isNew, params.id, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'model') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'thumbnail') setThumbnailFile(file);
            if (type === 'model') setModelFile(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);

        formData.append('offset_x', offsetX.toString());
        formData.append('offset_y', offsetY.toString());
        formData.append('offset_z', offsetZ.toString());
        formData.append('scale_factor', scale.toString());

        if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
        if (modelFile) formData.append('model_3d_file', modelFile);

        try {
            const url = isNew ? '/products/' : `/products/${params.id}/`;
            const method = isNew ? 'POST' : 'PATCH';

            const res = await fetchApi(url, {
                method,
                body: formData,
            });

            if (res.ok) {
                router.push('/admin');
            } else {
                const err = await res.json();
                console.error(err);
                alert('Error al guardar: revisa los logs en consola');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Fallo catastrófico de red');
        } finally {
            setIsLoading(false);
        }
    };

    /* Create temporary preview URLs if files are uploaded before saving */
    const previewModelUrl = modelFile ? URL.createObjectURL(modelFile) : (modelPath ? getProxyMediaUrl(modelPath) : null);

    const previewProductRef = useRef<Glasses>({
        id: isNew ? 0 : Number(params.id),
        name: '',
        description: '',
        price: '0',
        thumbnail: '',
        model_3d_file: '',
        offset_x: 0,
        offset_y: 0,
        offset_z: 0,
        scale_factor: 10,
        created_at: '',
        updated_at: '',
    });

    useEffect(() => {
        previewProductRef.current = {
            id: isNew ? 0 : Number(params.id),
            name,
            description,
            price: price || '0',
            thumbnail: thumbnailPath || '',
            model_3d_file: previewModelUrl || '',
            offset_x: offsetX,
            offset_y: offsetY,
            offset_z: offsetZ,
            scale_factor: scale,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }, [isNew, params.id, name, description, price, thumbnailPath, previewModelUrl, offsetX, offsetY, offsetZ, scale]);

    if (isFetching) {
        return <div className="min-h-screen flex items-center justify-center font-black uppercase text-xl">Cargando producto...</div>;
    }

    return (
        <ProtectedRoute requireAdmin={true}>
            <div className="bg-background min-h-screen">
                <div className="container mx-auto px-4 py-8 max-w-7xl">

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8 border-b-2 border-border pb-6">
                        <button onClick={() => router.back()} className="p-2 border-2 border-border hover:bg-zinc-100 transition-colors shadow-[var(--shadow-solid-sm)]">
                            <ArrowLeft className="h-6 w-6 stroke-[2.5px]" />
                        </button>
                        <h1 className="text-4xl font-black uppercase text-foreground">
                            {isNew ? 'Registrar Nuevo Lente' : 'Editar Lente'}
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN: Data Form */}
                        <div className="lg:col-span-7 space-y-8">
                            <form id="productForm" onSubmit={handleSave} className="bg-white border-2 border-border p-8 shadow-[var(--shadow-solid-hover)] space-y-6">

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-black uppercase text-foreground mb-2">Nombre del Modelo</label>
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 border-2 border-border focus:ring-0 focus:border-primary bg-zinc-50 outline-none font-bold placeholder:font-medium placeholder:normal-case" placeholder="Ej. Aviator Classic" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-black uppercase text-foreground mb-2">Precio ($)</label>
                                        <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-4 py-3 border-2 border-border focus:ring-0 focus:border-primary bg-zinc-50 outline-none font-bold" placeholder="0.00" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-black uppercase text-foreground mb-2">Descripción Corta</label>
                                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 border-2 border-border focus:ring-0 focus:border-primary bg-zinc-50 outline-none font-medium resize-none shadow-sm" placeholder="Detalles del lente..." />
                                    </div>
                                </div>

                                <div className="border-t-2 border-border pt-6 mt-6">
                                    <h3 className="text-xl font-black uppercase text-foreground mb-4">Archivos Multimedia</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Thumbnail Upload */}
                                        <div>
                                            <label className="block text-xs font-black uppercase text-foreground mb-2">Imagen Miniatura (JPG/PNG)</label>
                                            <div className="relative border-2 border-dashed border-border bg-zinc-50 p-4 text-center hover:bg-zinc-100 transition-colors cursor-pointer group">
                                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnail')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                <Upload className="h-6 w-6 stroke-[2.5px] mx-auto mb-2 text-zinc-400 group-hover:text-primary transition-colors" />
                                                <span className="text-xs font-bold text-zinc-600 truncate block px-2">
                                                    {thumbnailFile ? thumbnailFile.name : (thumbnailPath ? '✓ Imagen Actual guardada' : 'Seleccionar Imagen')}
                                                </span>
                                            </div>
                                        </div>
                                        {/* GLTF Upload */}
                                        <div>
                                            <label className="block text-xs font-black uppercase text-primary mb-2">Modelo 3D (.GLTF / .GLB)</label>
                                            <div className="relative border-2 border-dashed border-primary bg-blue-50/50 p-4 text-center hover:bg-blue-50 transition-colors cursor-pointer group">
                                                <input type="file" accept=".gltf,.glb" onChange={(e) => handleFileChange(e, 'model')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                <Upload className="h-6 w-6 stroke-[2.5px] mx-auto mb-2 text-primary/60 group-hover:text-primary transition-colors" />
                                                <span className="text-xs font-bold text-primary truncate block px-2">
                                                    {modelFile ? modelFile.name : (modelPath ? '✓ Modelo GLTF guardado' : 'Seleccionar .GLTF')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t-2 border-border pt-6 mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-black uppercase text-foreground">Calibración Espacial AR</h3>
                                        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 border-2 border-amber-900 shadow-[var(--shadow-solid-sm)]">Solo Administradores</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 bg-zinc-100 p-6 border-2 border-border">
                                        <div>
                                            <label className="flex items-center justify-between text-xs font-black uppercase mb-1">
                                                <span>Escala General</span>
                                                <input type="number" step="0.001" min="0.001" max="150" value={Number(scale).toString()} onChange={(e) => setScale(parseFloat(e.target.value) || 0)} className="text-primary font-bold border-b-2 border-primary bg-transparent text-right outline-none w-16" />
                                            </label>
                                            <input type="range" min="0.001" max="150" step="0.001" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full accent-primary" />
                                        </div>
                                        <div>
                                            <label className="flex items-center justify-between text-xs font-black uppercase mb-1">
                                                <span>Posición X (Lados)</span>
                                                <input type="number" step="0.001" value={Number(offsetX).toString()} onChange={(e) => setOffsetX(parseFloat(e.target.value) || 0)} className="text-primary font-bold border-b-2 border-primary bg-transparent text-right outline-none w-16" />
                                            </label>
                                            <input type="range" min="-1" max="1" step="0.001" value={offsetX} onChange={(e) => setOffsetX(parseFloat(e.target.value))} className="w-full accent-primary" />
                                        </div>
                                        <div>
                                            <label className="flex items-center justify-between text-xs font-black uppercase mb-1">
                                                <span>Posición Y (Altura)</span>
                                                <input type="number" step="0.001" value={Number(offsetY).toString()} onChange={(e) => setOffsetY(parseFloat(e.target.value) || 0)} className="text-primary font-bold border-b-2 border-primary bg-transparent text-right outline-none w-16" />
                                            </label>
                                            <input type="range" min="-1" max="1" step="0.001" value={offsetY} onChange={(e) => setOffsetY(parseFloat(e.target.value))} className="w-full accent-primary" />
                                        </div>
                                        <div>
                                            <label className="flex items-center justify-between text-xs font-black uppercase mb-1">
                                                <span>Posición Z (Profundidad)</span>
                                                <input type="number" step="0.001" value={Number(offsetZ).toString()} onChange={(e) => setOffsetZ(parseFloat(e.target.value) || 0)} className="text-primary font-bold border-b-2 border-primary bg-transparent text-right outline-none w-16" />
                                            </label>
                                            <input type="range" min="-5" max="5" step="0.001" value={offsetZ} onChange={(e) => setOffsetZ(parseFloat(e.target.value))} className="w-full accent-primary" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT COLUMN: 3D Live Preview & Actions */}
                        <div className="lg:col-span-5 flex flex-col gap-6">

                            <div className="bg-white border-2 border-border shadow-[var(--shadow-solid-hover)] flex flex-col overflow-hidden relative">
                                <div className="border-b-2 border-border p-3 bg-zinc-100 flex justify-between items-center z-20">
                                    <h3 className="font-black uppercase text-sm">Visualizador en Vivo</h3>
                                    <div className="flex bg-white border-2 border-border shadow-[var(--shadow-solid-sm)] rounded-sm overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewMode('3d')}
                                            className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors flex items-center gap-1.5 ${previewMode === '3d' ? 'bg-primary text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
                                        >
                                            <Box className="h-3.5 w-3.5" /> 3D
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewMode('ar')}
                                            className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors flex items-center gap-1.5 border-l-2 border-border ${previewMode === 'ar' ? 'bg-primary text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
                                        >
                                            <Camera className="h-3.5 w-3.5" /> AR
                                        </button>
                                    </div>
                                </div>
                                <div className="relative bg-zinc-50 aspect-square">
                                    {previewMode === '3d' ? (
                                        <StandaloneModelPreview modelUrl={previewModelUrl} scale={scale} />
                                    ) : (
                                        <>
                                            {!previewModelUrl ? (
                                                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-bold uppercase text-sm p-8 text-center">
                                                    Sube un modelo 3D primero para usar la cámara
                                                </div>
                                            ) : (
                                                <>
                                                    {/* We wrap FaceTracker in a specialized Memo context or only pass down primitive updates */}
                                                    <FaceTracker
                                                        productRef={previewProductRef}
                                                        onLoad={() => setIsFaceTrackerLoaded(true)}
                                                        onFaceDetected={setIsFaceDetected}
                                                        onError={(err) => setFaceTrackerError(err)}
                                                    />

                                                    {/* AR Overlays */}
                                                    <div className="absolute top-2 left-2 z-10">
                                                        <div className={`text-[9px] font-black uppercase px-2 py-1 flex items-center gap-1.5 border-2 border-border bg-white shadow-[var(--shadow-solid-sm)]`}>
                                                            <div className={`h-2 w-2 rounded-full ${isFaceDetected ? 'bg-green-500' : (isFaceTrackerLoaded ? 'bg-sky-500 animate-pulse' : 'bg-amber-500 animate-pulse')}`} />
                                                            {isFaceDetected ? "Rostro Detectado" : (isFaceTrackerLoaded ? "Buscando Rostro..." : "Cargando IA...")}
                                                        </div>
                                                    </div>

                                                    {faceTrackerError && (
                                                        <div className="absolute inset-x-0 bottom-0 bg-rose-500 text-white p-3 text-xs font-bold uppercase border-t-2 border-border">
                                                            Error: {faceTrackerError}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="productForm"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 bg-primary text-white py-4 border-2 border-border shadow-[var(--shadow-solid-btn)] hover:-translate-y-1 hover:shadow-[var(--shadow-solid-hover)] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 font-black uppercase text-lg"
                            >
                                <Save className="h-6 w-6 stroke-[2.5px]" />
                                {isLoading ? 'Guardando cambios...' : 'Guardar Producto'}
                            </button>

                        </div>

                    </div>

                </div>
            </div>
        </ProtectedRoute>
    );
}
