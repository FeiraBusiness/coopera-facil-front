'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, AlertTriangle, ArrowRight, Calendar, Clock } from 'lucide-react';
import { useLicense } from '@/app/contexts/LicenseContext';
import { useState, useEffect } from 'react';
import { ok } from "assert";

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

interface License {
  id: number;
  title: string;
  progress: number;
  status: 'OK' | 'ATENCAO' | 'INVALIDO';
}

interface CompletedLicense {
  id: number;
  title: string;
  expiryDate: string;
  statusType: 'expired' | 'expiring-soon' | 'valid' | 'info';
}

const API_BASE_URL = 'https://inspective-tamica-fatuously.ngrok-free.dev';

export default function Licenciamento() {
  const router = useRouter();
  const { isProcessCompleted } = useLicense();
  const [dadosLicenca, setDadosLicenca] = useState<DadosLicenca[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [completedLicenses, setCompletedLicenses] = useState<CompletedLicense[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    const fetchLicenseData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/dados-licenca/111`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch license data');
        }

        const data: DadosLicenca[] = await response.json();
        setDadosLicenca(data);

        // Get only the first license
        const primeiraLicenca = data[0];
        
        if (!primeiraLicenca) {
          setError('Nenhuma licença encontrada');
          return;
        }

        // Transform first license to License format
        const progress = parseFloat(primeiraLicenca.pessoa.porcentagem) || 0;
        let status: License['status'] = 'OK';
        
        if (primeiraLicenca.pessoa.status === 'OK') {
          status = 'OK';
        } else if (primeiraLicenca.pessoa.status === 'ATENCAO') {
          status = 'ATENCAO';
        } else if (primeiraLicenca.pessoa.status === 'INVALIDO') {
          status = 'INVALIDO';
        }

        const transformedLicenses: License[] = [{
          id: primeiraLicenca.pessoa.id,
          title: primeiraLicenca.descricao || 'LICENÇA AMBIENTAL',
          progress,
          status,
        }];

        setLicenses(transformedLicenses);

        // Transform only first license documents to completed licenses format
        const transformedCompleted: CompletedLicense[] = primeiraLicenca.documentos.map((doc) => {
          let statusType: CompletedLicense['statusType'] = 'info';
          
          if (primeiraLicenca.pessoa.status === 'OK') {
            statusType = 'valid';
          } else if (primeiraLicenca.pessoa.status === 'ATENCAO') {
            statusType = 'expiring-soon';
          } else if (primeiraLicenca.pessoa.status === 'INVALIDO') {
            statusType = 'expired';
          }

          return {
            id: primeiraLicenca.pessoa.id,
            title: primeiraLicenca.descricao || doc.nome || 'LICENÇA AMBIENTAL',
            expiryDate: formatDate(doc.validadeLicenca),
            statusType,
          };
        });

        setCompletedLicenses(transformedCompleted);

        // Set total progress from first license
        setTotalProgress(Math.round(progress));
      } catch (err) {
        console.error('Error fetching license data:', err);
        setError('Erro ao carregar dados das licenças');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLicenseData();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const handleCardClick = (licenseId: number) => {
    router.push(`/cooperado/licenciamento/111`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          <div className="text-xl text-gray-600">Carregando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderização condicional baseada no status do processo
  if (isProcessCompleted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 pt-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-6">
              MINHAS LICENÇAS
            </h1>
          </div>

          {/* Info Text */}
          <div className="mb-6 text-center">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Ícones e cores indicam status/prazo
            </p>
          </div>

          {/* Completed License Cards */}
          <div className="space-y-4">
            {completedLicenses.map((license, index) => {
              // Define cores e ícones baseados no status
              const statusConfig = {
                expired: {
                  bg: 'from-red-50 to-white',
                  border: 'border-red-500',
                  icon: 'text-red-700',
                  IconComponent: AlertTriangle,
                },
                'expiring-soon': {
                  bg: 'from-yellow-50 to-white',
                  border: 'border-yellow-500',
                  icon: 'text-yellow-700',
                  IconComponent: Clock,
                },
                valid: {
                  bg: 'from-green-50 to-white',
                  border: 'border-green-500',
                  icon: 'text-green-700',
                  IconComponent: CheckCircle,
                },
                info: {
                  bg: 'from-blue-50 to-white',
                  border: 'border-blue-500',
                  icon: 'text-blue-700',
                  IconComponent: Calendar,
                },
              };

              const config = statusConfig[license.statusType];
              const StatusIcon = config.IconComponent;

              return (
              <div
                key={`${license.id}-${index}`}
                onClick={() => handleCardClick(license.id)}
                className={`bg-linear-to-r ${config.bg} rounded-xl p-4 flex items-center justify-between hover:from-${config.bg.split('-')[1]}-100 hover:to-${config.bg.split('-')[1]}-50 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-102 border-l-4 ${config.border}`}
              >
                <div className="flex justify-center items-center gap-4">
                  <StatusIcon className={`w-7 h-7 ${config.icon} animate-pulse`} />
                  <div className="flex justify-between items-center gap-4">
                    <span>
                      <p className="font-bold text-base text-gray-900">{license.title}</p>
                      {license.expiryDate && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          Vencimento: {license.expiryDate}
                        </p>
                      )}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-7 h-7 text-[#1f4585]" />
              </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Renderização da tela de progresso (original)
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 pt-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-6">
            PROCESSO - LICENÇAS AMBIENTAIS
          </h1>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="h-3 bg-gray-300 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-linear-to-r from-green-500 to-green-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
          <p className="text-lg font-semibold text-green-500 text-center">
            {totalProgress}% Concluído
          </p>
        </div>

        {/* License Cards */}
        <div className="space-y-4">
          {licenses.map((license, index) => {
            // Define cores e ícones baseados no status
            const statusConfig = {
              OK: {
                bg: 'from-green-50 to-white',
                border: 'border-green-500',
                icon: 'text-green-700',
                IconComponent: CheckCircle,
              },
              ATENCAO: {
                bg: 'from-yellow-50 to-white',
                border: 'border-yellow-500',
                icon: 'text-yellow-700',
                IconComponent: Clock,
              },
              INVALIDO: {
                bg: 'from-red-50 to-white',
                border: 'border-red-500',
                icon: 'text-red-700',
                IconComponent: AlertTriangle,
              }
            };

            const config = statusConfig[license.status];
            const StatusIcon = config.IconComponent;

            return (
            <div
              key={`${license.id}-${index}`}
              onClick={() => handleCardClick(license.id)}
              className={`bg-linear-to-r ${config.bg} rounded-xl p-4 flex items-center justify-between hover:from-${config.bg.split('-')[1]}-100 hover:to-${config.bg.split('-')[1]}-50 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-102 border-l-4 ${config.border}`}
            >
              <div className="flex justify-center items-center gap-4">
                <StatusIcon className={`w-7 h-7 ${config.icon} animate-pulse`} />
                <div className="flex justify-between items-center gap-4">
                  <span>
                    <p className="font-bold text-base text-gray-900">{license.title}</p>
                    <p className="text-xs text-gray-600 mb-1">Em andamento</p>
                  </span>
                  <span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                        {license.progress}% concluído
                      </span>
                    </div>
                  </span>
                </div>
              </div>
              <ArrowRight className="w-7 h-7 text-[#1f4585]" />
            </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Toque em uma licença para ver mais detalhes
          </p>
        </div>
      </div>
    </div>
  );
}