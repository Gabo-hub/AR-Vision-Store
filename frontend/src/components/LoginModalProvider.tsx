'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import LoginModal from './LoginModal';

interface LoginModalContextType {
    showLogin: () => void;
    hideLogin: () => void;
}

const LoginModalContext = createContext<LoginModalContextType | null>(null);

export function useLoginModal() {
    const context = useContext(LoginModalContext);
    if (!context) {
        throw new Error('useLoginModal must be used within LoginModalProvider');
    }
    return context;
}

export function LoginModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <LoginModalContext.Provider value={{ showLogin: () => setIsOpen(true), hideLogin: () => setIsOpen(false) }}>
            {children}
            <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </LoginModalContext.Provider>
    );
}
