import type { DocumentStatus, LicenseStatus } from '../lib/types';

type AnyStatus = LicenseStatus | DocumentStatus | 'ATIVO' | 'INATIVO';

// Ponto colorido + texto: a cor reforça, mas o texto sozinho já diz a situação.
const STYLES: Record<AnyStatus, { badge: string; dot: string }> = {
  VIGENTE: { badge: 'bg-vigente-claro text-vigente', dot: 'bg-vigente' },
  VENCENDO: { badge: 'bg-vencendo-claro text-vencendo', dot: 'bg-vencendo' },
  VENCIDA: { badge: 'bg-vencida-claro text-vencida', dot: 'bg-vencida' },
  PENDENTE: { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  PROCESSANDO: { badge: 'bg-lavanda-clara text-marinho', dot: 'bg-marinho animate-pulse' },
  CONCLUIDO: { badge: 'bg-vigente-claro text-vigente', dot: 'bg-vigente' },
  ERRO: { badge: 'bg-vencida-claro text-vencida', dot: 'bg-vencida' },
  ATIVO: { badge: 'bg-vigente-claro text-vigente', dot: 'bg-vigente' },
  INATIVO: { badge: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
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
  const style = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap ${style.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {LABELS[status]}
    </span>
  );
}