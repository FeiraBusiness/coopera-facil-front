'use client';

import { AlertTriangle, ArrowLeft, Check, FileWarning, Save } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/ToastProvider';
import { getLicense, updateLicense } from '../../lib/api';
import type { ExtractedField, License } from '../../lib/types';

function toDateInputValue(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function LicenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { showToast } = useToast();

  const [license, setLicense] = useState<License | null>(null);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [header, setHeader] = useState({ type: '', number: '', issuingAgency: '', issueDate: '', expirationDate: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getLicense(id)
      .then((data) => {
        if (!active) return;
        setLicense(data);
        setFields(data.extractedFields);
        setHeader({
          type: data.type,
          number: data.number,
          issuingAgency: data.issuingAgency,
          issueDate: toDateInputValue(data.issueDate),
          expirationDate: toDateInputValue(data.expirationDate),
        });
      })
      .catch(() => setError('Licença não encontrada'))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value, reviewed: true } : f)));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateLicense(id, {
        type: header.type,
        number: header.number,
        issuingAgency: header.issuingAgency,
        issueDate: new Date(header.issueDate).toISOString(),
        expirationDate: new Date(header.expirationDate).toISOString(),
        extractedFields: fields,
      });
      setLicense(updated);
      showToast('Dados da licença corrigidos com sucesso!');
    } catch {
      showToast('Erro ao salvar correções', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Spinner size="lg" />;

  if (error || !license) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
        <p className="text-red-600 font-semibold">{error ?? 'Licença não encontrada'}</p>
        <Link href="/admin/licencas" className="inline-flex items-center gap-1 text-blue-700 font-semibold mt-3">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </div>
    );
  }

  const lowConfidenceFields = fields.filter((f) => f.confidence < 0.85);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link href="/admin/licencas" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-2 font-medium">
            <ArrowLeft className="w-4 h-4" /> Voltar para licenças
          </Link>
          <h2 className="text-xl font-bold text-slate-900">{license.producerName}</h2>
          <p className="text-sm text-slate-500">{license.type} · {license.number}</p>
        </div>
        <StatusBadge status={license.status} />
      </div>

      {lowConfidenceFields.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <FileWarning className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{lowConfidenceFields.length} campo(s)</span> com baixa confiança de leitura pela IA. Revise os campos destacados ao lado do documento original.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* PDF original */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
          <h3 className="font-bold text-slate-900 mb-3">Documento original</h3>
          <div className="aspect-3/4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 text-center p-6">
            <FileWarning className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">{license.fileName}</p>
            <p className="text-xs text-slate-400">Pré-visualização do PDF recebido via WhatsApp</p>
            <a
              href={license.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
            >
              Abrir documento
            </a>
          </div>
        </div>

        {/* Dados extraídos / edição */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 space-y-5">
          <h3 className="font-bold text-slate-900">Dados extraídos pela IA</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de licença</label>
              <input
                value={header.type}
                onChange={(e) => setHeader((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Número do documento</label>
              <input
                value={header.number}
                onChange={(e) => setHeader((prev) => ({ ...prev, number: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Órgão emissor</label>
              <input
                value={header.issuingAgency}
                onChange={(e) => setHeader((prev) => ({ ...prev, issuingAgency: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Emissão</label>
                <input
                  type="date"
                  value={header.issueDate}
                  onChange={(e) => setHeader((prev) => ({ ...prev, issueDate: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Validade</label>
                <input
                  type="date"
                  value={header.expirationDate}
                  onChange={(e) => setHeader((prev) => ({ ...prev, expirationDate: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Campos extraídos do documento</p>
            {fields.map((field) => (
              <div key={field.key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600">{field.label}</label>
                  {field.confidence < 0.85 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                      <AlertTriangle className="w-3 h-3" /> {Math.round(field.confidence * 100)}% confiança
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <Check className="w-3 h-3" /> {Math.round(field.confidence * 100)}% confiança
                    </span>
                  )}
                </div>
                <input
                  value={field.value}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 transition-colors ${
                    field.confidence < 0.85
                      ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-100 bg-amber-50/50'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-700 text-white font-semibold text-sm hover:bg-blue-800 transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Salvando correções...' : 'Salvar correções'}
          </button>
        </div>
      </div>
    </div>
  );
}
