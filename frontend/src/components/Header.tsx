import Link from "next/link";
import { ShoppingCart, User, Search } from "lucide-react";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-2xl font-bold tracking-tighter text-blue-600 hover:opacity-90">
                        OpticAR
                    </Link>
                    <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Catálogo</Link>
                        <Link href="/" className="hover:text-blue-600 transition-colors">Hombre</Link>
                        <Link href="/" className="hover:text-blue-600 transition-colors">Mujer</Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                        <Search className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                        <User className="h-5 w-5" />
                    </button>
                    <button className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
                            0
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}
