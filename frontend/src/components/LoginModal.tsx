'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            await login(email, password);
            onClose();
            setEmail('');
            setPassword('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-[#2d2926]/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e86f50]/10 to-[#f4ede8]/10 rounded-3xl blur-3xl" />
                
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e86f50] to-[#f4a574]" />
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 text-[#8a8582] hover:text-[#2d2926] hover:bg-[#f4ede8] rounded-full transition-all duration-300"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8 pt-10">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#fef6f4] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">👋</span>
                            </div>
                            <h2 className="font-display text-3xl font-bold text-[#2d2926] mb-2">
                                Hola, bienvenido
                            </h2>
                            <p className="text-[#8a8582]">
                                Inicia sesión para continuar
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-4 rounded-xl bg-[#fef6f4] border border-[#fedfd7] text-[#c44d2e] text-sm text-center">
                                    {error}
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#5c5552]">
                                    Usuario
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-[#8a8582] group-focus-within:text-[#e86f50] transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-[#faf8f5] border border-[#e8e3de] rounded-2xl text-[#2d2926] placeholder-[#8a8582] focus:outline-none focus:border-[#e86f50] focus:ring-2 focus:ring-[#e86f50]/10 transition-all duration-300"
                                        placeholder="tu usuario"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#5c5552]">
                                    Contraseña
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-[#8a8582] group-focus-within:text-[#e86f50] transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pl-12 pr-14 py-3.5 bg-[#faf8f5] border border-[#e8e3de] rounded-2xl text-[#2d2926] placeholder-[#8a8582] focus:outline-none focus:border-[#e86f50] focus:ring-2 focus:ring-[#e86f50]/10 transition-all duration-300"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8a8582] hover:text-[#2d2926] transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-[#e8e3de] bg-[#faf8f5] text-[#e86f50] focus:ring-[#e86f50]/20 focus:ring-offset-0"
                                    />
                                    <span className="text-[#8a8582]">Recordarme</span>
                                </label>
                                <button type="button" className="text-[#e86f50] hover:text-[#d85f40] font-medium transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-6 bg-[#e86f50] hover:bg-[#d85f40] text-white font-bold rounded-2xl shadow-lg shadow-[#e86f50]/20 hover:shadow-[#e86f50]/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Iniciando sesión...
                                    </span>
                                ) : (
                                    'Iniciar sesión'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-[#e8e3de]">
                            <p className="text-center text-[#8a8582]">
                                ¿No tienes cuenta?{' '}
                                <button className="text-[#e86f50] hover:text-[#d85f40] font-bold transition-colors">
                                    Regístrate gratis
                                </button>
                            </p>
                        </div>
                    </div>

                    <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#e86f50]/10 rounded-full blur-3xl" />
                    <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#f4ede8] rounded-full blur-3xl" />
                </div>
            </div>
        </div>
    );
}
