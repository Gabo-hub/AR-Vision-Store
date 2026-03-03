'use client';

import Link from "next/link";
import { ShoppingCart, User, Search, LogOut, LayoutDashboard } from "lucide-react";
import { useLoginModal } from "./LoginModalProvider";
import { useAuth } from "./AuthProvider";

export default function Header() {
    const { showLogin } = useLoginModal();
    const { user, isAdmin, logout, isLoading } = useAuth();

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

                <div className="flex items-center gap-2 sm:gap-4">
                    <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                        <Search className="h-5 w-5" />
                    </button>
                    
                    {isLoading ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                    ) : user ? (
                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <Link 
                                    href="/admin"
                                    className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-full shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </Link>
                            )}
                            <button 
                                onClick={logout}
                                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                title="Cerrar sesión"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={showLogin}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-full shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
                            >
                                <User className="h-4 w-4" />
                                <span>Iniciar sesión</span>
                            </button>
                            <button className="sm:hidden p-2 text-gray-500 hover:text-blue-600 transition-colors" onClick={showLogin}>
                                <User className="h-5 w-5" />
                            </button>
                        </>
                    )}
                    
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
