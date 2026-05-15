'use client';

import Spinner from '@/app/admin/components/Spinner';
import { ArrowLeft, CheckCircle, Clock, Bell, Download } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { mockFetchDadosLicencaById } from '@/app/utils/mock-legacy-data';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LicenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [dadosLicenca, setDadosLicenca] = useState<DadosLicenca[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingAlert, setSendingAlert] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchLicenseData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Integração real com o back-end (GET /api/v1/license/{id}), desativada
        // enquanto o front usa dados mocados:
        //
        // const response = await fetch(`${API_BASE_URL}/dados-licenca/${id}`, {
        //   headers: { 'ngrok-skip-browser-warning': 'true' },
        // });
        // if (!response.ok) throw new Error('Failed to fetch license data');
        // const data: DadosLicenca[] = await response.json();

        await new Promise((resolve) => setTimeout(resolve, 500));
        const data: DadosLicenca[] = mockFetchDadosLicencaById(id);
        setDadosLicenca(data);
      } catch (err) {
        console.error('Error fetching license data:', err);
        setError('Erro ao carregar dados da licença');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLicenseData();
  }, [id]);

  // Get first license data (assuming array has at least one item)
  const primeiraLicenca = dadosLicenca[0];
  const pessoa = primeiraLicenca?.pessoa;
  
  // Calculate progress
  const totalDocumentos = dadosLicenca.reduce((acc, lic) => acc + lic.documentos.length, 0);
  const documentosAprovados = dadosLicenca.reduce(
    (acc, lic) => acc + lic.documentos.filter(doc => lic.status === 'OK').length,
    0
  );
  const porcentagemConcluida = totalDocumentos > 0 
    ? Math.round((parseFloat(pessoa?.porcentagem || '0') * 100) / 100) 
    : 0;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OK':
        return 'Aprovado';
      case 'ATENCAO':
        return 'Em análise';
      case 'INVALIDO':
        return 'Pendente';
      default:
        return status;
    }
  };

  const handleSendAlert = async (docId: number) => {
    setSendingAlert(docId);
    try {
      // Integração real com o back-end (reenvio de notificação via WhatsApp),
      // desativada enquanto o front usa dados mocados:
      //
      // const response = await fetch(`${API_BASE_URL}/send/alert/${docId}`, {
      //   method: 'POST',
      //   headers: { 'ngrok-skip-browser-warning': 'true' },
      // });
      // if (!response.ok) throw new Error('Failed to send alert');

      await new Promise((resolve) => setTimeout(resolve, 600));

      showToast('Notificação enviada com sucesso!', 'success');
    } catch (err) {
      console.error('Error sending alert:', err);
      showToast('Erro ao enviar notificação', 'error');
    } finally {
      setSendingAlert(null);
    }
  };

  const getDownloadUrl = (mediaUrl: string) => {
    // Integração real com o back-end faria o proxy do download via mediaUrl do Twilio;
    // em modo mocado, o próprio arquivo mocado já é retornado.
    return mediaUrl;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-center">
            <Image
              src="/logo_completa.svg"
              alt="CooperaFácil"
              width={240}
              height={60}
              priority
            />
          </div>
        </header>
        <div className="container mx-auto px-4 pb-6 flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !primeiraLicenca) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-center">
            <Image
              src="/logo_completa.svg"
              alt="CooperaFácil"
              width={240}
              height={60}
              priority
            />
          </div>
        </header>
        <div className="container mx-auto px-4 pb-6">
          <Link href="/cooperativa" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-4 font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-semibold">{error || 'Licença não encontrada'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-75 ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <Bell className="w-6 h-6" />
            )}
            <p className="font-semibold flex-1">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="text-white hover:text-slate-200 font-bold text-xl cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 mb-6">
        <div className="flex items-center justify-center">
          <Image
            src="/logo_completa.svg"
            alt="CooperaFácil"
            width={240}
            height={60}
            priority
          />
        </div>
      </header>

      <div className="container mx-auto px-4 pb-6">
        {/* Voltar */}
        <Link href="/cooperativa" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-4 font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Link>

        {/* Título */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
          {primeiraLicenca.descricao} - DOCUMENTOS
        </h1>

        {/* Barra de Progresso */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 mb-6">
          <p className="text-blue-700 text-sm font-semibold mb-3">
            {totalDocumentos} documento{totalDocumentos !== 1 ? 's' : ''} cadastrado{totalDocumentos !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${porcentagemConcluida}%` }}
              />
            </div>
            <span className="text-xl font-bold text-amber-600">{porcentagemConcluida}% concluído</span>
          </div>
        </div>

        {/* Dados da Empresa e Pessoa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Dados da Empresa/Pessoa */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-blue-700 mb-3">
              Dados {pessoa.tipoPessoa === 'COOPERATIVA' ? 'da cooperativa' : 'do cooperado'}
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold text-blue-700">Nome:</p>
                <p className="text-sm text-slate-700">{pessoa.nome}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-700">CNPJ:</p>
                <p className="text-sm text-slate-700">{pessoa.cnpj}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-blue-700">Tipo:</p>
                  <p className="text-sm text-slate-700">{pessoa.tipoPessoa}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700">Status:</p>
                  <p className="text-sm font-semibold text-blue-700">{getStatusLabel(pessoa.status)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Processo */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-blue-700 mb-3">Informações do processo</h2>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold text-blue-700">Tipo de processo:</p>
                <p className="text-sm text-slate-700">{pessoa.tipoProcesso}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-700">Porcentagem concluída:</p>
                <p className="text-sm text-slate-700">{pessoa.porcentagem}%</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-700">Total de licenças:</p>
                <p className="text-sm text-slate-700">{dadosLicenca.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentos por Licença */}
        {dadosLicenca.map((licenca) => (
          <div key={licenca.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-blue-700">{licenca.descricao}</h2>
              <span
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  licenca.status === 'OK'
                    ? 'bg-emerald-100 text-emerald-700'
                    : licenca.status === 'ATENCAO'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {getStatusLabel(licenca.status)}
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {licenca.documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-300 border-l-4 border-blue-400"
                >
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div>
                      {licenca.status === 'OK' ? (
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                      ) : (
                        <Clock className="w-8 h-8 text-amber-500" />
                      )}
                    </div>

                    {/* Document Info */}
                    <div>
                      <p className="font-bold text-sm text-slate-900">{doc.nome}</p>
                      <p className="text-xs text-slate-600">Espécie: {doc.especie}</p>
                      <p className="text-xs text-slate-600">
                        Validade: {formatDate(doc.validadeLicenca)}
                      </p>
                      <p className="text-xs text-slate-600">Produção/Ano: {doc.producaoAno} Kg</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <a
                      href={getDownloadUrl(doc.url)}
                      download
                      className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-semibold">Download</span>
                    </a>
                    <button
                      onClick={() => handleSendAlert(doc.id)}
                      disabled={sendingAlert === doc.id}
                      className={`flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${licenca.status !== 'ATENCAO' ? 'hidden' : ''}`}
                    >
                      {sendingAlert === doc.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">Notificar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
