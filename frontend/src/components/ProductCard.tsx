import Image from "next/image";
import Link from "next/link";
import { Glasses } from "@/types/glasses";
import { Eye } from "lucide-react";
import { getProxyMediaUrl } from "@/lib/utils";

interface ProductCardProps {
    product: Glasses;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                <Image
                    src={getProxyMediaUrl(product.thumbnail)}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    priority
                    loading="eager"
                />
                <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                        Nuevo
                    </span>
                </div>
                <Link
                    href={`/product/${product.id}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100"
                >
                    <button className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-gray-900 shadow-lg translate-y-4 transition-transform group-hover:translate-y-0">
                        <Eye className="h-4 w-4" />
                        Ver Detalles
                    </button>
                </Link>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                    <span className="font-bold text-blue-600">${product.price}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {product.description || "Lentes de alta calidad con tecnología de diseño avanzado."}
                </p>
                <Link href={`/product/${product.id}`}>
                    <button className="w-full rounded-xl border-2 border-blue-600 py-2.5 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-600 hover:text-white active:scale-[0.98]">
                        Pruébatelos en 3D
                    </button>
                </Link>
            </div>
        </div>
    );
}
