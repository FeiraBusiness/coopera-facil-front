import {
  buildDashboardSummary,
  computeLicenseStatus,
  seedDocuments,
  seedLicenses,
  seedProducers,
} from './mock-data';
import type {
  DashboardSummary,
  DocumentStatus,
  License,
  LicenseStatus,
  LicenseUpdateInput,
  PageResponse,
  RuralProducer,
  RuralProducerInput,
  WhatsAppDocument,
} from './types';

// Camada de API mockada. Simula latência de rede e mantém estado em memória
// (reseta a cada reload). Os contratos espelham README-API-CONTRACTS.md,
// então basta trocar as implementações abaixo por chamadas `fetch` reais.

let producersStore: RuralProducer[] = seedProducers();
let licensesStore: License[] = seedLicenses();
let documentsStore: WhatsAppDocument[] = seedDocuments();
let nextProducerSeq = producersStore.length + 1;

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function paginate<T>(items: T[], page: number, size: number): PageResponse<T> {
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const start = page * size;
  const content = items.slice(start, start + size);
  return {
    content,
    totalElements,
    totalPages,
    number: page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: content.length === 0,
  };
}

export interface ApiError {
  status: number;
  message: string;
}

export function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'message' in err;
}

// GET /api/v1/dashboard/summary
export async function getDashboardSummary(): Promise<DashboardSummary> {
  return delay(buildDashboardSummary(producersStore, licensesStore, documentsStore));
}

// GET /api/v1/rural-producer?search=
export async function getProducers(params: {
  search?: string;
  page?: number;
  size?: number;
}): Promise<PageResponse<RuralProducer>> {
  const { search = '', page = 0, size = 10 } = params;
  const normalized = search.trim().toLowerCase();
  const filtered = producersStore.filter((p) => {
    if (!normalized) return true;
    return (
      p.name.toLowerCase().includes(normalized) ||
      p.document.toLowerCase().includes(normalized) ||
      p.city.toLowerCase().includes(normalized)
    );
  });
  return delay(paginate(filtered, page, size));
}

// GET /api/v1/rural-producer/{id}
export async function getProducer(id: string): Promise<RuralProducer> {
  const producer = producersStore.find((p) => p.id === id);
  if (!producer) {
    return Promise.reject({ status: 404, message: 'Produtor não encontrado' } satisfies ApiError);
  }
  return delay(producer);
}

// POST /api/v1/rural-producer
export async function createProducer(input: RuralProducerInput): Promise<RuralProducer> {
  const now = new Date().toISOString();
  const producer: RuralProducer = {
    id: `p-${String(nextProducerSeq++).padStart(3, '0')}`,
    name: input.name,
    document: input.document,
    phone: input.phone,
    email: input.email ?? null,
    city: input.city,
    state: input.state,
    farmName: input.farmName ?? null,
    active: true,
    licensesSummary: { vigente: 0, vencendo: 0, vencida: 0 },
    createdAt: now,
    updatedAt: now,
  };
  producersStore = [producer, ...producersStore];
  return delay(producer);
}

// PUT /api/v1/rural-producer/{id}
export async function updateProducer(id: string, input: RuralProducerInput): Promise<RuralProducer> {
  const index = producersStore.findIndex((p) => p.id === id);
  if (index === -1) {
    return Promise.reject({ status: 404, message: 'Produtor não encontrado' } satisfies ApiError);
  }
  const updated: RuralProducer = {
    ...producersStore[index],
    name: input.name,
    document: input.document,
    phone: input.phone,
    email: input.email ?? null,
    city: input.city,
    state: input.state,
    farmName: input.farmName ?? null,
    updatedAt: new Date().toISOString(),
  };
  producersStore = producersStore.map((p) => (p.id === id ? updated : p));
  licensesStore = licensesStore.map((l) => (l.producerId === id ? { ...l, producerName: updated.name } : l));
  return delay(updated);
}

// DELETE /api/v1/rural-producer/{id} (soft delete - desativa, não apaga)
export async function deactivateProducer(id: string): Promise<RuralProducer> {
  const index = producersStore.findIndex((p) => p.id === id);
  if (index === -1) {
    return Promise.reject({ status: 404, message: 'Produtor não encontrado' } satisfies ApiError);
  }
  const updated = { ...producersStore[index], active: false, updatedAt: new Date().toISOString() };
  producersStore = producersStore.map((p) => (p.id === id ? updated : p));
  return delay(updated);
}

// GET /api/v1/license?producerId=&status=
export async function getLicenses(params: {
  producerId?: string;
  status?: LicenseStatus | '';
  page?: number;
  size?: number;
}): Promise<PageResponse<License>> {
  const { producerId, status, page = 0, size = 10 } = params;
  const withFreshStatus = licensesStore.map((l) => ({ ...l, status: computeLicenseStatus(l.expirationDate) }));
  const filtered = withFreshStatus.filter((l) => {
    if (producerId && l.producerId !== producerId) return false;
    if (status && l.status !== status) return false;
    return true;
  });
  return delay(paginate(filtered, page, size));
}

// GET /api/v1/license/{id}
export async function getLicense(id: string): Promise<License> {
  const license = licensesStore.find((l) => l.id === id);
  if (!license) {
    return Promise.reject({ status: 404, message: 'Licença não encontrada' } satisfies ApiError);
  }
  return delay({ ...license, status: computeLicenseStatus(license.expirationDate) });
}

// PUT /api/v1/license/{id} (corrigir leitura errada da IA)
export async function updateLicense(id: string, input: LicenseUpdateInput): Promise<License> {
  const index = licensesStore.findIndex((l) => l.id === id);
  if (index === -1) {
    return Promise.reject({ status: 404, message: 'Licença não encontrada' } satisfies ApiError);
  }
  const current = licensesStore[index];
  const updated: License = {
    ...current,
    type: input.type ?? current.type,
    number: input.number ?? current.number,
    issuingAgency: input.issuingAgency ?? current.issuingAgency,
    issueDate: input.issueDate ?? current.issueDate,
    expirationDate: input.expirationDate ?? current.expirationDate,
    extractedFields: input.extractedFields ?? current.extractedFields,
    updatedAt: new Date().toISOString(),
  };
  updated.status = computeLicenseStatus(updated.expirationDate);
  licensesStore = licensesStore.map((l) => (l.id === id ? updated : l));
  return delay(updated);
}

// GET /api/v1/document?status=
export async function getDocuments(params: {
  status?: DocumentStatus | '';
  page?: number;
  size?: number;
}): Promise<PageResponse<WhatsAppDocument>> {
  const { status, page = 0, size = 10 } = params;
  const filtered = documentsStore.filter((d) => (status ? d.status === status : true));
  const sorted = [...filtered].sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  return delay(paginate(sorted, page, size));
}

// POST /api/v1/document/{id}/reprocess
export async function reprocessDocument(id: string): Promise<WhatsAppDocument> {
  const index = documentsStore.findIndex((d) => d.id === id);
  if (index === -1) {
    return Promise.reject({ status: 404, message: 'Documento não encontrado' } satisfies ApiError);
  }
  const current = documentsStore[index];
  const updated: WhatsAppDocument = {
    ...current,
    status: 'CONCLUIDO',
    errorMessage: null,
    processedAt: new Date().toISOString(),
    reprocessCount: current.reprocessCount + 1,
  };
  documentsStore = documentsStore.map((d) => (d.id === id ? updated : d));
  return delay(updated, 900);
}
