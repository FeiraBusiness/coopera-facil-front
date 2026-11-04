import type { License, LicenseStatus } from '../../admin/lib/types';

export function formatarData(valor: string) {
  return new Date(valor).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function plural(quantidade: number, singular: string, pluralForma: string) {
  return quantidade === 1 ? singular : pluralForma;
}

// Prazo em linguagem do produtor: "faltam 22 dias", "vence hoje", "venceu há 41 dias".
export function prazoPorExtenso(dias: number) {
  if (dias < 0) {
    const atraso = Math.abs(dias);
    return `venceu há ${atraso} ${plural(atraso, 'dia', 'dias')}`;
  }
  if (dias === 0) return 'vence hoje';
  return `${plural(dias, 'falta', 'faltam')} ${dias} ${plural(dias, 'dia', 'dias')}`;
}

export const COR_STATUS: Record<LicenseStatus, string> = {
  VIGENTE: 'text-vigente',
  VENCENDO: 'text-vencendo',
  VENCIDA: 'text-vencida',
};

export function contarPorStatus(licencas: License[]) {
  return {
    vigente: licencas.filter((l) => l.status === 'VIGENTE').length,
    vencendo: licencas.filter((l) => l.status === 'VENCENDO').length,
    vencida: licencas.filter((l) => l.status === 'VENCIDA').length,
  };
}