'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getProducts, createGlasses, updateGlasses, deleteGlasses, Glasses } from '@/lib/api';
import { Plus, Pencil, Trash2, X, Upload, Image, Box } from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const { isAdmin, isLoading: authLoading } = useAuth();
    const [glasses, setGlasses] = useState<Glasses[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGlasses, setEditingGlasses] = useState<Glasses | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        thumbnail: null as File | null,
        model_3d_file: null as File | null,
        scale_factor: '0.15',
        offset_x: '0',
        offset_y: '0.02',
        offset_z: '0',
    });

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [authLoading, isAdmin, router]);

    useEffect(() => {
        if (isAdmin) {
            loadGlasses();
        }
    }, [isAdmin]);

    async function loadGlasses() {
        try {
            const data = await getProducts();
            setGlasses(data);
        } catch (err) {
            console.error('Error loading glasses:', err);
        } finally {
            setIsLoading(false);
        }
    }

    function openModal(glassesToEdit?: Glasses) {
        if (glassesToEdit) {
            setEditingGlasses(glassesToEdit);
            setFormData({
                name: glassesToEdit.name,
                description: glassesToEdit.description || '',
                price: glassesToEdit.price.toString(),
                thumbnail: null,
                model_3d_file: null,
                scale_factor: glassesToEdit.scale_factor?.toString() || '0.15',
                offset_x: glassesToEdit.offset_x?.toString() || '0',
                offset_y: glassesToEdit.offset_y?.toString() || '0.02',
                offset_z: glassesToEdit.offset_z?.toString() || '0',
            });
        } else {
            setEditingGlasses(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                thumbnail: null,
                model_3d_file: null,
                scale_factor: '0.15',
                offset_x: '0',
                offset_y: '0.02',
                offset_z: '0',
            });
        }
        setShowModal(true);
        setError('');
    }

    function closeModal() {
        setShowModal(false);
        setEditingGlasses(null);
        setError('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('scale_factor', formData.scale_factor);
            data.append('offset_x', formData.offset_x);
            data.append('offset_y', formData.offset_y);
            data.append('offset_z', formData.offset_z);

            if (formData.thumbnail) {
                data.append('thumbnail', formData.thumbnail);
            }
            if (formData.model_3d_file) {
                data.append('model_3d_file', formData.model_3d_file);
            }

            if (editingGlasses) {
                await updateGlasses(editingGlasses.id, data);
            } else {
                await createGlasses(data);
            }

            await loadGlasses();
            closeModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('¿Estás seguro de que quieres eliminar este lente?')) {
            return;
        }

        try {
            await deleteGlasses(id);
            await loadGlasses();
        } catch (err) {
            alert('Error al eliminar el lente');
        }
    }

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-600 mt-1">Gestiona tus lentes</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo Lente
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Imagen</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Nombre</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Precio</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Modelo 3D</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {glasses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No hay lentes aún. ¡Agrega el primero!
                                    </td>
                                </tr>
                            ) : (
                                glasses.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            {item.thumbnail ? (
                                                <img 
                                                    src={item.thumbnail} 
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <Image className="h-6 w-6 text-slate-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{item.name}</div>
                                            {item.description && (
                                                <div className="text-sm text-slate-500 truncate max-w-xs">
                                                    {item.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-900">
                                                ${item.price}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.model_3d_file ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                                    <Box className="h-4 w-4" />
                                                    Subido
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-sm">Sin modelo</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(item)}
                                                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingGlasses ? 'Editar Lente' : 'Nuevo Lente'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Nombre del lente"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    rows={3}
                                    placeholder="Descripción opcional"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Precio *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    <Image className="h-4 w-4 inline mr-1" />
                                    Imagen *
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    required={!editingGlasses}
                                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    <Box className="h-4 w-4 inline mr-1" />
                                    Modelo 3D (.glb)
                                </label>
                                <input
                                    type="file"
                                    accept=".glb,.gltf"
                                    required={!editingGlasses}
                                    onChange={(e) => setFormData({ ...formData, model_3d_file: e.target.files?.[0] || null })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Escala
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.scale_factor}
                                        onChange={(e) => setFormData({ ...formData, scale_factor: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Offset X
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.offset_x}
                                        onChange={(e) => setFormData({ ...formData, offset_x: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Offset Y
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.offset_y}
                                        onChange={(e) => setFormData({ ...formData, offset_y: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Guardando...' : editingGlasses ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
