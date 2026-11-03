'use client';

import { ArrowRight, FileStack } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { errorMessage, getLicenses, getProducers } from '../lib/api';
import type { License, LicenseStatus, RuralProducer } from '../lib/types';
import { useToast } from '../components/ToastProvider';

const PAGE_SIZE = 8;

const STATUS_OPTIONS: { value: LicenseStatus | ''; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'VIGENTE', label: 'Vigente' },
  { value: 'VENCENDO', label: 'Vencendo' },
  { value: 'VENCIDA', label: 'Vencida' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function LicencasPage() {
  return (
    <Suspense fallback={<Spinner size="lg" />}>
      <LicencasContent />
    </Suspense>
  );
}

function LicencasContent() {
  const searchParams = useSearchParams();

  const { showToast } = useToast();
  const [producerId, setProducerId] = useState(searchParams.get('producerId') ?? '');
  const [status, setStatus] = useState<LicenseStatus | ''>((searchParams.get('status') as LicenseStatus) ?? '');
  const [producers, setProducers] = useState<RuralProducer[]>([]);

  const [licenses, setLicenses] = useState<License[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProducers({ page: 0, size: 100 }).then((res) => setProducers(res.content));
  }, []);

  const loadLicenses = async (targetPage: number, producer: string, statusFilter: LicenseStatus | '') => {
    setIsLoading(true);
    try {
      const result = await getLicenses({
        producerId: producer || undefined,
        status: statusFilter || undefined,
        page: targetPage,
        size: PAGE_SIZE,
      });
      setLicenses(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setPage(result.number);
    } catch (err) {
      showToast(errorMessage(err, 'Erro ao carregar licenças'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLicenses(0, producerId, status);
  }, [producerId, status]);

  const selectedProducerName = producers.find((p) => p.id === producerId)?.name;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={producerId}
          onChange={(e) => setProducerId(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors flex-1 sm:max-w-xs"
        >
          <option value="">Todos os produtores</option>
          {producers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LicenseStatus | '')}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors flex-1 sm:max-w-50"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {selectedProducerName && (
        <p className="text-sm text-slate-500">
          Filtrando por produtor: <span className="font-semibold text-slate-700">{selectedProducerName}</span>
        </p>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
        {isLoading ? (
          <Spinner />
        ) : licenses.length === 0 ? (
          <EmptyState title="Nenhuma licença encontrada" description="Ajuste os filtros para ver outros resultados." icon={FileStack} />
        ) : (
          <>
            {/* Tabela - desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                    <th className="py-3 pr-4">Produtor</th>
                    <th className="py-3 pr-4">Tipo</th>
                    <th className="py-3 pr-4">Número</th>
                    <th className="py-3 pr-4">Órgão</th>
                    <th className="py-3 pr-4">Vencimento</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-0 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((license) => (
                    <tr key={license.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-slate-900">{license.producerName}</td>
                      <td className="py-3.5 pr-4 text-slate-600">{license.type}</td>
                      <td className="py-3.5 pr-4 text-slate-600">{license.number}</td>
                      <td className="py-3.5 pr-4 text-slate-600">{license.issuingAgency}</td>
                      <td className="py-3.5 pr-4 text-slate-600">{formatDate(license.expirationDate)}</td>
                      <td className="py-3.5 pr-4"><StatusBadge status={license.status} /></td>
                      <td className="py-3.5 pr-0 text-right">
                        <Link
                          href={`/admin/licencas/${license.id}`}
                          className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:text-blue-900 text-xs"
                        >
                          Detalhes <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards - mobile */}
            <div className="md:hidden space-y-3">
              {licenses.map((license) => (
                <Link
                  key={license.id}
                  href={`/admin/licencas/${license.id}`}
                  className="block rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{license.producerName}</p>
                      <p className="text-xs text-slate-500">{license.type}</p>
                    </div>
                    <StatusBadge status={license.status} />
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <span>{license.number} · {license.issuingAgency}</span>
                    <span className="font-semibold">{formatDate(license.expirationDate)}</span>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={(next) => loadLicenses(next, producerId, status)}
              disabled={isLoading}
            />
          </>
        )}
      </div>
    </div>
  );
}
