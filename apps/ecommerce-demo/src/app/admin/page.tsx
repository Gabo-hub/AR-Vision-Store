'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Glasses } from '@/types/glasses';
import { fetchApi } from '@/lib/api';

export default function AdminDashboard() {
    const [products, setProducts] = useState<Glasses[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await fetchApi('/products/');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: number | string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este lente?')) return;
        try {
            const res = await fetchApi(`/products/${id}/`, { method: 'DELETE' });
            if (res.ok) {
                fetchProducts();
            } else {
                alert('Error al eliminar');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ProtectedRoute requireAdmin={true}>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex justify-between items-center mb-8 border-b-2 border-border pb-4">
                    <h1 className="text-4xl font-black uppercase text-foreground">Panel de Administración</h1>
                    <Link href="/admin/product/new" className="bg-primary text-white border-2 border-border px-5 py-2.5 font-black uppercase text-sm transition-all shadow-[var(--shadow-solid-btn)] hover:-translate-y-1 hover:shadow-[var(--shadow-solid-hover)] active:translate-y-0 active:shadow-none inline-block">
                        + Nuevo Producto
                    </Link>
                </div>

                {isLoading ? (
                    <div className="text-center py-12 text-zinc-500 font-bold uppercase">Cargando productos...</div>
                ) : (
                    <div className="bg-white border-2 border-border shadow-[var(--shadow-solid-hover)] overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-zinc-100 border-b-2 border-border">
                                <tr>
                                    <th className="px-6 py-4 font-black uppercase text-foreground border-r-2 border-border">ID</th>
                                    <th className="px-6 py-4 font-black uppercase text-foreground border-r-2 border-border">Nombre</th>
                                    <th className="px-6 py-4 font-black uppercase text-foreground border-r-2 border-border">Precio</th>
                                    <th className="px-6 py-4 font-black uppercase text-foreground text-right border-border">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-border">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-zinc-500 border-r-2 border-border">#{product.id}</td>
                                        <td className="px-6 py-4 font-bold text-foreground border-r-2 border-border">{product.name}</td>
                                        <td className="px-6 py-4 font-black text-primary border-r-2 border-border">${product.price}</td>
                                        <td className="px-6 py-4 text-right space-x-4">
                                            <Link href={`/admin/product/${product.id}`} className="text-foreground border-b-2 border-transparent hover:border-foreground font-bold uppercase text-xs transition-all">Editar</Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 border-b-2 border-transparent hover:border-red-600 font-bold uppercase text-xs transition-all"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay productos registrados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
