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
        <div className="group relative overflow-hidden bg-background border-2 border-border transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-solid-hover)]">
            <div className="aspect-[4/3] overflow-hidden bg-zinc-100 border-b-2 border-border">
                <Image
                    src={getProxyMediaUrl(product.thumbnail)}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    priority
                    loading="eager"
                />
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-primary px-3 py-1 text-xs font-black uppercase text-white border-2 border-border shadow-[var(--shadow-solid-sm)]">
                        Nuevo
                    </span>
                </div>
                <Link
                    href={`/product/${product.id}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 z-10"
                >
                    <button className="flex items-center gap-2 bg-white px-6 py-2.5 text-sm font-black uppercase text-foreground border-2 border-border shadow-[var(--shadow-solid-btn)] translate-y-4 transition-transform group-hover:translate-y-0 hover:bg-zinc-100">
                        <Eye className="h-4 w-4 stroke-[2.5px]" />
                        Ver Detalles
                    </button>
                </Link>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-foreground line-clamp-1 text-lg uppercase">{product.name}</h3>
                    <span className="font-black text-primary text-lg">${product.price}</span>
                </div>
                <p className="text-sm text-zinc-600 font-medium line-clamp-2 mb-4">
                    {product.description || "Lentes de alta calidad con tecnología de diseño avanzado."}
                </p>
                <Link href={`/product/${product.id}`} className="block">
                    <button className="w-full border-2 border-border py-2.5 text-sm font-black uppercase text-foreground bg-white transition-all hover:bg-primary hover:text-white hover:shadow-[var(--shadow-solid-btn)] active:translate-y-1 active:shadow-none">
                        Pruébatelos en 3D
                    </button>
                </Link>
            </div>
        </div>
    );
}
