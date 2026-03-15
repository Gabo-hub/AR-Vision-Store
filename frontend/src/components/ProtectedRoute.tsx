'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (requireAdmin && !user.is_staff) {
                router.push('/');
            }
        }
    }, [user, loading, router, requireAdmin]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center font-medium text-slate-500">Cargando datos...</div>;
    }

    if (!user || (requireAdmin && !user.is_staff)) {
        return null; // Will redirect shortly
    }

    return <>{children}</>;
}
