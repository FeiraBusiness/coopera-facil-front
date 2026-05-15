'use client';

import { useState } from 'react';
import Modal from './Modal';
import type { RuralProducer, RuralProducerInput } from '../lib/types';

const UF_OPTIONS = ['PR', 'SC', 'RS', 'SP', 'MG', 'MS', 'GO', 'BA'];

interface ProducerFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: RuralProducer | null;
  isLoadingInitialData?: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: RuralProducerInput) => Promise<void>;
}

const EMPTY_FORM: RuralProducerInput = {
  name: '',
  document: '',
  phone: '',
  email: '',
  city: '',
  state: 'PR',
  farmName: '',
};

function toFormValues(mode: 'create' | 'edit', initialData?: RuralProducer | null): RuralProducerInput {
  if (mode === 'edit' && initialData) {
    return {
      name: initialData.name,
      document: initialData.document,
      phone: initialData.phone,
      email: initialData.email ?? '',
      city: initialData.city,
      state: initialData.state,
      farmName: initialData.farmName ?? '',
    };
  }
  return EMPTY_FORM;
}

export default function ProducerFormModal({
  open,
  mode,
  initialData,
  isLoadingInitialData,
  isSubmitting,
  onClose,
  onSubmit,
}: ProducerFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Novo produtor' : 'Editar produtor'}
      description={mode === 'create' ? 'Cadastre um novo produtor rural.' : 'Atualize os dados do produtor.'}
    >
      {isLoadingInitialData ? (
        <div className="py-10 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-3 border-blue-200 border-t-blue-700 animate-spin" />
        </div>
      ) : (
        // Remonta o formulário ao trocar de produtor/modo, sem precisar de efeito para resetar estado
        <ProducerForm
          key={mode === 'edit' ? initialData?.id ?? 'edit' : 'create'}
          mode={mode}
          initialData={initialData}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
}

function ProducerForm({
  mode,
  initialData,
  isSubmitting,
  onClose,
  onSubmit,
}: Omit<ProducerFormModalProps, 'open' | 'isLoadingInitialData'>) {
  const [form, setForm] = useState<RuralProducerInput>(() => toFormValues(mode, initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof RuralProducerInput, string>>>({});

  const handleChange = (field: keyof RuralProducerInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};
    if (!form.name.trim()) nextErrors.name = 'Informe o nome';
    if (!form.document.trim()) nextErrors.document = 'Informe o CPF ou CNPJ';
    if (!form.phone.trim()) nextErrors.phone = 'Informe o telefone';
    if (!form.city.trim()) nextErrors.city = 'Informe a cidade';
    if (!form.state.trim()) nextErrors.state = 'Informe a UF';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nome / Razão social *</label>
            <input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                errors.name ? 'border-red-400' : 'border-slate-200'
              }`}
              placeholder="Ex: João Carlos Moreira"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">CPF / CNPJ *</label>
              <input
                value={form.document}
                onChange={(e) => handleChange('document', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  errors.document ? 'border-red-400' : 'border-slate-200'
                }`}
                placeholder="000.000.000-00"
              />
              {errors.document && <p className="text-xs text-red-600 mt-1">{errors.document}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone (WhatsApp) *</label>
              <input
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  errors.phone ? 'border-red-400' : 'border-slate-200'
                }`}
                placeholder="(45) 99999-0000"
              />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
            <input
              type="email"
              value={form.email ?? ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cidade *</label>
              <input
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  errors.city ? 'border-red-400' : 'border-slate-200'
                }`}
                placeholder="Ex: Cascavel"
              />
              {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">UF *</label>
              <select
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full sm:w-24 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {UF_OPTIONS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nome da propriedade</label>
            <input
              value={form.farmName ?? ''}
              onChange={(e) => handleChange('farmName', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Ex: Fazenda Santa Luzia"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? 'Salvando...' : mode === 'create' ? 'Cadastrar' : 'Salvar alterações'}
            </button>
          </div>
        </form>
  );
}
