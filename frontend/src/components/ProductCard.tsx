import Image from "next/image";
import Link from "next/link";
import { Glasses } from "@/types/glasses";
import { Eye, Sparkles } from "lucide-react";
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
                <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-[#e86f50] px-3.5 py-1.5 text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        Nuevo
                    </span>
                </div>
                <Link
                    href={`/product/${product.id}`}
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#2d2926]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <span className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[#2d2926] shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Eye className="h-4 w-4 text-[#e86f50]" />
                        Ver Detalles
                    </span>
                </Link>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display font-semibold text-[#2d2926] line-clamp-1 text-lg">{product.name}</h3>
                    <span className="font-display font-bold text-[#e86f50] text-lg">${product.price}</span>
                </div>
                <p className="text-sm text-[#8a8582] line-clamp-2 mb-5 leading-relaxed">
                    {product.description || "Lentes de alta calidad con tecnología de diseño avanzado."}
                </p>
                <Link href={`/product/${product.id}`}>
                    <button className="w-full rounded-2xl border-2 border-[#e86f50] py-3 text-sm font-bold text-[#e86f50] transition-all hover:bg-[#e86f50] hover:text-white active:scale-[0.98]">
                        Pruébatelos en 3D
                    </button>
                </Link>
            </div>
        </div>
    );
}
