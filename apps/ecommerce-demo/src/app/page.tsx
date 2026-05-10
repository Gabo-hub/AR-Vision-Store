import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Sparkles } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let products = [];
  let error = null;

  try {
    products = await getProducts();
  } catch (e) {
    console.error(e);
    error = "No se pudieron cargar los productos. Asegúrate de que el backend esté corriendo.";
    products = [
      {
        id: 1,
        name: "Classic Aviator Gold",
        description: "Estilo atemporal con montura dorada y cristales polarizados.",
        price: "129.99",
        thumbnail: "https://images.unsplash.com/photo-1572635196237-14b3f281303f?auto=format&fit=crop&q=80&w=800",
        scale_factor: 0.15,
        offset_y: 0.02
      },
      {
        id: 2,
        name: "Modern Wayfarer Black",
        description: "Diseño moderno y versátil ideal para cualquier ocasión.",
        price: "99.50",
        thumbnail: "https://images.unsplash.com/photo-1511499767390-a7395350cbb2?auto=format&fit=crop&q=80&w=800",
        scale_factor: 0.18,
        offset_y: 0.01
      },
      {
        id: 3,
        name: "Retro Round Silver",
        description: "Invocación al estilo retro de los años 70 con acabados premium.",
        price: "145.00",
        thumbnail: "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=800",
        scale_factor: 0.14,
        offset_y: 0.02
      }
    ];
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-20 lg:py-32 border-b-2 border-border">
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary px-4 py-1.5 text-sm font-black uppercase text-white mb-6 border-2 border-border shadow-[var(--shadow-solid-sm)]">
            <Sparkles className="h-4 w-4" />
            Nueva Colección 2024
          </div>
          <h1 className="mb-6 text-5xl font-black uppercase tracking-tighter text-foreground md:text-7xl leading-none">
            Tus próximos lentes favoritos, <br />
            <span className="text-primary border-b-8 border-primary">pruébatelos ahora.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-foreground font-medium mb-10 mt-8">
            Explora nuestra colección premium y usa nuestra tecnología de realidad aumentada para ver exactamente cómo te quedan desde la comodidad de tu casa.
          </p>
        </div>
      </section>

      {/* Catálogo Section */}
      <section className="container mx-auto px-4 py-12 md:py-24">
        <div className="mb-12 flex items-end justify-between border-b-2 border-border pb-4">
          <div>
            <h2 className="text-4xl font-black uppercase text-foreground">Nuestros Lentes</h2>
            <p className="text-foreground font-medium mt-2">Diseñados para tu estilo y confort</p>
          </div>
          <div className="hidden sm:block text-sm font-black uppercase text-primary hover:underline cursor-pointer border-2 border-border px-4 py-2 hover:bg-zinc-100 transition-colors shadow-[var(--shadow-solid-sm)]">
            Ver colección completa →
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-700 border border-amber-200">
            ⚠️ {error} (Mostrando datos de demostración)
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
