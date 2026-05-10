'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/accounts/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await res.json();
            await login(data.access, data.refresh);
            router.push('/admin'); // Redirect to admin dashboard
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex bg-background h-screen items-center justify-center p-4">
            <div className="bg-white p-8 border-2 border-border shadow-[var(--shadow-solid-hover)] w-full max-w-md">
                <h2 className="text-3xl font-black uppercase mb-6 text-center text-foreground">Iniciar Sesión</h2>
                {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-black uppercase text-foreground mb-1">Usuario</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border-2 border-border focus:ring-0 focus:border-primary transition-colors outline-none bg-zinc-50 font-medium"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black uppercase text-foreground mb-1 mt-4">Contraseña</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 border-2 border-border focus:ring-0 focus:border-primary transition-colors outline-none bg-zinc-50 font-medium"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white font-black uppercase py-3.5 border-2 border-border shadow-[var(--shadow-solid-btn)] hover:-translate-y-1 hover:shadow-[var(--shadow-solid-hover)] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 mt-8"
                    >
                        {isLoading ? 'Cargando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
