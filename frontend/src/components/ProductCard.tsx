import Image from "next/image";
import Link from "next/link";
import { Glasses } from "@/types/glasses";
import { Eye, Sparkles, Camera } from "lucide-react";
import { getProxyMediaUrl } from "@/lib/utils";

interface ProductCardProps {
    product: Glasses;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-3xl bg-white border border-[#e8e3de] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
            <div className="aspect-[4/3] overflow-hidden bg-[#f4ede8] relative">
                <Image
                    src={getProxyMediaUrl(product.thumbnail || '')}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    priority
                    loading="eager"
                />
                <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-[#e86f50] px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        Nuevo
                    </span>
                </div>
                <Link
                    href={`/product/${product.id}`}
                    className="absolute inset-0 flex items-end justify-center pb-6 md:items-center md:justify-center md:pb-0 md:bg-gradient-to-t md:from-[#2d2926]/40 md:to-transparent md:opacity-0 md:group-hover:opacity-100 transition-all duration-300"
                >
                    <span className="flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 md:py-3 text-sm font-bold text-[#2d2926] shadow-xl md:transform md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-300">
                        <Eye className="h-4 w-4 text-[#e86f50]" />
                        Ver Detalles
                    </span>
                </Link>
            </div>

            <div className="p-5 md:p-6">
                <div className="flex justify-between items-start mb-2 md:mb-3">
                    <h3 className="font-display font-semibold text-[#2d2926] line-clamp-1 text-base md:text-lg">{product.name}</h3>
                    <span className="font-display font-bold text-[#e86f50] text-base md:text-lg">${product.price}</span>
                </div>
                <p className="text-sm text-[#8a8582] line-clamp-2 mb-4 md:mb-5 leading-relaxed">
                    {product.description || "Lentes de alta calidad con tecnología de diseño avanzado."}
                </p>
                <Link href={`/product/${product.id}`} className="block">
                    <button className="w-full rounded-2xl bg-[#e86f50] py-3 md:py-3.5 text-sm md:text-base font-bold text-white shadow-lg shadow-[#e86f50]/20 hover:bg-[#d85f40] hover:shadow-[#e86f50]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        <Camera className="h-5 w-5" />
                        Pruébatelos en 3D
                    </button>
                </Link>
            </div>
        </div>
    );
}
