import Link from 'next/link';
import { EXPIRING_THRESHOLD_DAYS, type License } from '../lib/types';

// Janela exibida na régua: de hoje até 12 meses à frente.
const WINDOW_DAYS = 365;

// Distância mínima (em % da largura) entre marcadores na mesma linha; abaixo disso, desce uma linha.
const MIN_GAP_PERCENT = 2.5;

const MARKER_COLOR = {
  VIGENTE: 'bg-vigente',
  VENCENDO: 'bg-vencendo',
  VENCIDA: 'bg-vencida',
} as const;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function percentOf(days: number) {
  return (days / WINDOW_DAYS) * 100;
}

// Primeiro dia de cada um dos próximos 12 meses, com a posição na régua.
function monthTicks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() + i + 1, 1);
    const days = Math.round((date.getTime() - today.getTime()) / 86_400_000);
    const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return { key: date.toISOString(), percent: percentOf(days), label: date.getMonth() === 0 ? `${month} ${date.getFullYear()}` : month };
  }).filter((tick) => tick.percent < 96);
}

// Distribui os marcadores em linhas para não ficarem um em cima do outro.
function assignLanes(licenses: License[]) {
  const laneEnds: number[] = [];
  return licenses.map((license) => {
    const percent = percentOf(license.daysRemaining);
    let lane = laneEnds.findIndex((end) => percent - end >= MIN_GAP_PERCENT);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(percent);
    } else {
      laneEnds[lane] = percent;
    }
    return { license, percent, lane };
  });
}

// Régua de vencimentos: cada licença é um ponto na data em que vence.
// A faixa clara no início é a janela de renovação (120 dias, CONAMA 237/97).
export default function ValidityRuler({ licenses }: { licenses: License[] }) {
  const expired = licenses.filter((l) => l.daysRemaining < 0);
  const inWindow = licenses
    .filter((l) => l.daysRemaining >= 0 && l.daysRemaining <= WINDOW_DAYS)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
  const later = licenses.filter((l) => l.daysRemaining > WINDOW_DAYS).length;

  const markers = assignLanes(inWindow);
  const lanes = Math.max(1, ...markers.map((m) => m.lane + 1));
  const trackHeight = 44 + lanes * 22;
  const renewalPercent = percentOf(EXPIRING_THRESHOLD_DAYS);

  return (
    <div>
      <div className="flex gap-4">
        {/* Vencidas: ficam fora da régua, à esquerda de "hoje" */}
        <Link
          href="/admin/licencas?status=VENCIDA"
          className="w-24 shrink-0 rounded-lg bg-vencida-claro px-3 py-3 flex flex-col justify-between hover:brightness-95 transition"
          style={{ minHeight: trackHeight }}
        >
          <span className="text-xs font-semibold text-vencida">Vencidas</span>
          <span className="numeral text-3xl text-vencida">{expired.length}</span>
        </Link>

        <div className="relative flex-1" style={{ height: trackHeight }}>
          {/* Janela de renovação */}
          <div
            className="absolute inset-y-0 left-0 rounded-l-md bg-vencendo-claro border-r border-dashed border-vencendo/40"
            style={{ width: `${renewalPercent}%` }}
          >
            <span className="absolute top-2 left-3 text-[11px] font-semibold text-vencendo whitespace-nowrap">
              Prazo de renovação ({EXPIRING_THRESHOLD_DAYS} dias)
            </span>
          </div>

          {/* Linha base e divisões de mês */}
          <div className="absolute left-0 right-0 bottom-0 h-px bg-linha" />
          {monthTicks().map((tick) => (
            <div key={tick.key} className="absolute bottom-0 h-2 w-px bg-linha" style={{ left: `${tick.percent}%` }} />
          ))}

          {/* Hoje */}
          <div className="absolute inset-y-0 left-0 w-0.5 bg-marinho" />

          {markers.map(({ license, percent, lane }) => (
            <Link
              key={license.id}
              href={`/admin/licencas/${license.id}`}
              title={`${license.producerName}, ${license.type}, vence em ${formatDate(license.expirationDate)} (${license.daysRemaining} dias)`}
              aria-label={`${license.producerName}, vence em ${license.daysRemaining} dias`}
              className={`absolute w-3.5 h-3.5 -ml-[7px] rounded-full ring-2 ring-white hover:scale-125 transition-transform ${MARKER_COLOR[license.status]}`}
              style={{ left: `${percent}%`, bottom: 12 + lane * 22 }}
            />
          ))}
        </div>
      </div>

      {/* Eixo dos meses */}
      <div className="flex gap-4 mt-2">
        <span className="w-24 shrink-0" aria-hidden="true" />
        <div className="relative flex-1 h-4">
          <span className="absolute left-0 text-xs font-semibold text-marinho">Hoje</span>
          {monthTicks().map((tick, index) => (
            <span
              key={tick.key}
              // Em telas estreitas só os meses alternados, para os nomes não se sobreporem.
              className={`absolute -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap ${index % 2 === 0 ? 'hidden sm:inline' : ''}`}
              style={{ left: `${tick.percent}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      {later > 0 && (
        <p className="text-xs text-slate-500 mt-4 text-right">
          Mais {later} licença{later !== 1 ? 's' : ''} com vencimento depois de 12 meses
        </p>
      )}
    </div>
  );
}