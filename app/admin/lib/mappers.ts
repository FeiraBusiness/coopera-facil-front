// Tradução entre o formato da API (api-types.ts) e o das telas (types.ts).
// O back-end usa status em inglês, as telas usam status em português.
// O back-end omite campos nulos, as telas usam null.
// O back-end usa siglas para tipos de licença, as telas usam rótulos legíveis.
// O back-end envia datas sem hora, que o JS interpreta como UTC e muda o dia no fuso do Brasil.
import type {
  ApiDashboardSummary,
  ApiDocument,
  ApiDocumentStatus,
  ApiExtractedField,
  ApiLicense,
  ApiLicenseStatus,
  ApiLicenseSummary,
  ApiLicenseUpdate,
  ApiRuralProducer,
  ApiRuralProducerRequest,
} from './api-types';
import type {
  DashboardSummary,
  DocumentStatus,
  ExtractedField,
  License,
  LicenseStatus,
  LicenseTypeCode,
  LicensesSummary,
  LicenseUpdateInput,
  RuralProducer,
  RuralProducerInput,
  WhatsAppDocument,
} from './types';

// ---------- status ----------

const LICENSE_STATUS: Record<ApiLicenseStatus, LicenseStatus> = {
  VALID: 'VIGENTE',
  EXPIRING: 'VENCENDO',
  EXPIRED: 'VENCIDA',
};

const DOCUMENT_STATUS: Record<ApiDocumentStatus, DocumentStatus> = {
  TO_PROCESS: 'PENDENTE',
  PROCESSING: 'PROCESSANDO',
  PROCESSED: 'CONCLUIDO',
  ERROR: 'ERRO',
};

// Caminho inverso, usado nos filtros enviados para a API.
export function toApiLicenseStatus(status: LicenseStatus): ApiLicenseStatus {
  return (Object.keys(LICENSE_STATUS) as ApiLicenseStatus[]).find((key) => LICENSE_STATUS[key] === status)!;
}

export function toApiDocumentStatus(status: DocumentStatus): ApiDocumentStatus {
  return (Object.keys(DOCUMENT_STATUS) as ApiDocumentStatus[]).find((key) => DOCUMENT_STATUS[key] === status)!;
}

// ---------- datas ----------

// A API manda datas sem hora ("2027-06-28"). new Date("2027-06-28") interpreta como meia-noite UTC,
// que no Brasil (UTC-3) vira o dia anterior. Com o horário explícito, a data é lida no fuso local.
function toLocalDate(date: string): string;
function toLocalDate(date: string | undefined): string | null;
function toLocalDate(date: string | undefined): string | null {
  return date ? `${date}T00:00:00` : null;
}

// ---------- produtores ----------

function toLicensesSummary(summary: ApiLicenseSummary | undefined): LicensesSummary {
  return {
    vigente: summary?.valid ?? 0,
    vencendo: summary?.expiring ?? 0,
    vencida: summary?.expired ?? 0,
  };
}

export function toProducer(api: ApiRuralProducer): RuralProducer {
  return {
    id: api.id,
    name: api.name,
    document: api.document,
    phone: api.phone,
    email: api.email ?? null,
    city: api.city,
    state: api.state,
    farmName: api.propertyName ?? null,
    cooperado: api.cooperado,
    cadPro: api.cadPro ?? null,
    active: api.active,
    licensesSummary: toLicensesSummary(api.licenseSummary),
    createdAt: api.createdAt,
    updatedAt: api.updatedAt ?? api.createdAt,
  };
}

// Campo de texto vazio vai como null, para a API não gravar "".
function blankToNull(value: string | null | undefined): string | null {
  return value && value.trim() ? value.trim() : null;
}

export function toProducerRequest(input: RuralProducerInput): ApiRuralProducerRequest {
  return {
    name: input.name.trim(),
    document: input.document.trim(),
    phone: input.phone.trim(),
    email: blankToNull(input.email),
    city: input.city.trim(),
    state: input.state,
    propertyName: blankToNull(input.farmName),
    cooperado: input.cooperado,
    cadPro: input.cooperado ? blankToNull(input.cadPro) : null,
  };
}

// ---------- licenças ----------

function toExtractedField(api: ApiExtractedField): ExtractedField {
  return {
    key: api.key,
    label: api.label,
    value: api.value ?? '',
    confidence: api.confidence ?? null,
    source: api.source,
    reviewed: api.reviewed,
    lowConfidence: api.lowConfidence,
  };
}

export function toLicense(api: ApiLicense): License {
  return {
    id: api.id,
    producerId: api.producerId,
    producerName: api.producerName ?? 'Produtor não encontrado',
    typeCode: api.type as LicenseTypeCode,
    type: api.typeLabel,
    number: api.number ?? '',
    protocolNumber: api.protocolNumber ?? null,
    issuingAgency: api.issuingAgency ?? '',
    issueDate: toLocalDate(api.issueDate),
    expirationDate: toLocalDate(api.expirationDate),
    status: LICENSE_STATUS[api.status],
    daysRemaining: api.daysUntilExpiration,
    needsReview: api.needsReview,
    holderName: api.holderName ?? null,
    holderDocument: api.holderDocument ?? null,
    municipality: api.municipality ?? null,
    activity: api.activity ?? null,
    cultivatedSpecies: api.cultivatedSpecies ?? null,
    annualProductionKg: api.annualProductionKg ?? null,
    sourceDocumentId: api.documentId,
    fileUrl: api.fileUrl ?? '',
    fileName: api.fileName ?? 'documento.pdf',
    extractedFields: api.extractedFields.map(toExtractedField),
    createdAt: api.createdAt,
    updatedAt: api.updatedAt ?? api.createdAt,
  };
}

export function toLicenseUpdate(input: LicenseUpdateInput): ApiLicenseUpdate {
  return {
    type: input.typeCode,
    number: blankToNull(input.number),
    protocolNumber: blankToNull(input.protocolNumber),
    issuingAgency: blankToNull(input.issuingAgency),
    issueDate: blankToNull(input.issueDate),
    expirationDate: input.expirationDate,
    holderName: blankToNull(input.holderName),
    holderDocument: blankToNull(input.holderDocument),
    municipality: blankToNull(input.municipality),
    activity: blankToNull(input.activity),
    cultivatedSpecies: blankToNull(input.cultivatedSpecies),
    annualProductionKg: input.annualProductionKg,
  };
}

// ---------- documentos ----------

export function toDocument(api: ApiDocument): WhatsAppDocument {
  return {
    id: api.id,
    producerId: api.producerId ?? null,
    producerName: api.producerName ?? null,
    phoneNumber: api.senderPhone,
    fileName: api.fileName ?? 'documento.pdf',
    fileUrl: api.fileUrl,
    status: DOCUMENT_STATUS[api.status],
    receivedAt: api.receivedAt,
    processedAt: api.processedAt ?? null,
    errorMessage: api.errorMessage ?? null,
    generatedLicenseId: api.generatedLicenseId ?? null,
    reprocessCount: api.reprocessCount,
  };
}

// ---------- dashboard ----------

export function toDashboardSummary(api: ApiDashboardSummary): DashboardSummary {
  return {
    totalProducers: api.totalProducers,
    totalLicenses: api.totalLicenses,
    licensesByStatus: toLicensesSummary(api.licensesByStatus),
    documentsByStatus: {
      pendente: api.documentsByStatus.toProcess,
      processando: api.documentsByStatus.processing,
      concluido: api.documentsByStatus.processed,
      erro: api.documentsByStatus.error,
    },
    productionAtRiskKg: api.productionAtRiskKg,
    upcomingExpirations: api.upcomingExpirations.map((item) => ({
      licenseId: item.licenseId,
      producerName: item.producerName ?? 'Produtor não encontrado',
      licenseType: item.licenseTypeLabel,
      expirationDate: toLocalDate(item.expirationDate),
      daysRemaining: item.daysUntilExpiration,
    })),
  };
}