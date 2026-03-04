'use client';

import Link from "next/link";
import { ShoppingCart, User, Search, LogOut, LayoutDashboard } from "lucide-react";
import { useLoginModal } from "./LoginModalProvider";
import { useAuth } from "./AuthProvider";

export default function Header() {
    const { showLogin } = useLoginModal();
    const { user, isAdmin, logout, isLoading } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#e8e3de]">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-10">
                    <Link href="/" className="text-2xl font-display font-bold tracking-tight text-[#2d2926] hover:opacity-80 transition-opacity">
                        <span className="text-[#e86f50]">◆</span> OpticAR
                    </Link>
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-[#5c5552]">
                        <Link href="/" className="hover:text-[#e86f50] transition-colors relative group">
                            Catálogo
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#e86f50] transition-all group-hover:w-full" />
                        </Link>
                        <Link href="/" className="hover:text-[#e86f50] transition-colors relative group">
                            Hombre
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#e86f50] transition-all group-hover:w-full" />
                        </Link>
                        <Link href="/" className="hover:text-[#e86f50] transition-colors relative group">
                            Mujer
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#e86f50] transition-all group-hover:w-full" />
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    <button className="p-2.5 text-[#8a8582] hover:text-[#e86f50] hover:bg-[#f4ede8] rounded-full transition-all">
                        <Search className="h-5 w-5" />
                    </button>
                    
                    {isLoading ? (
                        <div className="w-9 h-9 rounded-full bg-[#f0ebe5] animate-pulse" />
                    ) : user ? (
                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <Link 
                                    href="/admin"
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#e86f50] hover:bg-[#d85f40] rounded-full shadow-lg shadow-[#e86f50]/20 hover:shadow-[#e86f50]/30 transition-all duration-300"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </Link>
                            )}
                            <button 
                                onClick={logout}
                                className="p-2.5 text-[#8a8582] hover:text-[#e54d2E] hover:bg-[#fef2f0] rounded-full transition-all"
                                title="Cerrar sesión"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={showLogin}
                                className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#e86f50] hover:bg-[#d85f40] rounded-full shadow-lg shadow-[#e86f50]/20 hover:shadow-[#e86f50]/30 transition-all duration-300"
                            >
                                <User className="h-4 w-4" />
                                <span>Iniciar sesión</span>
                            </button>
                            <button className="sm:hidden p-2.5 text-[#8a8582] hover:text-[#e86f50] hover:bg-[#f4ede8] rounded-full transition-all" onClick={showLogin}>
                                <User className="h-5 w-5" />
                            </button>
                        </>
                    )}
                    
                    <button className="relative p-2.5 text-[#8a8582] hover:text-[#e86f50] hover:bg-[#f4ede8] rounded-full transition-all">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-[#e86f50] text-[10px] font-bold text-white flex items-center justify-center">
                            0
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}
