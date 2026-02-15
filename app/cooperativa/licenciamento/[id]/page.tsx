'use client';

import { ArrowLeft, CheckCircle, Clock, Bell, Download } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { use, useState, useEffect } from 'react';

interface Documento {
  especie: string;
  id: number;
  nome: string;
  producaoAno: string;
  url: string;
  validadeLicenca: string;
}

interface Pessoa {
  cnpj: string;
  id: number;
  nome: string;
  porcentagem: string;
  status: 'OK' | 'ATENCAO' | 'INVALIDO';
  tipoPessoa: string;
  tipoProcesso: string;
}

interface DadosLicenca {
  descricao: string;
  documentos: Documento[];
  fase: string | null;
  id: number;
  nomeArquivo: string | null;
  pessoa: Pessoa;
  status: 'OK' | 'ATENCAO' | 'INVALIDO';
}

const API_BASE_URL = 'https://inspective-tamica-fatuously.ngrok-free.dev';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

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
        const response = await fetch(`${API_BASE_URL}/dados-licenca/${id}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch license data');
        }

        const data: DadosLicenca[] = await response.json();
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
      const response = await fetch(`${API_BASE_URL}/send/alert/${docId}`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send alert');
      }

      showToast('Notificação enviada com sucesso!', 'success');
    } catch (err) {
      console.error('Error sending alert:', err);
      showToast('Erro ao enviar notificação', 'error');
    } finally {
      setSendingAlert(null);
    }
  };

  const getDownloadUrl = (mediaUrl: string) => {
    return `${API_BASE_URL}/download-pdf?mediaUrl=https://api.twilio.com/2010-04-01/Accounts/AC6db14e3da47121724794df93e93cc344/Messages/MMdaa1d99b11051f6a30d6744c145b79de/Media/ME84cfed98c7f734269ec4182a8a7bc21f`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-blue-100">
        <header className="bg-white shadow-lg p-4 mb-6 border-b-4 border-blue-200">
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-700"></div>
        </div>
      </div>
    );
  }

  if (error || !primeiraLicenca) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-blue-100">
        <header className="bg-white shadow-lg p-4 mb-6 border-b-4 border-blue-200">
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
          <Link href="/cooperativa" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-semibold transition-colors">
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-blue-100">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-75 ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
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
              className="text-white hover:text-gray-200 font-bold text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-lg p-4 mb-6 border-b-4 border-blue-200">
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
        <Link href="/cooperativa" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Link>

        {/* Título */}
        <h1 className="text-3xl font-bold text-blue-900 mb-6">
          {primeiraLicenca.descricao} - DOCUMENTOS
        </h1>

        {/* Barra de Progresso */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
          <p className="text-blue-600 text-sm font-semibold mb-3">
            {totalDocumentos} documento{totalDocumentos !== 1 ? 's' : ''} cadastrado{totalDocumentos !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="bg-linear-to-r from-yellow-500 via-yellow-400 to-yellow-300 h-full rounded-full transition-all duration-1000"
                style={{ width: `${porcentagemConcluida}%` }}
              />
            </div>
            <span className="text-2xl font-bold text-yellow-600">{porcentagemConcluida}% concluído</span>
          </div>
        </div>

        {/* Dados da Empresa e Pessoa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Dados da Empresa/Pessoa */}
          <div className="bg-white rounded-2xl p-4 shadow-xl">
            <h2 className="text-lg font-bold text-blue-600 mb-3">
              Dados {pessoa.tipoPessoa === 'COOPERATIVA' ? 'da cooperativa' : 'do cooperado'}
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold text-blue-600">Nome:</p>
                <p className="text-sm text-gray-700">{pessoa.nome}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600">CNPJ:</p>
                <p className="text-sm text-gray-700">{pessoa.cnpj}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-blue-600">Tipo:</p>
                  <p className="text-sm text-gray-700">{pessoa.tipoPessoa}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-600">Status:</p>
                  <p className="text-sm font-semibold text-blue-600">{getStatusLabel(pessoa.status)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Processo */}
          <div className="bg-white rounded-2xl p-4 shadow-xl">
            <h2 className="text-lg font-bold text-blue-600 mb-3">Informações do processo</h2>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold text-blue-600">Tipo de processo:</p>
                <p className="text-sm text-gray-700">{pessoa.tipoProcesso}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600">Porcentagem concluída:</p>
                <p className="text-sm text-gray-700">{pessoa.porcentagem}%</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600">Total de licenças:</p>
                <p className="text-sm text-gray-700">{dadosLicenca.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentos por Licença */}
        {dadosLicenca.map((licenca) => (
          <div key={licenca.id} className="bg-white rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-600">{licenca.descricao}</h2>
              <span
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  licenca.status === 'OK'
                    ? 'bg-green-100 text-green-700'
                    : licenca.status === 'ATENCAO'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {getStatusLabel(licenca.status)}
              </span>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {licenca.documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 border-l-4 border-blue-400"
                >
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div>
                      {licenca.status === 'OK' ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <Clock className="w-8 h-8 text-yellow-500" />
                      )}
                    </div>

                    {/* Document Info */}
                    <div>
                      <p className="font-bold text-sm text-gray-900">{doc.nome}</p>
                      <p className="text-xs text-gray-600">Espécie: {doc.especie}</p>
                      <p className="text-xs text-gray-600">
                        Validade: {formatDate(doc.validadeLicenca)}
                      </p>
                      <p className="text-xs text-gray-600">Produção/Ano: {doc.producaoAno} Kg</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <a
                      href={getDownloadUrl(doc.url)}
                      download
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-semibold">Download</span>
                    </a>
                    <button
                      onClick={() => handleSendAlert(doc.id)}
                      disabled={sendingAlert === doc.id}
                      className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${licenca.status !== 'ATENCAO' ? 'hidden' : ''}`}
                    >
                      {sendingAlert === doc.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold cursor-pointer">Notificar</span>
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
