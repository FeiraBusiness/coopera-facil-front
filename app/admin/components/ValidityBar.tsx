import { EXPIRING_THRESHOLD_DAYS, type License } from '../lib/types';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function remainingText(days: number) {
  if (days < 0) return `vencida há ${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''}`;
  if (days === 0) return 'vence hoje';
  return `faltam ${days} dia${days !== 1 ? 's' : ''}`;
}

const TODAY_COLOR = {
  VIGENTE: 'bg-vigente',
  VENCENDO: 'bg-vencendo',
  VENCIDA: 'bg-vencida',
} as const;

// Período de validade da licença, da emissão ao vencimento, com "hoje" marcado.
// O trecho final em destaque é o prazo para pedir a renovação (120 dias antes do vencimento).
export default function ValidityBar({ license }: { license: License }) {
  const end = new Date(license.expirationDate).getTime();
  const dayMs = 86_400_000;
  // Sem data de emissão, a barra mostra só o último ano antes do vencimento.
  const start = license.issueDate ? new Date(license.issueDate).getTime() : end - 365 * dayMs;
  const total = Math.max(end - start, dayMs);

  // "Hoje" vem dos dias restantes calculados pela API, e não do relógio do navegador.
  const today = end - license.daysRemaining * dayMs;
  const clamp = (value: number) => Math.min(100, Math.max(0, value));
  const todayPercent = clamp(((today - start) / total) * 100);
  const renewalPercent = clamp(((EXPIRING_THRESHOLD_DAYS * dayMs) / total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-linha px-6 py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-3">
        <p className="text-sm text-slate-600">
          Validade <span className="font-semibold text-tinta">{remainingText(license.daysRemaining)}</span>
        </p>
        <p className="text-xs text-vencendo font-semibold">Renovar a partir de {EXPIRING_THRESHOLD_DAYS} dias antes</p>
      </div>

      <div className="relative h-3 rounded-full bg-lavanda-clara">
        {/* Prazo de renovação no fim da validade */}
        <div className="absolute inset-y-0 right-0 rounded-r-full bg-vencendo-claro border-l border-dashed border-vencendo/50" style={{ width: `${renewalPercent}%` }} />
        {/* Tempo já decorrido */}
        <div className="absolute inset-y-0 left-0 rounded-l-full bg-lavanda/60" style={{ width: `${todayPercent}%` }} />
        {/* Hoje */}
        <div
          className={`absolute -top-1.5 w-1.5 h-6 -ml-[3px] rounded-full ring-2 ring-white ${TODAY_COLOR[license.status]}`}
          style={{ left: `${todayPercent}%` }}
          title="Hoje"
        />
      </div>

      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>{license.issueDate ? `Emitida em ${formatDate(license.issueDate)}` : 'Emissão não identificada'}</span>
        <span className="font-semibold text-tinta">Vence em {formatDate(license.expirationDate)}</span>
      </div>
    </div>
  );
}