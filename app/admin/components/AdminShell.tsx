'use client';

import { FileStack, LayoutDashboard, Menu, MessageSquareText, Users, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/produtores', label: 'Produtores', icon: Users, exact: false },
  { href: '/admin/licencas', label: 'Licenças', icon: FileStack, exact: false },
  { href: '/admin/documentos', label: 'Documentos', icon: MessageSquareText, exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              active ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeItem = NAV_ITEMS.find((item) => isActive(pathname, item.href, item.exact));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r border-slate-200 px-4 py-6">
        <div className="px-2 mb-8">
          <Image src="/logo_completa.svg" alt="CooperaFácil" width={160} height={40} priority />
        </div>
        <NavLinks pathname={pathname} />
        <div className="mt-auto px-2 pt-6 text-xs text-slate-400">Painel administrativo · v1</div>
      </aside>

      {/* Off-canvas mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="relative w-72 max-w-[80vw] h-full bg-white shadow-2xl px-4 py-6 flex flex-col animate-slide-up">
            <div className="flex items-center justify-between mb-8 px-2">
              <Image src="/logo_completa.svg" alt="CooperaFácil" width={140} height={36} />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">{activeItem?.label ?? 'Painel'}</h1>
        </header>
        <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
