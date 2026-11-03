// Funções que as telas chamam para falar com a API Coopera.
// Cada função: monta a requisição (http.ts), recebe o formato da API e devolve o formato da tela (mappers.ts).

import type { ApiDashboardSummary, ApiDocument, ApiLicense, ApiRuralProducer } from './api-types';
import { http } from './http';
import {
  toApiDocumentStatus,
  toApiLicenseStatus,
  toDashboardSummary,
  toDocument,
  toLicense,
  toLicenseUpdate,
  toProducer,
  toProducerRequest,
} from './mappers';
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

export { errorMessage, isApiError } from './http';
export type { ApiError } from './http';

// Converte cada item da página mantendo os dados de paginação.
function mapPage<A, T>(page: PageResponse<A>, mapper: (item: A) => T): PageResponse<T> {
  return { ...page, content: page.content.map(mapper) };
}

// GET /api/v1/dashboard/summary
export async function getDashboardSummary(): Promise<DashboardSummary> {
  return toDashboardSummary(await http<ApiDashboardSummary>('/api/v1/dashboard/summary'));
}

// GET /api/v1/rural-producer?search=&active=&page=&size=
export async function getProducers(params: {
  search?: string;
  active?: boolean;
  page?: number;
  size?: number;
}): Promise<PageResponse<RuralProducer>> {
  const { search, active, page = 0, size = 10 } = params;
  const result = await http<PageResponse<ApiRuralProducer>>('/api/v1/rural-producer', {
    query: { search: search?.trim(), active, page, size },
  });
  return mapPage(result, toProducer);
}

// GET /api/v1/rural-producer/{id}
export async function getProducer(id: string): Promise<RuralProducer> {
  return toProducer(await http<ApiRuralProducer>(`/api/v1/rural-producer/${id}`));
}

// POST /api/v1/rural-producer
export async function createProducer(input: RuralProducerInput): Promise<RuralProducer> {
  return toProducer(
    await http<ApiRuralProducer>('/api/v1/rural-producer', { method: 'POST', body: toProducerRequest(input) }),
  );
}

// PUT /api/v1/rural-producer/{id}
export async function updateProducer(id: string, input: RuralProducerInput): Promise<RuralProducer> {
  return toProducer(
    await http<ApiRuralProducer>(`/api/v1/rural-producer/${id}`, { method: 'PUT', body: toProducerRequest(input) }),
  );
}

// DELETE /api/v1/rural-producer/{id} (desativa, não apaga). A API responde 204, sem corpo.
export async function deactivateProducer(id: string): Promise<void> {
  await http<void>(`/api/v1/rural-producer/${id}`, { method: 'DELETE' });
}

// GET /api/v1/license?producerId=&status=&page=&size=
export async function getLicenses(params: {
  producerId?: string;
  status?: LicenseStatus | '';
  page?: number;
  size?: number;
}): Promise<PageResponse<License>> {
  const { producerId, status, page = 0, size = 10 } = params;
  const result = await http<PageResponse<ApiLicense>>('/api/v1/license', {
    query: { producerId, status: status ? toApiLicenseStatus(status) : undefined, page, size },
  });
  return mapPage(result, toLicense);
}

// GET /api/v1/license/{id}
export async function getLicense(id: string): Promise<License> {
  return toLicense(await http<ApiLicense>(`/api/v1/license/${id}`));
}

// PUT /api/v1/license/{id}: revisão; campos alterados viram correção manual na API.
export async function updateLicense(id: string, input: LicenseUpdateInput): Promise<License> {
  return toLicense(
    await http<ApiLicense>(`/api/v1/license/${id}`, { method: 'PUT', body: toLicenseUpdate(input) }),
  );
}

// GET /api/v1/document?status=&page=&size=
export async function getDocuments(params: {
  status?: DocumentStatus | '';
  page?: number;
  size?: number;
}): Promise<PageResponse<WhatsAppDocument>> {
  const { status, page = 0, size = 10 } = params;
  const result = await http<PageResponse<ApiDocument>>('/api/v1/document', {
    query: { status: status ? toApiDocumentStatus(status) : undefined, page, size },
  });
  return mapPage(result, toDocument);
}

// POST /api/v1/document/{id}/reprocess: volta para a fila (PENDENTE); o Job analisa em seguida.
export async function reprocessDocument(id: string): Promise<WhatsAppDocument> {
  return toDocument(await http<ApiDocument>(`/api/v1/document/${id}/reprocess`, { method: 'POST' }));
}