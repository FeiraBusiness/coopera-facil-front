'use client';

import { FileStack, LayoutDashboard, Menu, MessageSquareText, Users, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/admin/produtores', label: 'Produtores', icon: Users, exact: false },
  { href: '/admin/licencas', label: 'Licenças', icon: FileStack, exact: false },
  { href: '/admin/documentos', label: 'Documentos recebidos', icon: MessageSquareText, exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg text-[15px] transition-colors ${
              active ? 'bg-lavanda-clara text-marinho font-semibold' : 'text-slate-600 hover:bg-nevoa hover:text-tinta'
            }`}
          >
            {/* Marcador do item atual: a faixa lavanda do logo. */}
            {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-lavanda" aria-hidden="true" />}
            <Icon className="w-[18px] h-[18px] shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ width = 168 }: { width?: number }) {
  return (
    <Link href="/" className="block px-2" aria-label="Coopera Fácil - página inicial">
      <Image src="/logo_completa.svg" alt="Coopera Fácil" width={width} height={Math.round(width / 6.6)} priority />
    </Link>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeItem = NAV_ITEMS.find((item) => isActive(pathname, item.href, item.exact));

  return (
    <div className="min-h-screen bg-nevoa">
      {/* Menu lateral (desktop) */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r border-linha px-4 py-7">
        <div className="mb-9">
          <Brand />
        </div>
        <NavLinks pathname={pathname} />
        <p className="mt-auto px-2 text-xs text-slate-400">Painel da cooperativa</p>
      </aside>

      {/* Menu lateral (celular) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-tinta/50" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="relative w-72 max-w-[80vw] h-full bg-white shadow-lg px-4 py-6 flex flex-col animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <Brand width={140} />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-nevoa cursor-pointer"
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
        <header className="sticky top-0 z-30 bg-nevoa/90 backdrop-blur-sm px-4 sm:px-8 pt-6 pb-4 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-white cursor-pointer"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-tinta [font-stretch:112%]">{activeItem?.label ?? 'Painel'}</h1>
        </header>
        <main className="px-4 sm:px-8 pb-10 w-full max-w-[2000px]">{children}</main>
      </div>
    </div>
  );
}