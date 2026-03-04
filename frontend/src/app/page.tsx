import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

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
      <section className="relative overflow-hidden bg-white py-24 lg:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#fef6f4] via-white to-white" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#e86f50]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#e86f50]/5 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fef6f4] px-5 py-2 text-sm font-bold text-[#e86f50] mb-8 animate-fade-in-up opacity-0">
              <Sparkles className="h-4 w-4" />
              Nueva Colección 2024
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold text-[#2d2926] mb-6 animate-fade-in-up opacity-0 stagger-1 leading-tight">
              Tus próximos lentes favoritos,{' '}
              <span className="text-[#e86f50]">pruébatelos ahora.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#5c5552] mb-10 leading-relaxed animate-fade-in-up opacity-0 stagger-2">
              Explora nuestra colección premium y usa nuestra tecnología de realidad aumentada para ver exactamente cómo te quedan. Sin moverte de casa.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up opacity-0 stagger-3">
              <Link 
                href="#catalog"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e86f50] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#e86f50]/20 hover:shadow-[#e86f50]/30 hover:bg-[#d85f40] transition-all"
              >
                Ver Colección
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="catalog" className="container mx-auto px-4 py-16 md:py-24">
        <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#2d2926] mb-2">Nuestros Lentes</h2>
            <p className="text-[#8a8582] text-lg">Diseñados para tu estilo y confort</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-[#e86f50] font-bold hover:gap-3 transition-all">
            Ver colección completa
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {error && (
          <div className="mb-10 rounded-2xl bg-[#fef6f4] p-5 text-sm text-[#c44d2e] border border-[#fedfd7]">
            ⚠️ {error} (Mostrando datos de demostración)
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
          {products.map((product: any, index: number) => (
            <div key={product.id} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f4ede8] py-20 mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#2d2926] mb-4">
              ¿Necesitas ayuda para elegir?
            </h2>
            <p className="text-[#5c5552] text-lg mb-8">
             Nuestro equipo está listo para ayudarte a encontrar los lentes perfectos para tu rostro y estilo.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#e86f50] px-8 py-3 text-base font-bold text-[#e86f50] hover:bg-[#e86f50] hover:text-white transition-all"
            >
              Chatear con nosotros
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
