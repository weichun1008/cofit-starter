'use client';

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import Navbar from '@/app/components/Navbar';

// 最小 HQ 後台：列出模組、開關啟用。正式環境請在 API 端加角色檢查。
export default function HQPage() {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        const res = await fetch('/api/hq/modules');
        const data = await res.json();
        setModules(data.modules || []);
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    async function toggle(m) {
        await fetch(`/api/hq/modules/${m.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !m.is_active }),
        });
        load();
    }

    return (
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '24px 18px 96px' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                <Settings size={26} />
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>HQ 後台</h1>
            </header>

            {loading ? (
                <p style={{ opacity: .6 }}>載入中…</p>
            ) : modules.length === 0 ? (
                <p style={{ opacity: .6 }}>尚無模組，先打 <code>GET /api/setup</code> 種入預設模組。</p>
            ) : (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {modules.map((m) => (
                        <li key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, border: '1px solid #e5e5e5' }}>
                            <span>{m.name_zh || m.slug} <small style={{ opacity: .5 }}>/{m.slug}</small></span>
                            <button onClick={() => toggle(m)} style={{ padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', background: m.is_active ? '#2e7d4f' : '#bbb', color: '#fff' }}>
                                {m.is_active ? '啟用中' : '已停用'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <Navbar />
        </main>
    );
}
