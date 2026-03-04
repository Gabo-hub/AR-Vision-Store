'use client';

import { useState } from 'react';
import Link from "next/link";
import { ShoppingCart, User, Search, LogOut, LayoutDashboard, Menu, X, Glasses } from "lucide-react";
import { useLoginModal } from "./LoginModalProvider";
import { useAuth } from "./AuthProvider";

export default function Header() {
    const { showLogin } = useLoginModal();
    const { user, isAdmin, logout, isLoading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#e8e3de]">
                <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-3 md:px-6 lg:px-8">
                    <div className="flex items-center gap-4 md:gap-10">
                        <button 
                            className="md:hidden p-2 -ml-2 text-[#5c5552] hover:text-[#e86f50] transition-colors"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Abrir menú"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <Link href="/" className="text-xl md:text-2xl font-display font-bold tracking-tight text-[#2d2926] hover:opacity-80 transition-opacity">
                            <span className="text-[#e86f50]">◆</span> OpticAR
                        </Link>
                        <nav className="hidden md:flex gap-6 lg:gap-8 text-sm font-medium text-[#5c5552]">
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

                    <div className="flex items-center gap-2 md:gap-4">
                        <button className="p-2 md:p-2.5 text-[#8a8582] hover:text-[#e86f50] hover:bg-[#f4ede8] rounded-full transition-all">
                            <Search className="h-5 w-5" />
                        </button>
                        
                        {isLoading ? (
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#f0ebe5] animate-pulse" />
                        ) : user ? (
                            <div className="flex items-center gap-2">
                                {isAdmin && (
                                    <Link 
                                        href="/admin"
                                        className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#e86f50] hover:bg-[#d85f40] rounded-full shadow-lg shadow-[#e86f50]/20 hover:shadow-[#e86f50]/30 transition-all duration-300"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                )}
                                <button 
                                    onClick={logout}
                                    className="p-2 md:p-2.5 text-[#8a8582] hover:text-[#e54d2E] hover:bg-[#fef2f0] rounded-full transition-all"
                                    title="Cerrar sesión"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <button 
                                    onClick={showLogin}
                                    className="hidden sm:flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-sm font-medium text-white bg-[#e86f50] hover:bg-[#d85f40] rounded-full shadow-lg shadow-[#e86f50]/20 hover:shadow-[#e86f50]/30 transition-all duration-300"
                                >
                                    <User className="h-4 w-4" />
                                    <span>Iniciar sesión</span>
                                </button>
                                <button className="sm:hidden p-2 md:p-2.5 text-[#8a8582] hover:text-[#e86f50] hover:bg-[#f4ede8] rounded-full transition-all" onClick={showLogin}>
                                    <User className="h-5 w-5" />
                                </button>
                            </>
                        )}
                        
                        <button className="relative p-2 md:p-2.5 text-[#8a8582] hover:text-[#e86f50] hover:bg-[#f4ede8] rounded-full transition-all">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="absolute -top-0.5 -right-0.5 md:top-0 md:right-0 h-5 w-5 rounded-full bg-[#e86f50] text-[10px] font-bold text-white flex items-center justify-center">
                                0
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            <div 
                className={`fixed inset-0 z-[90] bg-[#2d2926]/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileMenuOpen(false)}
            />
            
            <div className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[100] shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-[#e8e3de]">
                    <span className="text-xl font-display font-bold text-[#2d2926]">
                        <span className="text-[#e86f50]">◆</span> OpticAR
                    </span>
                    <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 text-[#5c5552] hover:text-[#e86f50] hover:bg-[#f4ede8] rounded-full transition-all"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <nav className="p-4 space-y-2">
                    <Link 
                        href="/" 
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#2d2926] font-medium hover:bg-[#f4ede8] transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Glasses className="h-5 w-5 text-[#e86f50]" />
                        Catálogo
                    </Link>
                    <Link 
                        href="/" 
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#5c5552] font-medium hover:bg-[#f4ede8] transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span className="w-5 text-center font-bold">👨</span>
                        Hombre
                    </Link>
                    <Link 
                        href="/" 
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#5c5552] font-medium hover:bg-[#f4ede8] transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span className="w-5 text-center font-bold">👩</span>
                        Mujer
                    </Link>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#e8e3de]">
                    {user ? (
                        <div className="space-y-2">
                            {isAdmin && (
                                <Link 
                                    href="/admin"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-white bg-[#e86f50] rounded-2xl shadow-lg"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            )}
                            <button 
                                onClick={() => { logout(); setMobileMenuOpen(false); }}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-[#e54d2E] border border-[#e54d2E] rounded-2xl hover:bg-[#fef2f0] transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Cerrar sesión
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => { showLogin(); setMobileMenuOpen(false); }}
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold text-white bg-[#e86f50] rounded-2xl shadow-lg hover:bg-[#d85f40] transition-colors"
                        >
                            <User className="h-4 w-4" />
                            Iniciar sesión
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
