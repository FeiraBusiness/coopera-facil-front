// Formato exato do JSON da API Coopera (back-end Quarkus).
// Não usar nas telas: as telas usam os tipos de types.ts, e mappers.ts faz a tradução.

export type ApiLicenseStatus = 'VALID' | 'EXPIRING' | 'EXPIRED';

export type ApiDocumentStatus = 'TO_PROCESS' | 'PROCESSING' | 'PROCESSED' | 'ERROR';

export interface ApiLicenseSummary {
  valid: number;
  expiring: number;
  expired: number;
}

// Campos opcionais (?) são omitidos pela API quando nulos.
export interface ApiRuralProducer {
  id: string;
  name: string;
  document: string;
  phone: string;
  email?: string;
  city: string;
  state: string;
  propertyName?: string;
  cooperado: boolean;
  cadPro?: string;
  active: boolean;
  licenseSummary?: ApiLicenseSummary;
  createdAt: string;
  updatedAt?: string;
  disabledAt?: string;
}

export interface ApiRuralProducerRequest {
  name: string;
  document: string;
  phone: string;
  email: string | null;
  city: string;
  state: string;
  propertyName: string | null;
  cooperado: boolean;
  cadPro: string | null;
}

export interface ApiExtractedField {
  key: string;
  label: string;
  value?: string;
  confidence?: number;
  source: 'AI' | 'RULE' | 'MANUAL';
  reviewed: boolean;
  lowConfidence: boolean;
}

export interface ApiLicense {
  id: string;
  documentId: string;
  producerId: string;
  producerName?: string;
  type: string;
  typeLabel: string;
  number?: string;
  protocolNumber?: string;
  issuingAgency?: string;
  issueDate?: string; // AAAA-MM-DD
  expirationDate: string; // AAAA-MM-DD
  status: ApiLicenseStatus;
  daysUntilExpiration: number;
  needsReview: boolean;
  holderName?: string;
  holderDocument?: string;
  municipality?: string;
  activity?: string;
  cultivatedSpecies?: string;
  annualProductionKg?: number;
  fileName?: string;
  fileUrl?: string;
  extractedFields: ApiExtractedField[];
  createdAt: string;
  updatedAt?: string;
}

export interface ApiLicenseUpdate {
  type: string;
  number: string | null;
  protocolNumber: string | null;
  issuingAgency: string | null;
  issueDate: string | null;
  expirationDate: string;
  holderName: string | null;
  holderDocument: string | null;
  municipality: string | null;
  activity: string | null;
  cultivatedSpecies: string | null;
  annualProductionKg: number | null;
}

export interface ApiDocument {
  id: string;
  producerId?: string;
  producerName?: string;
  senderPhone: string;
  fileName?: string;
  fileUrl: string;
  mimeType?: string;
  status: ApiDocumentStatus;
  errorMessage?: string;
  reprocessCount: number;
  receivedAt: string;
  processedAt?: string;
  generatedLicenseId?: string;
}

export interface ApiUpcomingExpiration {
  licenseId: string;
  producerId: string;
  producerName?: string;
  licenseType: string;
  licenseTypeLabel: string;
  expirationDate: string;
  daysUntilExpiration: number;
}

export interface ApiDashboardSummary {
  totalProducers: number;
  totalLicenses: number;
  licensesByStatus: ApiLicenseSummary;
  documentsByStatus: {
    toProcess: number;
    processing: number;
    processed: number;
    error: number;
  };
  productionAtRiskKg: number;
  upcomingExpirations: ApiUpcomingExpiration[];
}