'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LIFF_ROUTES, DEFAULT_LIFF_ID } from '@/app/lib/config';

export const LiffContext = createContext({
    liff: null,
    profile: null,
    isInitialized: false,
    isInLineClient: false,
    error: null,
});

export function useLiff() {
    return useContext(LiffContext);
}

export default function LiffProvider({ children }) {
    const [liffState, setLiffState] = useState({
        liff: null,
        profile: null,
        isInitialized: false,
        isInLineClient: false,
        error: null,
    });
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const initLiff = async () => {
            try {
                // 依路由前綴挑 LIFF ID（設定在 lib/config.js 的 LIFF_ROUTES），找不到就用預設。
                const match = LIFF_ROUTES.find((r) => pathname.startsWith(r.prefix) && r.liffId);
                const liffId = match?.liffId || DEFAULT_LIFF_ID;

                if (!liffId) {
                    console.log('No LIFF ID configured, skipping LIFF init (guest mode).');
                    if (isMounted) setLiffState((p) => ({ ...p, isInitialized: true }));
                    return;
                }

                const liff = (await import('@line/liff')).default;

                // 在 init 前先抓 liff.state / path，因為 init 可能會把它從 URL 移除
                const searchParams = new URL(window.location.href).searchParams;
                let targetPath = searchParams.get('path');
                let rawState = searchParams.get('liff.state');

                const hashParam = window.location.hash;
                let hashPath = null;
                if (hashParam && hashParam.includes('path=')) {
                    const pathMatch = hashParam.match(/path=([^&#]+)/);
                    if (pathMatch && pathMatch[1]) hashPath = decodeURIComponent(pathMatch[1]);
                }

                if (!targetPath) {
                    if (hashPath) {
                        targetPath = hashPath;
                    } else if (rawState) {
                        try {
                            const parsed = new URLSearchParams(rawState.includes('?') ? rawState.substring(rawState.indexOf('?')) : '?' + rawState);
                            targetPath = parsed.get('path');
                        } catch {
                            targetPath = rawState.includes('path=') ? rawState.split('path=')[1].split('&')[0] : rawState;
                        }
                    }
                }
                if (!targetPath) {
                    const m = window.location.href.match(/[?&]path=([^&]+)/);
                    if (m) targetPath = decodeURIComponent(m[1]);
                }

                await liff.init({ liffId });

                if (!isMounted) return;

                const inLineClient = liff.isInClient();
                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    document.cookie = `line_user_id=${profile.userId}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
                    setLiffState({ liff, profile, isInitialized: true, isInLineClient: inLineClient, error: null });
                    if (targetPath && targetPath.startsWith('/') && pathname !== targetPath) {
                        setTimeout(() => router.replace(targetPath), 50);
                    }
                } else if (inLineClient) {
                    liff.login({ redirectUri: window.location.href });
                    setLiffState({ liff, profile: null, isInitialized: true, isInLineClient: true, error: null });
                } else {
                    setLiffState({ liff, profile: null, isInitialized: true, isInLineClient: false, error: null });
                    if (targetPath && targetPath.startsWith('/') && pathname !== targetPath) {
                        setTimeout(() => router.replace(targetPath), 50);
                    }
                }
            } catch (error) {
                console.error('LIFF init failed', error);
                if (isMounted) setLiffState((p) => ({ ...p, error, isInitialized: true }));
            }
        };

        if (typeof window !== 'undefined') initLiff();
        return () => { isMounted = false; };
    }, []);

    return <LiffContext.Provider value={liffState}>{children}</LiffContext.Provider>;
}
