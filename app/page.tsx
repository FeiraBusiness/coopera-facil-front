'use client';

import { ArrowUpRight, Bot, MessageCircle, BellRing } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { getDashboardSummary } from './admin/lib/api';
import { EXPIRING_THRESHOLD_DAYS, type DashboardSummary } from './admin/lib/types';
import { useAutoRefresh } from './admin/lib/useAutoRefresh';

// Tela de abertura: fica exposta no monitor do evento, com os números da base atualizando sozinhos.
const REFRESH_INTERVAL_MS = 15000;

const STEPS = [
  { icon: MessageCircle, title: 'O produtor envia a licença pelo WhatsApp', text: 'O PDF da licença, sem cadastro em aplicativo.' },  { icon: Bot, title: 'A leitura é automática', text: 'Validade, titular, espécies e produção são extraídos do documento.' },
  { icon: BellRing, title: 'A cooperativa acompanha os prazos', text: `Alerta a partir de ${EXPIRING_THRESHOLD_DAYS} dias do vencimento, no prazo da renovação.` },
];

const AREAS = [{ href: '/cooperado', title: 'Área do cooperado', text: 'O produtor consulta as próprias licenças e prazos pelo CPF.' }];
function formatProduction(kg: number) {
  if (kg >= 1000) {
    return `${(kg / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t`;
  }
  return `${kg.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`;
}

export default function Home() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  // Sem API no ar, a tela continua de pé: só os números não aparecem.
  const loadSummary = useCallback(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useAutoRefresh(loadSummary, REFRESH_INTERVAL_MS);

  const numbers = summary
    ? [
        { value: summary.totalLicenses, label: 'licenças acompanhadas', color: 'text-marinho' },
        { value: summary.licensesByStatus.vencendo, label: 'no prazo de renovação', color: 'text-vencendo' },
        { value: summary.licensesByStatus.vencida, label: summary.licensesByStatus.vencida === 1 ? 'vencida' : 'vencidas', color: 'text-vencida' },
        { value: formatProduction(summary.productionAtRiskKg), label: 'de produção anual com licença em risco', color: 'text-vencendo' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-nevoa flex flex-col">
      {/* Tamanhos e espaços acompanham a altura da tela (vh): cabe inteira no notebook e na TV. */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-20 py-[clamp(1.5rem,4vh,3.5rem)] flex flex-col">
        <header className="flex items-center justify-between gap-6">
          <Image src="/logo_completa.svg" alt="Coopera Fácil" width={300} height={45} priority className="w-[clamp(12rem,22vh,18rem)] h-auto" />
          {summary && (
            <span className="hidden sm:inline-flex items-center gap-2 text-sm text-slate-500">
              <span className="w-2 h-2 rounded-full bg-vigente animate-pulse" aria-hidden="true" />
              Dados da base em tempo real
            </span>
          )}
        </header>

        <main className="flex-1 flex flex-col justify-center py-[clamp(1.5rem,5vh,4rem)]">
          <div className="grid gap-[clamp(1.5rem,4vh,3rem)] xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
            <div>
              <h1 className="text-tinta font-bold leading-[1.02] [font-stretch:115%] text-[clamp(2.25rem,min(5.6vw,8.5vh),5.5rem)] max-w-[17ch] text-balance">
                Licenças ambientais da piscicultura em dia.
              </h1>
              <p className="mt-[clamp(1rem,2.5vh,1.5rem)] text-slate-600 text-[clamp(1rem,min(1.6vw,2.4vh),1.5rem)] max-w-[46ch] leading-relaxed">
                Cada produtor envia a licença pelo WhatsApp e a cooperativa sabe quando cada uma vence, antes que a produção pare.
              </p>
            </div>

            {numbers.length > 0 && (
              <dl className="grid grid-cols-2 gap-px rounded-2xl overflow-hidden border border-linha bg-linha">
                {numbers.map((item) => (
                  <div key={item.label} className="bg-white px-6 py-[clamp(1rem,2.6vh,1.5rem)] flex flex-col-reverse justify-end">
                    <dt className="mt-2 text-slate-600 text-[clamp(0.9rem,min(1.1vw,1.8vh),1.1rem)] max-w-[22ch]">{item.label}</dt>
                    <dd className={`numeral text-[clamp(2.25rem,min(4vw,6.5vh),4.25rem)] ${item.color}`}>{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Como funciona: é uma sequência de verdade, por isso numerada */}
          <ol className="mt-[clamp(1.5rem,5vh,3.5rem)] grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex gap-4">
                  <span className="numeral text-2xl text-lavanda w-6 shrink-0">{index + 1}</span>
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-tinta text-[clamp(1rem,1.25vw,1.2rem)]">
                      <Icon className="w-5 h-5 text-marinho shrink-0" aria-hidden="true" />
                      {step.title}
                    </p>
                    <p className="mt-1 text-slate-600">{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </main>

        <footer className="flex flex-col lg:flex-row lg:items-stretch gap-4">
          <Link
            href="/admin"
            className="group flex items-center justify-between gap-6 rounded-2xl bg-marinho text-white px-7 py-[clamp(1rem,2.6vh,1.5rem)] lg:w-[50%] hover:bg-marinho-escuro transition-colors"
          >
            <div>
              <p className="text-xl font-bold">Painel da cooperativa</p>
              <p className="text-white/75 mt-1">Produtores, licenças, documentos recebidos e vencimentos.</p>
            </div>
            <ArrowUpRight className="w-7 h-7 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
          {AREAS.map((area) => (
            <Link
              key={area.href}
              href={area.href}
              className="flex-1 rounded-2xl bg-white border border-linha px-7 py-[clamp(1rem,2.6vh,1.5rem)] hover:border-lavanda transition-colors"
            >
              <p className="text-lg font-semibold text-tinta">{area.title}</p>
              <p className="text-slate-600 mt-1">{area.text}</p>
            </Link>
          ))}
        </footer>
      </div>
    </div>
  );
}