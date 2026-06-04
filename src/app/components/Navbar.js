'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { useLanguage } from '@/app/lib/i18n/LanguageContext';
import { NAV_ITEMS } from '@/app/lib/config';

export default function Navbar() {
    const pathname = usePathname();
    const { t } = useLanguage();

    return (
        <nav className="bottom-nav">
            <div className="nav-links">
                {NAV_ITEMS.map((item) => {
                    const Icon = Icons[item.icon] || Icons.Circle;
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-link ${active ? 'active' : ''}`}
                        >
                            <span className="nav-icon"><Icon size={22} strokeWidth={active ? 2.4 : 1.8} /></span>
                            {t(item.labelKey)}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
