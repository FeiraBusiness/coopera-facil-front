// Tipos do painel administrativo (Produtores, Licenças, Documentos, Dashboard)
// Espelham os contratos descritos em README-API-CONTRACTS.md

export type LicenseStatus = 'VIGENTE' | 'VENCENDO' | 'VENCIDA';

export type DocumentStatus = 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO';

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

export interface RuralProducer {
  id: string;
  name: string;
  document: string; // CPF ou CNPJ
  phone: string;
  email: string | null;
  city: string;
  state: string; // UF
  farmName: string | null;
  active: boolean;
  licensesSummary: {
    vigente: number;
    vencendo: number;
    vencida: number;
  };
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
}

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0 a 1, confiança da extração por IA
  reviewed: boolean;
}

export interface License {
  id: string;
  producerId: string;
  producerName: string;
  type: string; // ex: Licença de Operação, Outorga de Água
  number: string;
  issuingAgency: string; // órgão emissor, ex: IAP, SEMA
  issueDate: string;
  expirationDate: string;
  status: LicenseStatus;
  sourceDocumentId: string | null;
  fileUrl: string;
  fileName: string;
  extractedFields: ExtractedField[];
  createdAt: string;
  updatedAt: string;
}

export interface LicenseUpdateInput {
  type?: string;
  number?: string;
  issuingAgency?: string;
  issueDate?: string;
  expirationDate?: string;
  extractedFields?: ExtractedField[];
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
  licensesByStatus: {
    vigente: number;
    vencendo: number;
    vencida: number;
  };
  documentsByStatus: {
    pendente: number;
    processando: number;
    concluido: number;
    erro: number;
  };
  upcomingExpirations: UpcomingExpiration[];
}
