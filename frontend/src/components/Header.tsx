'use client';

import Link from "next/link";
import { ShoppingCart, User, Search, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from '@/components/providers/AuthProvider';

export default function Header() {
    const { user, logout } = useAuth();
    return (
        <header className="sticky top-0 z-50 w-full bg-background border-b-2 border-border">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-2xl font-black tracking-tighter text-foreground uppercase hover:opacity-80 transition-opacity">
                        OpticAR
                    </Link>
                    <nav className="hidden md:flex gap-8 text-sm font-bold text-foreground">
                        <Link href="/" className="hover:underline underline-offset-4 decoration-2 transition-all">Catálogo</Link>
                        <Link href="/" className="hover:underline underline-offset-4 decoration-2 transition-all">Hombre</Link>
                        <Link href="/" className="hover:underline underline-offset-4 decoration-2 transition-all">Mujer</Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 text-foreground hover:bg-border hover:text-background transition-colors border-2 border-transparent hover:border-border">
                        <Search className="h-5 w-5 stroke-[2.5px]" />
                    </button>
                    {user ? (
                        <div className="flex items-center gap-2">
                            {user.is_staff && (
                                <Link href="/admin" className="p-2 text-foreground hover:bg-border hover:text-background transition-colors border-2 border-transparent hover:border-border" title="Panel de Administración">
                                    <LayoutDashboard className="h-5 w-5 stroke-[2.5px]" />
                                </Link>
                            )}
                            <button onClick={logout} className="p-2 text-foreground hover:bg-border hover:text-background transition-colors border-2 border-transparent hover:border-border" title="Cerrar sesión">
                                <LogOut className="h-5 w-5 stroke-[2.5px]" />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="p-2 text-foreground hover:bg-border hover:text-background transition-colors border-2 border-transparent hover:border-border" title="Iniciar sesión">
                            <User className="h-5 w-5 stroke-[2.5px]" />
                        </Link>
                    )}
                    <button className="relative p-2 text-foreground hover:bg-border hover:text-background transition-colors border-2 border-transparent hover:border-border group">
                        <ShoppingCart className="h-5 w-5 stroke-[2.5px]" />
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-[11px] font-bold text-white flex items-center justify-center border-2 border-border group-hover:border-white">
                            0
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}
