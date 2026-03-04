import { getProduct, getProducts } from "@/lib/api";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, Share2, Heart, ShieldCheck, Truck, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import ARTryOn from "@/components/ar/ARTryOn";

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let product;
    try {
        product = await getProduct(id);
    } catch (e) {
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
        <div className="min-h-screen bg-white pb-24 md:pb-8">
            <div className="container mx-auto px-3 md:px-4 py-5 md:py-8">
                <Link href="/" className="mb-5 md:mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#8a8582] hover:text-[#e86f50] transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    Volver al catálogo
                </Link>

                <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16">
                    <div className="relative aspect-[4/3] md:aspect-square overflow-hidden rounded-2xl md:rounded-3xl bg-[#f4ede8] border border-[#e8e3de] shadow-inner group">
                        <ARTryOn product={product} />
                    </div>

                    <div className="flex flex-col">
                        <div className="mb-6 md:mb-8 border-b border-[#e8e3de] pb-6 md:pb-8">
                            <div className="mb-4 md:mb-5 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold uppercase tracking-widest text-[#e86f50]">
                                    <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    Colección 2024
                                </span>
                                <div className="flex gap-1.5 md:gap-2">
                                    <button className="rounded-full border border-[#e8e3de] p-2 md:p-2.5 text-[#8a8582] hover:border-[#e86f50] hover:text-[#e86f50] hover:bg-[#fef6f4] transition-all">
                                        <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                                    </button>
                                    <button className="rounded-full border border-[#e8e3de] p-2 md:p-2.5 text-[#8a8582] hover:border-[#e86f50] hover:text-[#e86f50] hover:bg-[#fef6f4] transition-all">
                                        <Heart className="h-4 w-4 md:h-5 md:w-5" />
                                    </button>
                                </div>
                            </div>
                            <h1 className="font-display mb-3 md:mb-5 text-2xl md:text-4xl lg:text-5xl font-bold text-[#2d2926]">{product.name}</h1>
                            <div className="flex items-center gap-3 md:gap-4">
                                <span className="font-display text-3xl md:text-4xl font-black text-[#e86f50]">${product.price}</span>
                                <span className="rounded-full bg-[#f0fdf4] px-2.5 py-1 md:px-3 md:py-1.5 text-xs font-bold text-[#16a34a]">En Stock</span>
                            </div>
                        </div>

                        <div className="mb-6 md:mb-8">
                            <h3 className="font-display mb-2 md:mb-3 text-sm font-bold uppercase tracking-wider text-[#8a8582]">Descripción</h3>
                            <p className="leading-relaxed text-[#5c5552] text-base md:text-lg">{product.description}</p>
                        </div>

                        <div className="mb-8 md:mb-10 space-y-3 md:space-y-4">
                            <div className="flex items-center gap-3 text-sm md:text-[15px] text-[#5c5552]">
                                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-[#fef6f4] shrink-0">
                                    <Truck className="h-4 w-4 md:h-5 md:w-5 text-[#e86f50]" />
                                </div>
                                <span>Envío gratuito a todo el país</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm md:text-[15px] text-[#5c5552]">
                                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-[#fef6f4] shrink-0">
                                    <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-[#e86f50]" />
                                </div>
                                <span>Garantía de 12 meses oficial</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm md:text-[15px] text-[#5c5552]">
                                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-[#fef6f4] shrink-0">
                                    <RotateCcw className="h-4 w-4 md:h-5 md:w-5 text-[#e86f50]" />
                                </div>
                                <span>Devolución sin cargo por 30 días</span>
                            </div>
                        </div>

                        <button className="w-full rounded-2xl bg-[#e86f50] py-4 md:py-4.5 text-base md:text-lg font-bold text-white shadow-xl shadow-[#e86f50]/20 hover:bg-[#d85f40] hover:shadow-[#e86f50]/30 active:scale-[0.98] transition-all">
                            Añadir al Carrito
                        </button>
                        <p className="mt-3 md:mt-4 text-center text-xs md:text-sm text-[#8a8582]">
                            ✦ Compra 100% protegida. Transacción encriptada.
                        </p>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8e3de] p-3 md:hidden z-30">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="font-display text-xl font-black text-[#e86f50]">${product.price}</span>
                    </div>
                    <button className="flex-1 rounded-2xl bg-[#e86f50] py-3.5 text-base font-bold text-white shadow-lg hover:bg-[#d85f40] active:scale-[0.98] transition-all">
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        </div>
    );
}
