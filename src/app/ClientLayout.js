'use client';

import { useEffect } from 'react';
import { LanguageProvider } from '@/app/lib/i18n/LanguageContext';
import LiffProvider from '@/app/components/liff/LiffProvider';
import AuthProvider from '@/app/components/auth/AuthProvider';
import { ModuleProvider } from '@/app/components/modules/ModuleProvider';

// Ensure a user ID cookie exists before any API calls
function ensureUserId() {
    if (typeof document === 'undefined') return;
    const cookies = document.cookie.split(';').map(c => c.trim());
    const existing = cookies.find(c => c.startsWith('supplement_user_id='));
    if (!existing) {
        const id = crypto.randomUUID();
        document.cookie = `supplement_user_id=${id}; path=/; max-age=${60 * 60 * 24 * 365 * 5}; samesite=lax`;
    }
}

export default function ClientLayout({ children }) {
    useEffect(() => {
        ensureUserId();
    }, []);

    return (
        <LiffProvider>
            <AuthProvider>
                <ModuleProvider>
                    <LanguageProvider>
                        {children}
                    </LanguageProvider>
                </ModuleProvider>
            </AuthProvider>
        </LiffProvider>
    );
}

