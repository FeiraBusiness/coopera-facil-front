'use client';

import { FileStack, Pencil, Phone, Plus, Search, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import ProducerFormModal from '../components/ProducerFormModal';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { createProducer, deactivateProducer, errorMessage, getProducer, getProducers, updateProducer } from '../lib/api';import type { RuralProducer, RuralProducerInput } from '../lib/types';


const PAGE_SIZE = 8;

export default function ProdutoresPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [producers, setProducers] = useState<RuralProducer[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingProducer, setEditingProducer] = useState<RuralProducer | null>(null);
  const [isLoadingEditTarget, setIsLoadingEditTarget] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const [producerToDelete, setProducerToDelete] = useState<RuralProducer | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadProducers = async (targetPage: number, searchTerm: string) => {
    setIsLoading(true);
    try {
      const result = await getProducers({ search: searchTerm, page: targetPage, size: PAGE_SIZE });
      setProducers(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setPage(result.number);
    } catch (err) {
      showToast(errorMessage(err, 'Erro ao carregar produtores'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducers(0, debouncedSearch);
  }, [debouncedSearch]);

  const openCreateModal = () => {
    setFormMode('create');
    setEditingProducer(null);
    setFormOpen(true);
  };

  const openEditModal = async (producer: RuralProducer) => {
    setFormMode('edit');
    setFormOpen(true);
    setIsLoadingEditTarget(true);
    try {
      const full = await getProducer(producer.id);
      setEditingProducer(full);
    } catch (err) {
      showToast(errorMessage(err, 'Erro ao carregar dados do produtor'), 'error');
      setFormOpen(false);
    } finally {
      setIsLoadingEditTarget(false);
    }
  };

  const handleSubmit = async (input: RuralProducerInput) => {
    setIsSubmittingForm(true);
    try {
      if (formMode === 'create') {
        await createProducer(input);
        showToast('Produtor cadastrado com sucesso!');
      } else if (editingProducer) {
        await updateProducer(editingProducer.id, input);
        showToast('Produtor atualizado com sucesso!');
      }
      setFormOpen(false);
      loadProducers(page, debouncedSearch);
    } catch (err) {
      // Regras da API (ex.: "Produtor cooperado precisa do CadPro") chegam com a mensagem pronta.
      showToast(errorMessage(err, 'Erro ao salvar produtor'), 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeactivate = async () => {
    if (!producerToDelete) return;
    try {
      await deactivateProducer(producerToDelete.id);
      showToast('Produtor desativado com sucesso!');
      setProducerToDelete(null);
      loadProducers(page, debouncedSearch);
    } catch (err) {
      showToast(errorMessage(err, 'Erro ao desativar produtor'), 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, documento ou cidade..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
          />
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo produtor
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
        {isLoading ? (
          <Spinner />
        ) : producers.length === 0 ? (
          <EmptyState
            title="Nenhum produtor encontrado"
            description={debouncedSearch ? 'Tente ajustar o termo buscado.' : 'Cadastre o primeiro produtor rural.'}
            icon={Users}
          />
        ) : (
          <>
            {/* Tabela - desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                    <th className="py-3 pr-4">Produtor</th>
                    <th className="py-3 pr-4">Documento</th>
                    <th className="py-3 pr-4">Cidade/UF</th>
                    <th className="py-3 pr-4">Licenças</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-0 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {producers.map((producer) => (
                    <tr key={producer.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-slate-900">{producer.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {producer.phone}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600">{producer.document}</td>
                      <td className="py-3.5 pr-4 text-slate-600">{producer.city}/{producer.state}</td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {producer.licensesSummary.vigente > 0 && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{producer.licensesSummary.vigente} vigente</span>
                          )}
                          {producer.licensesSummary.vencendo > 0 && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{producer.licensesSummary.vencendo} vencendo</span>
                          )}
                          {producer.licensesSummary.vencida > 0 && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">{producer.licensesSummary.vencida} vencida</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={producer.active ? 'ATIVO' : 'INATIVO'} />
                      </td>
                      <td className="py-3.5 pr-0">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/licencas?producerId=${producer.id}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            title="Ver licenças"
                          >
                            <FileStack className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openEditModal(producer)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProducerToDelete(producer)}
                            disabled={!producer.active}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Desativar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards - mobile */}
            <div className="md:hidden space-y-3">
              {producers.map((producer) => (
                <div key={producer.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{producer.name}</p>
                      <p className="text-xs text-slate-500">{producer.document}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{producer.city}/{producer.state}</p>
                    </div>
                    <StatusBadge status={producer.active ? 'ATIVO' : 'INATIVO'} />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap mt-3">
                    {producer.licensesSummary.vigente > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{producer.licensesSummary.vigente} vigente</span>
                    )}
                    {producer.licensesSummary.vencendo > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{producer.licensesSummary.vencendo} vencendo</span>
                    )}
                    {producer.licensesSummary.vencida > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">{producer.licensesSummary.vencida} vencida</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <Link
                      href={`/admin/licencas?producerId=${producer.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
                    >
                      <FileStack className="w-3.5 h-3.5" /> Licenças
                    </Link>
                    <button
                      onClick={() => openEditModal(producer)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => setProducerToDelete(producer)}
                      disabled={!producer.active}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-semibold disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Desativar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={(next) => loadProducers(next, debouncedSearch)}
              disabled={isLoading}
            />
          </>
        )}
      </div>

      <ProducerFormModal
        open={formOpen}
        mode={formMode}
        initialData={editingProducer}
        isLoadingInitialData={formMode === 'edit' && isLoadingEditTarget}
        isSubmitting={isSubmittingForm}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!producerToDelete}
        title="Desativar produtor?"
        description={`O produtor "${producerToDelete?.name}" será desativado e não aparecerá mais nas listagens ativas. Os dados não serão apagados.`}
        confirmLabel="Desativar"
        onConfirm={handleDeactivate}
        onCancel={() => setProducerToDelete(null)}
      />
    </div>
  );
}
