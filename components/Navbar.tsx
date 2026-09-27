'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, History, Settings, CheckCircle } from 'lucide-react';
import { ApiKeyModal } from './ApiKeyModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="navbar-custom sticky-top">
        <div className="container d-flex align-items-center justify-content-between py-3">
          <Link href="/" className="d-flex align-items-center gap-2 text-decoration-none text-dark brand-link">
            <div className="brand-icon-wrapper">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <span className="brand-title fw-bold fs-5">RealityCheck</span>
              <span className="brand-tagline d-block text-muted small">Cek dulu sebelum dijalankan</span>
            </div>
          </Link>

          <nav className="d-flex align-items-center gap-2">
            <Link
              href="/"
              className={`nav-btn btn btn-sm ${pathname === '/' ? 'btn-primary-subtle active' : 'btn-ghost'}`}
            >
              <CheckCircle size={15} className="me-1.5" />
              <span>Analisis</span>
            </Link>

            <Link
              href="/history"
              className={`nav-btn btn btn-sm ${pathname === '/history' ? 'btn-primary-subtle active' : 'btn-ghost'}`}
            >
              <History size={15} className="me-1.5" />
              <span>Riwayat</span>
            </Link>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="nav-btn btn btn-ghost btn-sm d-inline-flex align-items-center gap-1.5"
              title="Pengaturan AI API"
            >
              <Settings size={15} />
              <span className="d-none d-sm-inline">AI Config</span>
            </button>
          </nav>
        </div>
      </header>

      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => {}}
      />
    </>
  );
};
