import { getProduct, getProducts } from "@/lib/api";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, Share2, Heart, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import Link from "next/link";
import ARTryOn from "@/components/ar/ARTryOn";

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let product;
    try {
        product = await getProduct(id);
    } catch (e) {
        // Fallback para demo
        const mockProducts = [
            {
                id: 1,
                name: "Classic Aviator Gold",
                description: "Estilo atemporal con montura dorada y cristales polarizados. Estos lentes ofrecen una protección UV completa y una durabilidad excepcional gracias a su construcción en acero inoxidable de grado quirúrgico.",
                price: "129.99",
                thumbnail: "https://images.unsplash.com/photo-1572635196237-14b3f281303f?auto=format&fit=crop&q=80&w=800",
                model_3d_file: "",
                scale_factor: 0.15,
                offset_x: 0,
                offset_y: 0.02,
                offset_z: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 2,
                name: "Modern Wayfarer Black",
                description: "Diseño moderno y versátil ideal para cualquier ocasión. La montura de acetato ligero proporciona comodidad durante todo el día, mientras que las bisagras reforzadas aseguran una larga vida útil.",
                price: "99.50",
                thumbnail: "https://images.unsplash.com/photo-1511499767390-a7395350cbb2?auto=format&fit=crop&q=80&w=800",
                model_3d_file: "",
                scale_factor: 0.18,
                offset_x: 0,
                offset_y: 0.01,
                offset_z: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
        product = mockProducts.find(p => p.id === parseInt(id)) || mockProducts[0];
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">
                <Link href="/" className="mb-8 inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Volver al catálogo
                </Link>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Galería de Imagen / Vista AR */}
                    <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-50 border border-gray-100 shadow-inner group">
                        <ARTryOn product={product} />
                    </div>

                    {/* Información del Producto */}
                    <div className="flex flex-col">
                        <div className="mb-8 border-b pb-8">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-sm font-bold uppercase tracking-widest text-blue-600">Colección 2024</span>
                                <div className="flex gap-2">
                                    <button className="rounded-full border p-2 text-gray-400 hover:border-blue-600 hover:text-blue-600 transition-colors">
                                        <Share2 className="h-5 w-5" />
                                    </button>
                                    <button className="rounded-full border p-2 text-gray-400 hover:border-rose-500 hover:text-rose-500 transition-colors">
                                        <Heart className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <h1 className="mb-4 text-4xl font-extrabold text-gray-900 md:text-5xl">{product.name}</h1>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-black text-blue-600">${product.price}</span>
                                <span className="rounded-lg bg-green-50 px-2 py-1 text-xs font-bold text-green-600">En Stock</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">Descripción</h3>
                            <p className="leading-relaxed text-gray-600">{product.description}</p>
                        </div>

                        <div className="mb-10 space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Truck className="h-5 w-5 text-blue-600" />
                                <span>Envío gratuito a todo el país</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                                <span>Garantía de 12 meses oficial</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <RotateCcw className="h-5 w-5 text-blue-600" />
                                <span>Devolución sin cargo por 30 días</span>
                            </div>
                        </div>

                        <button className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.98]">
                            Añadir al Carrito
                        </button>
                        <p className="mt-4 text-center text-xs text-gray-400">
                            Compra 100% protegida. Transacción encriptada.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
