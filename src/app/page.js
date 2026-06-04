'use client';

import Link from 'next/link';
import { LayoutGrid, Settings, ArrowRight } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import { APP } from '@/app/lib/config';

export default function Home() {
    return (
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '48px 18px 96px' }}>
            <p style={{ letterSpacing: 3, textTransform: 'uppercase', fontSize: 12, opacity: .6 }}>Starter</p>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: '6px 0 10px' }}>{APP.name}</h1>
            <p style={{ opacity: .7, lineHeight: 1.7, marginBottom: 28 }}>{APP.description}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="/example" style={card}>
                    <LayoutGrid size={22} />
                    <span style={{ flex: 1 }}>範例模組 — 從這裡開始複製</span>
                    <ArrowRight size={18} />
                </Link>
                <Link href="/hq" style={card}>
                    <Settings size={22} />
                    <span style={{ flex: 1 }}>HQ 後台 — 模組開關 / 排序</span>
                    <ArrowRight size={18} />
                </Link>
            </div>

            <Navbar />
        </main>
    );
}

const card = {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '18px 18px', borderRadius: 16, border: '1px solid #e5e5e5',
    textDecoration: 'none', color: 'inherit',
};
