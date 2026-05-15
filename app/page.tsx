import { FileStack, LayoutDashboard, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const ENTRY_POINTS = [
  {
    href: '/cooperado',
    title: 'Área do Cooperado',
    description: 'Acompanhe o andamento e os documentos das suas licenças ambientais.',
    icon: Users,
    accent: 'bg-emerald-600',
  },
  {
    href: '/cooperativa',
    title: 'Área da Cooperativa',
    description: 'Visão geral dos cooperados, status de conformidade e estimativas.',
    icon: FileStack,
    accent: 'bg-blue-600',
  },
  {
    href: '/admin',
    title: 'Painel Administrativo',
    description: 'Gestão de produtores, licenças e fila de documentos do WhatsApp.',
    icon: LayoutDashboard,
    accent: 'bg-slate-800',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-slate-100 flex flex-col">
      <header className="flex items-center justify-center py-10">
        <Image src="/logo_completa.svg" alt="CooperaFácil" width={220} height={55} priority />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Bem-vindo ao CooperaFácil</h1>
            <p className="text-slate-500 mt-2">Escolha como deseja acessar a plataforma</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ENTRY_POINTS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.accent} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1.5">{item.title}</h2>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
