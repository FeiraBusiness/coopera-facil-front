'use client';

import { AlertCircle, CheckCircle2, Clock3, FileStack, Fish, MessageSquareText, RefreshCw, Users } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import EmptyState from './components/EmptyState';
import Spinner from './components/Spinner';
import { errorMessage, getDashboardSummary } from './lib/api';
import { EXPIRING_THRESHOLD_DAYS, type DashboardSummary } from './lib/types';
import { useAutoRefresh } from './lib/useAutoRefresh';

// Atualiza os indicadores sozinho, para refletir os documentos processados pelo Job.
const REFRESH_INTERVAL_MS = 15000;

// Abaixo disto o vencimento é destacado em vermelho.
const URGENT_DAYS = 30;

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // silent: atualização em segundo plano, sem trocar a tela pelo spinner.
  const loadSummary = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      setSummary(await getDashboardSummary());
      setError(null);
    } catch (err) {
      if (!silent) setError(errorMessage(err, 'Erro ao carregar o dashboard'));
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useAutoRefresh(() => loadSummary(true), REFRESH_INTERVAL_MS);

  if (isLoading) {
    return <Spinner size="lg" />;
  }

  if (error || !summary) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
        <p className="text-red-600 font-semibold">{error ?? 'Erro ao carregar o dashboard'}</p>
        <button
          onClick={() => loadSummary()}
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Tentar novamente
        </button>
      </div>
    );
  }

  const cards = [
    { label: 'Produtores ativos', value: summary.totalProducers, icon: Users, color: 'bg-blue-600', href: '/admin/produtores' },
    { label: 'Licenças vigentes', value: summary.licensesByStatus.vigente, icon: CheckCircle2, color: 'bg-emerald-600', href: '/admin/licencas?status=VIGENTE' },
    { label: `Vencendo em até ${EXPIRING_THRESHOLD_DAYS} dias`, value: summary.licensesByStatus.vencendo, icon: Clock3, color: 'bg-amber-500', href: '/admin/licencas?status=VENCENDO' },
    { label: 'Licenças vencidas', value: summary.licensesByStatus.vencida, icon: AlertCircle, color: 'bg-red-600', href: '/admin/licencas?status=VENCIDA' },
  ];

  const documentCards = [
    { label: 'Pendentes', value: summary.documentsByStatus.pendente, color: 'text-slate-600 bg-slate-100' },
    { label: 'Processando', value: summary.documentsByStatus.processando, color: 'text-blue-700 bg-blue-100' },
    { label: 'Concluídos', value: summary.documentsByStatus.concluido, color: 'text-emerald-700 bg-emerald-100' },
    { label: 'Com erro', value: summary.documentsByStatus.erro, color: 'text-red-700 bg-red-100' },
  ];

  const atRisk = summary.licensesByStatus.vencendo + summary.licensesByStatus.vencida;

  return (
    <div className="space-y-6">
      {/* Cards de totais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">{card.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Produção em risco: o impacto das licenças vencidas ou vencendo */}
      <Link
        href="/admin/licencas?status=VENCENDO"
        className={`flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl p-5 sm:p-6 border transition-colors ${
          summary.productionAtRiskKg > 0
            ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
            : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            summary.productionAtRiskKg > 0 ? 'bg-amber-500' : 'bg-emerald-600'
          }`}
        >
          <Fish className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-600">Produção anual com licença em risco</p>
          <p className="text-3xl font-bold text-slate-900">{formatProduction(summary.productionAtRiskKg)}</p>
        </div>
        <p className="text-sm text-slate-600 sm:max-w-sm">
          {summary.productionAtRiskKg > 0
            ? `Soma da produção declarada em ${atRisk} licença(s) vencida(s) ou vencendo nos próximos ${EXPIRING_THRESHOLD_DAYS} dias.`
            : 'Nenhuma produção com licença vencida ou próxima do vencimento.'}
        </p>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Próximos vencimentos */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Próximos vencimentos</h2>
            <Link href="/admin/licencas?status=VENCENDO" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
              Ver todas
            </Link>
          </div>

          {summary.upcomingExpirations.length === 0 ? (
            <EmptyState title="Nenhum vencimento próximo" description={`Nenhuma licença vence nos próximos ${EXPIRING_THRESHOLD_DAYS} dias.`} icon={CheckCircle2} />
          ) : (
            <div className="space-y-2">
              {summary.upcomingExpirations.map((item) => {
                const urgent = item.daysRemaining <= URGENT_DAYS;
                return (
                  <Link
                    key={item.licenseId}
                    href={`/admin/licencas/${item.licenseId}`}
                    className={`flex items-center justify-between gap-4 p-4 rounded-xl border-l-4 transition-colors ${
                      urgent ? 'bg-red-50 border-red-500 hover:bg-red-100' : 'bg-amber-50 border-amber-500 hover:bg-amber-100'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{item.producerName}</p>
                      <p className="text-xs text-slate-500">{item.licenseType}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${urgent ? 'text-red-700' : 'text-amber-700'}`}>
                        {item.daysRemaining} dia{item.daysRemaining !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(item.expirationDate)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Fila de documentos */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Fila do WhatsApp</h2>
            <Link href="/admin/documentos" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
              Ver fila
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {documentCards.map((card) => (
              <div key={card.label} className={`rounded-xl p-4 ${card.color}`}>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs font-semibold mt-1">{card.label}</p>
              </div>
            ))}
          </div>
          <Link
            href="/admin/documentos"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <MessageSquareText className="w-4 h-4" />
            Abrir fila completa
          </Link>
          <Link
            href="/admin/produtores"
            className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            <FileStack className="w-4 h-4" />
            Gerenciar produtores
          </Link>
        </div>
      </div>
    </div>
  );
}