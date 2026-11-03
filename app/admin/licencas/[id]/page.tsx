'use client';

import { AlertTriangle, ArrowLeft, Bot, CheckCircle2, ExternalLink, FileWarning, PenLine, Save, ScanText } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState, type ReactNode } from 'react';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/ToastProvider';
import { errorMessage, getLicense, updateLicense } from '../../lib/api';
import { LICENSE_TYPES, type ExtractedField, type License, type LicenseTypeCode } from '../../lib/types';

// Valores do formulário: tudo texto, como nos inputs; a conversão acontece ao salvar.
interface FormValues {
  typeCode: LicenseTypeCode;
  number: string;
  protocolNumber: string;
  issuingAgency: string;
  issueDate: string;
  expirationDate: string;
  holderName: string;
  holderDocument: string;
  municipality: string;
  activity: string;
  cultivatedSpecies: string;
  annualProductionKg: string;
}

// "2027-06-28T00:00:00" -> "2027-06-28", formato do <input type="date">.
function toDateInput(value: string | null) {
  return value ? value.slice(0, 10) : '';
}

function toFormValues(license: License): FormValues {
  return {
    typeCode: license.typeCode,
    number: license.number,
    protocolNumber: license.protocolNumber ?? '',
    issuingAgency: license.issuingAgency,
    issueDate: toDateInput(license.issueDate),
    expirationDate: toDateInput(license.expirationDate),
    holderName: license.holderName ?? '',
    holderDocument: license.holderDocument ?? '',
    municipality: license.municipality ?? '',
    activity: license.activity ?? '',
    cultivatedSpecies: license.cultivatedSpecies ?? '',
    annualProductionKg: license.annualProductionKg?.toString() ?? '',
  };
}

function daysRemainingText(days: number) {
  if (days < 0) return `Vencida há ${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''}`;
  if (days === 0) return 'Vence hoje';
  return `Vence em ${days} dia${days !== 1 ? 's' : ''}`;
}

// Selo ao lado de cada campo: de onde veio o valor e se já foi revisado.
function FieldBadge({ field }: { field?: ExtractedField }) {
  if (!field) {
    return <span className="text-[11px] font-semibold text-slate-400">Não identificado no documento</span>;
  }

  if (field.source === 'MANUAL') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
        <PenLine className="w-3 h-3" /> Corrigido manualmente
      </span>
    );
  }

  if (field.source === 'RULE') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
        <ScanText className="w-3 h-3" /> Identificado por regra{field.reviewed && ' · revisado'}
      </span>
    );
  }

  const percent = Math.round((field.confidence ?? 0) * 100);
  return field.lowConfidence && !field.reviewed ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
      <AlertTriangle className="w-3 h-3" /> IA · {percent}% · revisar
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
      <Bot className="w-3 h-3" /> IA · {percent}%{field.reviewed && ' · revisado'}
    </span>
  );
}

function FormField({ label, field, children }: { label: string; field?: ExtractedField; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <label className="text-xs font-semibold text-slate-600">{label}</label>
        <FieldBadge field={field} />
      </div>
      {children}
    </div>
  );
}

function inputClass(field?: ExtractedField) {
  const highlight = field?.lowConfidence && !field.reviewed;
  return `w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 transition-colors ${
    highlight
      ? 'border-amber-300 bg-amber-50/50 focus:border-amber-500 focus:ring-amber-100'
      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
  }`;
}

export default function LicenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { showToast } = useToast();

  const [license, setLicense] = useState<License | null>(null);
  const [form, setForm] = useState<FormValues | null>(null);
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
        setForm(toFormValues(data));
      })
      .catch((err) => active && setError(errorMessage(err, 'Licença não encontrada')))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (key: keyof FormValues, value: string) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!form) return;
    if (!form.expirationDate) {
      showToast('Informe a data de validade', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateLicense(id, {
        ...form,
        annualProductionKg: form.annualProductionKg === '' ? null : Number(form.annualProductionKg),
      });
      setLicense(updated);
      setForm(toFormValues(updated));
      showToast('Revisão salva com sucesso!');
    } catch (err) {
      // Regras da API (ex.: emissão depois da validade) chegam aqui com a mensagem pronta.
      showToast(errorMessage(err, 'Erro ao salvar a revisão'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Spinner size="lg" />;

  if (error || !license || !form) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
        <p className="text-red-600 font-semibold">{error ?? 'Licença não encontrada'}</p>
        <Link href="/admin/licencas" className="inline-flex items-center gap-1 text-blue-700 font-semibold mt-3">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </div>
    );
  }

  // Campo extraído correspondente a cada input, pela mesma chave usada na API.
  const fieldOf = (key: string) => license.extractedFields.find((f) => f.key === key);
  const pendingReview = license.extractedFields.filter((f) => f.lowConfidence && !f.reviewed).length;
  const allReviewed = license.extractedFields.length > 0 && license.extractedFields.every((f) => f.reviewed);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link href="/admin/licencas" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-2 font-medium">
            <ArrowLeft className="w-4 h-4" /> Voltar para licenças
          </Link>
          <h2 className="text-xl font-bold text-slate-900">{license.producerName}</h2>
          <p className="text-sm text-slate-500">
            {license.type}
            {license.number && ` · Nº ${license.number}`}
          </p>
        </div>
        <div className="text-right">
          <StatusBadge status={license.status} />
          <p className="text-xs text-slate-500 mt-1.5 font-medium">{daysRemainingText(license.daysRemaining)}</p>
        </div>
      </div>

      {pendingReview > 0 ? (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <FileWarning className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{pendingReview} campo(s)</span> com baixa confiança de leitura pela IA. Confira com o documento original e salve a revisão.
          </p>
        </div>
      ) : allReviewed ? (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800 font-medium">Licença revisada: todos os campos foram conferidos.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Documento original, lado a lado com os dados para conferência */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900">Documento original</h3>
            {license.fileUrl && (
              <a
                href={license.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                Abrir em nova aba <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          {license.fileUrl ? (
            <iframe
              src={license.fileUrl}
              title={license.fileName}
              className="w-full flex-1 min-h-[480px] lg:min-h-[640px] rounded-xl border border-slate-200 bg-slate-50"
            />
          ) : (
            <div className="flex-1 min-h-[300px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-sm text-slate-400">
              Arquivo não disponível
            </div>
          )}
          <p className="text-xs text-slate-400 mt-2 truncate">{license.fileName}</p>
        </div>

        {/* Dados extraídos: editar o que estiver errado e salvar a revisão */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Dados extraídos</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Tipo de licença" field={fieldOf('type')}>
              <select
                value={form.typeCode}
                onChange={(e) => handleChange('typeCode', e.target.value)}
                className={inputClass(fieldOf('type'))}
              >
                {LICENSE_TYPES.map((t) => (
                  <option key={t.code} value={t.code}>{t.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Número da licença" field={fieldOf('number')}>
              <input value={form.number} onChange={(e) => handleChange('number', e.target.value)} className={inputClass(fieldOf('number'))} />
            </FormField>
            <FormField label="Órgão emissor" field={fieldOf('issuingAgency')}>
              <input value={form.issuingAgency} onChange={(e) => handleChange('issuingAgency', e.target.value)} className={inputClass(fieldOf('issuingAgency'))} />
            </FormField>
            <FormField label="Número do protocolo" field={fieldOf('protocolNumber')}>
              <input value={form.protocolNumber} onChange={(e) => handleChange('protocolNumber', e.target.value)} className={inputClass(fieldOf('protocolNumber'))} />
            </FormField>
            <FormField label="Emissão" field={fieldOf('issueDate')}>
              <input type="date" value={form.issueDate} onChange={(e) => handleChange('issueDate', e.target.value)} className={inputClass(fieldOf('issueDate'))} />
            </FormField>
            <FormField label="Validade *" field={fieldOf('expirationDate')}>
              <input type="date" value={form.expirationDate} onChange={(e) => handleChange('expirationDate', e.target.value)} className={inputClass(fieldOf('expirationDate'))} />
            </FormField>
          </div>

          <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Titular" field={fieldOf('holderName')}>
              <input value={form.holderName} onChange={(e) => handleChange('holderName', e.target.value)} className={inputClass(fieldOf('holderName'))} />
            </FormField>
            <FormField label="CPF/CNPJ do titular" field={fieldOf('holderDocument')}>
              <input value={form.holderDocument} onChange={(e) => handleChange('holderDocument', e.target.value)} className={inputClass(fieldOf('holderDocument'))} />
            </FormField>
            <FormField label="Município/UF" field={fieldOf('municipality')}>
              <input value={form.municipality} onChange={(e) => handleChange('municipality', e.target.value)} className={inputClass(fieldOf('municipality'))} />
            </FormField>
            <FormField label="Produção anual (kg)" field={fieldOf('annualProductionKg')}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.annualProductionKg}
                onChange={(e) => handleChange('annualProductionKg', e.target.value)}
                className={inputClass(fieldOf('annualProductionKg'))}
              />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Atividade" field={fieldOf('activity')}>
                <input value={form.activity} onChange={(e) => handleChange('activity', e.target.value)} className={inputClass(fieldOf('activity'))} />
              </FormField>
            </div>
            <div className="sm:col-span-2">
              <FormField label="Espécies cultivadas" field={fieldOf('cultivatedSpecies')}>
                <input value={form.cultivatedSpecies} onChange={(e) => handleChange('cultivatedSpecies', e.target.value)} className={inputClass(fieldOf('cultivatedSpecies'))} />
              </FormField>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-700 text-white font-semibold text-sm hover:bg-blue-800 transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Salvando revisão...' : 'Salvar revisão'}
          </button>
          <p className="text-xs text-slate-400 text-center">
            Ao salvar, todos os campos ficam marcados como revisados. Os alterados ficam registrados como correção manual.
          </p>
        </div>
      </div>
    </div>
  );
}