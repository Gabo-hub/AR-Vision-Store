import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Sparkles } from "lucide-react";

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
      <section className="relative overflow-hidden bg-white py-20 lg:py-32">
        <div className="absolute inset-x-0 top-[-10%] h-[1000px] w-full bg-[radial-gradient(100%_50%_at_50%_0%,rgba(37,99,235,0.05)_0,rgba(37,99,235,0)_50%,rgba(37,99,235,0)_100%)]" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 mb-6">
            <Sparkles className="h-4 w-4" />
            Nueva Colección 2024
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 md:text-7xl">
            Tus próximos lentes favoritos, <br />
            <span className="text-blue-600">pruébatelos ahora.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 mb-10">
            Explora nuestra colección premium y usa nuestra tecnología de realidad aumentada para ver exactamente cómo te quedan desde la comodidad de tu casa.
          </p>
        </div>
      </section>

      {/* Catálogo Section */}
      <section className="container mx-auto px-4 py-12 md:py-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Nuestros Lentes</h2>
            <p className="text-gray-500">Diseñados para tu estilo y confort</p>
          </div>
          <div className="hidden sm:block text-sm font-medium text-blue-600 hover:underline cursor-pointer">
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
