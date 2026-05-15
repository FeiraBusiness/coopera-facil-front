import type { DocumentStatus, LicenseStatus } from '../lib/types';

type AnyStatus = LicenseStatus | DocumentStatus | 'ATIVO' | 'INATIVO';

const STYLES: Record<AnyStatus, string> = {
  VIGENTE: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20',
  VENCENDO: 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20',
  VENCIDA: 'bg-red-100 text-red-700 ring-1 ring-red-600/20',
  PENDENTE: 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/20',
  PROCESSANDO: 'bg-blue-100 text-blue-700 ring-1 ring-blue-600/20',
  CONCLUIDO: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20',
  ERRO: 'bg-red-100 text-red-700 ring-1 ring-red-600/20',
  ATIVO: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20',
  INATIVO: 'bg-slate-100 text-slate-500 ring-1 ring-slate-600/20',
};

const LABELS: Record<AnyStatus, string> = {
  VIGENTE: 'Vigente',
  VENCENDO: 'Vencendo',
  VENCIDA: 'Vencida',
  PENDENTE: 'Pendente',
  PROCESSANDO: 'Processando',
  CONCLUIDO: 'Concluído',
  ERRO: 'Erro',
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
};

export default function StatusBadge({ status }: { status: AnyStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
