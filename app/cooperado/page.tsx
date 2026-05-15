'use client';

import Spinner from '@/app/admin/components/Spinner';
import { useLicense } from '@/app/contexts/LicenseContext';
import { mockDadosLicencaCooperado } from '@/app/utils/mock-legacy-data';
import { AlertTriangle, ArrowRight, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Licenciamento() {
    const router = useRouter();
    const { isProcessCompleted } = useLicense();
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
                // Integração real com o back-end (GET /api/v1/license/{id}), desativada
                // enquanto o front usa dados mocados:
                //
                // const response = await fetch(`${API_BASE_URL}/dados-licenca/111`, {
                //     headers: { 'ngrok-skip-browser-warning': 'true' },
                // });
                // if (!response.ok) throw new Error('Failed to fetch license data');
                // const data: DadosLicenca[] = await response.json();

                await new Promise((resolve) => setTimeout(resolve, 500));
                const data: DadosLicenca[] = mockDadosLicencaCooperado;

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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xl text-red-600 mb-4">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-blue-700 hover:text-blue-900 underline cursor-pointer"
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
            <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 pt-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
                            MINHAS LICENÇAS
                        </h1>
                    </div>

                    {/* Info Text */}
                    <div className="mb-6 text-center">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                            Ícones e cores indicam status/prazo
                        </p>
                    </div>

                    {/* Completed License Cards */}
                    <div className="space-y-3">
                        {completedLicenses.map((license, index) => {
                            // Define cores e ícones baseados no status
                            const statusConfig = {
                                expired: {
                                    bg: 'bg-red-50',
                                    hover: 'hover:bg-red-100',
                                    border: 'border-red-500',
                                    icon: 'text-red-700',
                                    IconComponent: AlertTriangle,
                                },
                                'expiring-soon': {
                                    bg: 'bg-amber-50',
                                    hover: 'hover:bg-amber-100',
                                    border: 'border-amber-500',
                                    icon: 'text-amber-700',
                                    IconComponent: Clock,
                                },
                                valid: {
                                    bg: 'bg-emerald-50',
                                    hover: 'hover:bg-emerald-100',
                                    border: 'border-emerald-500',
                                    icon: 'text-emerald-700',
                                    IconComponent: CheckCircle,
                                },
                                info: {
                                    bg: 'bg-blue-50',
                                    hover: 'hover:bg-blue-100',
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
                                    className={`${config.bg} rounded-xl p-4 flex items-center justify-between ${config.hover} transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md border-l-4 ${config.border}`}
                                >
                                    <div className="flex justify-center items-center gap-4">
                                        <StatusIcon className={`w-7 h-7 ${config.icon}`} />
                                        <div className="flex justify-between items-center gap-4">
                                            <span>
                                                <p className="font-bold text-base text-slate-900">{license.title}</p>
                                                {license.expiryDate && (
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        Vencimento: {license.expiryDate}
                                                    </p>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-7 h-7 text-blue-700" />
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
        <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8 pt-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
                        PROCESSO - LICENÇAS AMBIENTAIS
                    </h1>

                    {/* Progress Bar */}
                    <div className="mb-2">
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${totalProgress}%` }}
                            />
                        </div>
                    </div>
                    <p className="text-lg font-semibold text-emerald-600 text-center">
                        {totalProgress}% Concluído
                    </p>
                </div>

                {/* License Cards */}
                <div className="space-y-3">
                    {licenses.map((license, index) => {
                        // Define cores e ícones baseados no status
                        const statusConfig = {
                            OK: {
                                bg: 'bg-emerald-50',
                                hover: 'hover:bg-emerald-100',
                                border: 'border-emerald-500',
                                icon: 'text-emerald-700',
                                IconComponent: CheckCircle,
                            },
                            ATENCAO: {
                                bg: 'bg-amber-50',
                                hover: 'hover:bg-amber-100',
                                border: 'border-amber-500',
                                icon: 'text-amber-700',
                                IconComponent: Clock,
                            },
                            INVALIDO: {
                                bg: 'bg-red-50',
                                hover: 'hover:bg-red-100',
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
                                className={`${config.bg} rounded-xl p-4 flex items-center justify-between ${config.hover} transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md border-l-4 ${config.border}`}
                            >
                                <div className="flex justify-center items-center gap-4">
                                    <StatusIcon className={`w-7 h-7 ${config.icon}`} />
                                    <div className="flex justify-between items-center gap-4">
                                        <span>
                                            <p className="font-bold text-base text-slate-900">{license.title}</p>
                                            <p className="text-xs text-slate-600 mb-1">Em andamento</p>
                                        </span>
                                        <span>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                                                    {license.progress}% concluído
                                                </span>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight className="w-7 h-7 text-blue-700" />
                            </div>
                        );
                    })}
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        Toque em uma licença para ver mais detalhes
                    </p>
                </div>
            </div>
        </div>
    );
}