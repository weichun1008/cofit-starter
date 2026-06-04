'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import { useLanguage } from '@/app/lib/i18n/LanguageContext';
import { useAuth } from '@/app/components/auth/AuthProvider';

// ============================================================
// 範例模組頁 — 複製整個 (services)/example 資料夾來開發新功能。
// 示範：i18n、auth context、呼叫領域 API（/api/items）。
// ============================================================
export default function ExamplePage() {
    const { t } = useLanguage();
    const auth = useAuth?.() || {};
    const [items, setItems] = useState([]);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        const res = await fetch('/api/items');
        const data = await res.json();
        setItems(data.items || []);
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    async function add(e) {
        e.preventDefault();
        if (!title.trim()) return;
        await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) });
        setTitle('');
        load();
    }
    async function remove(id) {
        await fetch(`/api/items/${id}`, { method: 'DELETE' });
        load();
    }

    return (
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '24px 18px 96px' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <Package size={26} />
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>{t('example.title')}</h1>
            </header>
            <p style={{ opacity: .7, marginBottom: 22 }}>{t('example.subtitle')}</p>

            <form onSubmit={add} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('example.itemTitle')}
                    style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid #ccc' }}
                />
                <button type="submit" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer' }}>
                    <Plus size={18} /> {t('common.add')}
                </button>
            </form>

            {loading ? (
                <p style={{ opacity: .6 }}>{t('common.loading')}</p>
            ) : items.length === 0 ? (
                <p style={{ opacity: .6 }}>{t('common.empty')}</p>
            ) : (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map((it) => (
                        <li key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, border: '1px solid #e5e5e5' }}>
                            <span>{it.title}</span>
                            <button onClick={() => remove(it.id)} aria-label="delete" style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: .6 }}>
                                <Trash2 size={18} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <Navbar />
        </main>
    );
}
