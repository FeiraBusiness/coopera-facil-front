'use client';

import { LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Moldura da área do cooperado: pensada para o celular do produtor, coluna estreita e botões grandes.
export default function CooperadoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Fora da tela de entrada, já existe um produtor identificado: mostra a opção de trocar.
  const identificado = pathname !== '/cooperado';

  return (
    <div className="min-h-screen bg-nevoa flex flex-col">
      <header className="bg-white border-b border-linha">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Link href="/" aria-label="Coopera Fácil - página inicial">
            <Image src="/logo_completa.svg" alt="Coopera Fácil" width={150} height={23} priority />
          </Link>
          {identificado ? (
            <Link
              href="/cooperado"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-marinho"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sair
            </Link>
          ) : (
            <span className="text-sm font-semibold text-marinho">Área do cooperado</span>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-8">{children}</main>
    </div>
  );
}