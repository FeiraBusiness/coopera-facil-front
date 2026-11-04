// Tipos do painel administrativo, no vocabulário das telas (status em português).
// O formato da API fica em api-types.ts; a tradução entre os dois, em mappers.ts.

export type LicenseStatus = 'VIGENTE' | 'VENCENDO' | 'VENCIDA';

export type DocumentStatus = 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO';

// Origem do valor de um campo extraído: IA (Azure), regra de texto ou correção manual.
export type FieldSource = 'AI' | 'RULE' | 'MANUAL';

// Siglas aceitas pela API (enum LicenseType do back-end).
export type LicenseTypeCode = 'LAS' | 'LP' | 'LI' | 'LO' | 'LAR' | 'LAC' | 'DISPENSA' | 'AUTORIZACAO' | 'OTHER';

export const LICENSE_TYPES: { code: LicenseTypeCode; label: string }[] = [
  { code: 'LAS', label: 'Licença Ambiental Simplificada' },
  { code: 'LP', label: 'Licença Prévia' },
  { code: 'LI', label: 'Licença de Instalação' },
  { code: 'LO', label: 'Licença de Operação' },
  { code: 'LAR', label: 'Licença Ambiental de Regularização' },
  { code: 'LAC', label: 'Licença por Adesão e Compromisso' },
  { code: 'DISPENSA', label: 'Dispensa de Licenciamento' },
  { code: 'AUTORIZACAO', label: 'Autorização Ambiental' },
  { code: 'OTHER', label: 'Outro' },
];

// Mesmo limite do back-end (CONAMA 237/97): a partir daqui a licença está "vencendo".
export const EXPIRING_THRESHOLD_DAYS = 120;

// Abaixo desta confiança o campo é destacado para revisão.
export const LOW_CONFIDENCE_THRESHOLD = 0.85;

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface LicensesSummary {
  vigente: number;
  vencendo: number;
  vencida: number;
}

export interface RuralProducer {
  id: string;
  name: string;
  document: string; // CPF ou CNPJ
  phone: string;
  email: string | null;
  city: string;
  state: string; // UF
  farmName: string | null;
  cooperado: boolean;
  cadPro: string | null;
  active: boolean;
  licensesSummary: LicensesSummary;
  createdAt: string;
  updatedAt: string;
}

export interface RuralProducerInput {
  name: string;
  document: string;
  phone: string;
  email?: string | null;
  city: string;
  state: string;
  farmName?: string | null;
  cooperado: boolean;
  cadPro?: string | null;
}

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number | null; // 0 a 1; nulo quando veio de regra ou correção manual
  source: FieldSource;
  reviewed: boolean;
  lowConfidence: boolean;
}

export interface License {
  id: string;
  producerId: string;
  producerName: string;
  typeCode: LicenseTypeCode;
  type: string; // nome por extenso, para exibição
  number: string;
  protocolNumber: string | null;
  issuingAgency: string;
  issueDate: string | null;
  expirationDate: string;
  status: LicenseStatus;
  daysRemaining: number;
  needsReview: boolean;
  holderName: string | null;
  holderDocument: string | null;
  municipality: string | null;
  activity: string | null;
  cultivatedSpecies: string | null;
  annualProductionKg: number | null;
  sourceDocumentId: string | null;
  fileUrl: string;
  fileName: string;
  extractedFields: ExtractedField[];
  createdAt: string;
  updatedAt: string;
}

// Revisão da licença: todos os campos editáveis (PUT completo). Datas no formato AAAA-MM-DD.
export interface LicenseUpdateInput {
  typeCode: LicenseTypeCode;
  number: string;
  protocolNumber: string;
  issuingAgency: string;
  issueDate: string;
  expirationDate: string;
  holderName: string;
  holderDocument: string;
  municipality: string;
  activity: string;
  cultivatedSpecies: string;
  annualProductionKg: number | null;
}

export interface WhatsAppDocument {
  id: string;
  producerId: string | null;
  producerName: string | null;
  phoneNumber: string;
  fileName: string;
  fileUrl: string;
  status: DocumentStatus;
  receivedAt: string;
  processedAt: string | null;
  errorMessage: string | null;
  generatedLicenseId: string | null;
  reprocessCount: number;
}

export interface UpcomingExpiration {
  licenseId: string;
  producerName: string;
  licenseType: string;
  expirationDate: string;
  daysRemaining: number;
}

export interface DashboardSummary {
  totalProducers: number;
  totalLicenses: number;
  licensesByStatus: LicensesSummary;
  documentsByStatus: {
    pendente: number;
    processando: number;
    concluido: number;
    erro: number;
  };
  productionAtRiskKg: number;
  upcomingExpirations: UpcomingExpiration[];
}