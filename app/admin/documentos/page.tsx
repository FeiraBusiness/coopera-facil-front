'use client';

import { AlertCircle, Clock3, Loader2, MessageSquareText, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { errorMessage, getDocuments, reprocessDocument } from '../lib/api';
import type { DocumentStatus, WhatsAppDocument } from '../lib/types';
import { useAutoRefresh } from '../lib/useAutoRefresh';

const PAGE_SIZE = 8;

// Intervalo da atualização automática: acompanha o Job sem precisar recarregar a página.
const REFRESH_INTERVAL_MS = 5000;

const STATUS_OPTIONS: { value: DocumentStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'PROCESSANDO', label: 'Processando' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'ERRO', label: 'Erro' },
];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function DocumentosPage() {
  const { showToast } = useToast();

  const [status, setStatus] = useState<DocumentStatus | ''>('');
  const [documents, setDocuments] = useState<WhatsAppDocument[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // silent: atualização automática em segundo plano, sem spinner e sem toast de erro repetido.
  const loadDocuments = async (targetPage: number, statusFilter: DocumentStatus | '', silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const result = await getDocuments({ status: statusFilter || undefined, page: targetPage, size: PAGE_SIZE });
      setDocuments(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setPage(result.number);
      setLastUpdate(new Date());
    } catch (err) {
      if (!silent) showToast(errorMessage(err, 'Erro ao carregar documentos'), 'error');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments(0, status);
  }, [status]);

  // Mantém a página e o filtro atuais; mostra o status mudando conforme o Job processa.
  useAutoRefresh(() => loadDocuments(page, status, true), REFRESH_INTERVAL_MS);

  const handleReprocess = async (doc: WhatsAppDocument) => {
    setReprocessingId(doc.id);
    try {
      await reprocessDocument(doc.id);
      showToast('Documento devolvido para a fila de análise');
      loadDocuments(page, status);
    } catch (err) {
      // Ex.: "Remetente ... ainda não está cadastrado como produtor".
      showToast(errorMessage(err, 'Erro ao reprocessar documento'), 'error');
    } finally {
      setReprocessingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              status === opt.value ? 'bg-blue-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
        {lastUpdate && (
          <span className="ml-auto inline-flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Atualização automática · {lastUpdate.toLocaleTimeString('pt-BR')}
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
        {isLoading ? (
          <Spinner />
        ) : documents.length === 0 ? (
          <EmptyState title="Nenhum documento na fila" description="Novos documentos enviados pelo WhatsApp aparecerão aqui." icon={MessageSquareText} />
        ) : (
          <>
            {/* Tabela - desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                    <th className="py-3 pr-4">Produtor / Telefone</th>
                    <th className="py-3 pr-4">Arquivo</th>
                    <th className="py-3 pr-4">Recebido em</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-0 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors align-top">
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-slate-900">{doc.producerName ?? 'Não identificado'}</p>
                        <p className="text-xs text-slate-500">{doc.phoneNumber}</p>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600">{doc.fileName}</td>
                      <td className="py-3.5 pr-4 text-slate-600">{formatDateTime(doc.receivedAt)}</td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={doc.status} />
                        {doc.status === 'ERRO' && doc.errorMessage && (
                          <p className="text-xs text-red-600 mt-1 flex items-start gap-1 max-w-70">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {doc.errorMessage}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 pr-0 text-right">
                        {doc.status === 'ERRO' && (
                          <button
                            onClick={() => handleReprocess(doc)}
                            disabled={reprocessingId === doc.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60 cursor-pointer"
                          >
                            {reprocessingId === doc.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5" />
                            )}
                            Reprocessar
                          </button>
                        )}
                        {doc.status === 'CONCLUIDO' && doc.generatedLicenseId && (
                          <Link
                            href={`/admin/licencas/${doc.generatedLicenseId}`}
                            className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                          >
                            Ver licença
                          </Link>
                        )}
                        {doc.status === 'PROCESSANDO' && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
                            <Clock3 className="w-3.5 h-3.5" /> Em análise
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards - mobile */}
            <div className="md:hidden space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{doc.producerName ?? 'Não identificado'}</p>
                      <p className="text-xs text-slate-500">{doc.phoneNumber}</p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{doc.fileName}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(doc.receivedAt)}</p>
                  {doc.status === 'ERRO' && doc.errorMessage && (
                    <p className="text-xs text-red-600 mt-2 flex items-start gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {doc.errorMessage}
                    </p>
                  )}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    {doc.status === 'ERRO' && (
                      <button
                        onClick={() => handleReprocess(doc)}
                        disabled={reprocessingId === doc.id}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
                      >
                        {reprocessingId === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        Reprocessar
                      </button>
                    )}
                    {doc.status === 'CONCLUIDO' && doc.generatedLicenseId && (
                      <Link
                        href={`/admin/licencas/${doc.generatedLicenseId}`}
                        className="w-full flex items-center justify-center py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold"
                      >
                        Ver licença gerada
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={(next) => loadDocuments(next, status)}
              disabled={isLoading}
            />
          </>
        )}
      </div>
    </div>
  );
}
