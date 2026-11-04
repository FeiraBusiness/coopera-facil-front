'use client';

import { CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import EmptyState from './components/EmptyState';
import Spinner from './components/Spinner';
import ValidityRuler from './components/ValidityRuler';
import { errorMessage, getDashboardSummary, getLicenses } from './lib/api';
import { EXPIRING_THRESHOLD_DAYS, type DashboardSummary, type License } from './lib/types';
import { useAutoRefresh } from './lib/useAutoRefresh';

// Atualiza os indicadores sozinho, para refletir os documentos processados pelo Job.
const REFRESH_INTERVAL_MS = 15000;

// Abaixo disto o vencimento é destacado em vermelho.
const URGENT_DAYS = 30;

// Divisórias da faixa de totais: 2 colunas no celular/tablet, 4 colunas em telas largas.
const TOTAL_BORDERS = ['', 'border-l', 'border-t xl:border-t-0 xl:border-l', 'border-l border-t xl:border-t-0'];

// Licenças plotadas na régua (a API limita a página a 100).
const RULER_SIZE = 100;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// 45000 kg -> "45 t"; abaixo de 1 tonelada mostra em kg.
function formatProduction(kg: number) {
  if (kg >= 1000) {
    return `${(kg / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t`;
  }
  return `${kg.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`;
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // silent: atualização em segundo plano, sem trocar a tela pelo spinner.
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [summaryData, licensePage] = await Promise.all([
        getDashboardSummary(),
        getLicenses({ page: 0, size: RULER_SIZE }),
      ]);
      setSummary(summaryData);
      setLicenses(licensePage.content);
      setError(null);
    } catch (err) {
      if (!silent) setError(errorMessage(err, 'Erro ao carregar a visão geral'));
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useAutoRefresh(() => loadData(true), REFRESH_INTERVAL_MS);

  if (isLoading) {
    return <Spinner size="lg" />;
  }

  if (error || !summary) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-linha">
        <p className="text-vencida font-semibold">{error ?? 'Erro ao carregar a visão geral'}</p>
        <button
          onClick={() => loadData()}
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-marinho text-white text-sm font-semibold hover:bg-marinho-escuro cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Tentar novamente
        </button>
      </div>
    );
  }

  const totals = [
    { label: 'Produtores ativos', value: summary.totalProducers, dot: 'bg-marinho', href: '/admin/produtores' },
    { label: 'Licenças vigentes', value: summary.licensesByStatus.vigente, dot: 'bg-vigente', href: '/admin/licencas?status=VIGENTE' },
    { label: `Vencendo em até ${EXPIRING_THRESHOLD_DAYS} dias`, value: summary.licensesByStatus.vencendo, dot: 'bg-vencendo', href: '/admin/licencas?status=VENCENDO' },
    { label: 'Licenças vencidas', value: summary.licensesByStatus.vencida, dot: 'bg-vencida', href: '/admin/licencas?status=VENCIDA' },
  ];

  const queue = [
    { label: 'Aguardando leitura', value: summary.documentsByStatus.pendente + summary.documentsByStatus.processando, color: 'text-marinho' },
    { label: 'Licenças geradas', value: summary.documentsByStatus.concluido, color: 'text-vigente' },
    { label: 'Com erro', value: summary.documentsByStatus.erro, color: 'text-vencida' },
  ];

  const atRisk = summary.licensesByStatus.vencendo + summary.licensesByStatus.vencida;

  return (
    <div className="space-y-5">
      {/* Totais: uma faixa só, dividida, em vez de cartões soltos */}
      <section className="bg-white rounded-2xl border border-linha grid grid-cols-2 xl:grid-cols-4">
        {totals.map((item, index) => (
          <Link
            key={item.label}
            href={item.href}
            className={`group px-6 py-5 border-linha hover:bg-nevoa/60 transition-colors ${TOTAL_BORDERS[index]}`}
          >
            <p className="numeral text-5xl text-tinta">{item.value}</p>
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-600 group-hover:text-tinta">
              <span className={`w-2 h-2 rounded-full ${item.dot}`} aria-hidden="true" />
              {item.label}
            </p>
          </Link>
        ))}
      </section>

      {/* Régua de vencimentos: o elemento central da tela */}
      <section className="bg-white rounded-2xl border border-linha p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-tinta">Vencimentos nos próximos 12 meses</h2>
            <p className="text-sm text-slate-500 mt-0.5">Cada ponto é uma licença. Clique para abrir.</p>
          </div>
          <div className="md:text-right">
            <p className={`numeral text-3xl ${summary.productionAtRiskKg > 0 ? 'text-vencendo' : 'text-vigente'}`}>
              {formatProduction(summary.productionAtRiskKg)}
            </p>
            <p className="text-sm text-slate-600 mt-1 md:max-w-sm">
              {summary.productionAtRiskKg > 0
                ? `de produção anual em ${atRisk} licença${atRisk !== 1 ? 's' : ''} vencida${atRisk !== 1 ? 's' : ''} ou vencendo`
                : 'de produção com licença vencida ou vencendo'}
            </p>
          </div>
        </div>
        <ValidityRuler licenses={licenses} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Próximos vencimentos */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-linha p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-tinta">Renovar primeiro</h2>
            <Link href="/admin/licencas?status=VENCENDO" className="text-sm font-semibold text-marinho hover:text-marinho-escuro">
              Ver licenças vencendo
            </Link>
          </div>

          {summary.upcomingExpirations.length === 0 ? (
            <EmptyState title="Nenhuma licença no prazo de renovação" description={`Nenhuma licença vence nos próximos ${EXPIRING_THRESHOLD_DAYS} dias.`} icon={CheckCircle2} />
          ) : (
            <ul className="divide-y divide-linha">
              {summary.upcomingExpirations.map((item) => {
                const urgent = item.daysRemaining <= URGENT_DAYS;
                return (
                  <li key={item.licenseId}>
                    <Link
                      href={`/admin/licencas/${item.licenseId}`}
                      className="group flex items-center gap-4 py-3.5 -mx-2 px-2 rounded-lg hover:bg-nevoa/60 transition-colors"
                    >
                      <div className={`w-16 shrink-0 text-right ${urgent ? 'text-vencida' : 'text-vencendo'}`}>
                        <span className="numeral text-2xl">{item.daysRemaining}</span>
                        <span className="block text-[11px] font-semibold">dia{item.daysRemaining !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-tinta truncate">{item.producerName}</p>
                        <p className="text-sm text-slate-500 truncate">
                          {item.licenseType}, vence em {formatDate(item.expirationDate)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-marinho shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Fila de documentos do WhatsApp */}
        <section className="bg-white rounded-2xl border border-linha p-6 flex flex-col">
          <h2 className="text-lg font-bold text-tinta">Recebidos pelo WhatsApp</h2>
          <dl className="mt-4 space-y-3 flex-1">
            {queue.map((item) => (
              <div key={item.label} className="flex items-baseline justify-between gap-3">
                <dt className="text-sm text-slate-600">{item.label}</dt>
                <dd className={`numeral text-2xl ${item.color}`}>{item.value}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/admin/documentos"
            className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-marinho text-white text-sm font-semibold hover:bg-marinho-escuro transition-colors"
          >
            Ver documentos recebidos
          </Link>
        </section>
      </div>
    </div>
  );
}