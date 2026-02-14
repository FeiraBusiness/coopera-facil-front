'use client';

import { AlertTriangle, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Licenciamento() {
    const [activeTab, setActiveTab] = useState<TabType>('cooperados');
    const [selectedStatus, setSelectedStatus] = useState<StatusType>("ATENCAO");
    const [stats, setStats] = useState<Stats>({
        total: 0,
        regular: 0,
        pending: 0,
        expired: 0,
    });
    const [statusDtoData, setStatusDtoData] = useState<StatusDto[]>([]);
    const [estimates, setEstimates] = useState<Estimates>({
        avgValue: 0,
        valuePercentage: 0,
        avgWeight: 0,
        weightPercentage: 0,
        totalGeneral: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingLicenses, setIsLoadingLicenses] = useState(false);
    const [licenses, setLicenses] = useState<CooperadoLicense[]>([]);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(5);
    const [valorTotal, setValorTotal] = useState(0);

    // Fetch licenses by status
    const fetchLicenses = async (status: StatusType, page: number = 0) => {
        if (!status) {
            setLicenses([]);
            setCurrentPage(0);
            setTotalPages(0);
            setTotalElements(0);
            return;
        }

        setIsLoadingLicenses(true);
        try {
            const tipoProcesso = activeTab === 'cooperados' ? 'COOPERADO' : 'EM_PROCESSO';
            const statusParam = status === 'TUDO' ? '' : `&status=${status}`;
            const response = await fetch(
                `${API_BASE_URL}/licenca?tipoProcesso=${tipoProcesso}${statusParam}&pageNumber=${page}&size=${pageSize}`,
                {
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch licenses');
            }

            const data: PaginatedLicenseResponse = await response.json();

            // Update pagination state from API response
            setCurrentPage(data.number);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);

            // Transform API data to local format
            const transformedLicenses: CooperadoLicense[] = data.content.map((license) => {
                return {
                    id: license.id.toString(),
                    name: license.pessoa?.nome || license.nome,
                    document: license.cnpj,
                    status: license.status as 'OK' | 'ATENCAO' | 'INVALIDO',
                    porcentagem: license.porcentagem,
                    cnpj: license.cnpj,
                    descricao: license.descricao,
                    dataExpiracao: license.dataExpiracao,
                    pessoa: license.pessoa ? {
                        nome: license.pessoa.nome,
                        status: license.pessoa.status,
                        tipoPessoa: license.pessoa.tipoPessoa,
                        porcentagem: license.pessoa.porcentagem,
                    } : undefined,
                };
            });

            setLicenses(transformedLicenses);
        } catch (error) {
            console.error('Error fetching licenses:', error);
            setLicenses([]);
            setCurrentPage(0);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setIsLoadingLicenses(false);
        }
    };

    // Fetch licenses when selectedStatus or activeTab changes
    useEffect(() => {
        fetchLicenses(selectedStatus, 0);
    }, [selectedStatus, activeTab]);

    // Pagination handlers
    const goToPreviousPage = () => {
        if (currentPage > 0 && !isLoadingLicenses) {
            fetchLicenses(selectedStatus, currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages - 1 && !isLoadingLicenses) {
            fetchLicenses(selectedStatus, currentPage + 1);
        }
    };

    const goToPage = (pageNumber: number) => {
        if (pageNumber >= 0 && pageNumber < totalPages && !isLoadingLicenses) {
            fetchLicenses(selectedStatus, pageNumber);
        }
    };

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const tipoProcesso = activeTab === 'cooperados' ? 'COOPERADO' : 'EM_PROCESSO';
                const response = await fetch(
                    `${API_BASE_URL}/pessoa/total?tipoProcesso=${tipoProcesso}`,
                    {
                        headers: {
                            'ngrok-skip-browser-warning': 'true',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const data: ApiResponse = await response.json();

                // Store statusDto for dynamic estimates
                setStatusDtoData(data.statusDto);
                setValorTotal(data.valorTotal)

                // Transform API data to stats format
                const okStatus = data.statusDto.find(s => s.status === 'OK');
                const pendenteStatus = data.statusDto.find(s => s.status === 'ATENCAO');
                const invalidoStatus = data.statusDto.find(s => s.status === 'INVALIDO');

                const total = data.statusDto.reduce((acc, curr) => acc + curr.contagem, 0);

                setStats({
                    total,
                    regular: okStatus?.contagem || 0,
                    pending: pendenteStatus?.contagem || 0,
                    expired: invalidoStatus?.contagem || 0,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                // Keep default values on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        setSelectedStatus('ATENCAO'); // Reset to ATENCAO when tab changes
    }, [activeTab]);

    // Update estimates when selectedStatus changes
    useEffect(() => {
        if (!selectedStatus || selectedStatus === 'TUDO' || statusDtoData.length === 0) {
            return;
        }

        const statusData = statusDtoData.find(s => s.status === selectedStatus);
        if (statusData) {
            const valuePercentage = parseFloat(statusData.porcentagemValorMedioPendentes.replace('%', ''));
            const weightPercentage = parseFloat(statusData.porcentagemPesoPendentes.replace('%', ''));

            setEstimates({
                avgValue: statusData.valorMedioPendentes,
                valuePercentage: isNaN(valuePercentage) ? 0 : valuePercentage,
                avgWeight: statusData.pesoPendentes,
                weightPercentage: isNaN(weightPercentage) ? 0 : weightPercentage,
                totalGeneral: statusData.valorMedioPendentes * (statusData.contagem || 1),
            });
        }
    }, [selectedStatus, statusDtoData]);

    // Handlers for stat cards
    const handleStatClick = (status: StatusType) => {
        setSelectedStatus(status);
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatWeight = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    const getEstimatesTitle = () => {
        if (!selectedStatus || selectedStatus === 'TUDO') {
            return 'Totais Gerais';
        }
        switch (selectedStatus) {
            case 'OK':
                return activeTab === 'cooperados' ? 'Em Conformidade' : 'Licenças Aprovadas';
            case 'ATENCAO':
                return activeTab === 'cooperados' ? 'À Vencer' : 'Licenças Em Andamento';
            case 'INVALIDO':
                return activeTab === 'cooperados' ? 'Vencidos - Prejuízo Estimado' : 'Licenças Negadas';
            default:
                return 'Totais';
        }
    };

    const getEstimatesSubtitle = () => {
        if (!selectedStatus || selectedStatus === 'TUDO') {
            return 'Valor médio:';
        }
        switch (selectedStatus) {
            case 'OK':
                return 'Valor médio em conformidade:';
            case 'ATENCAO':
                return 'Valor médio pendente:';
            case 'INVALIDO':
                return 'Valor médio de vencidos:';
            default:
                return 'Valor médio:';
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-blue-100">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Coluna Esquerda - Tabs */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Tabs */}
                        <div className="bg-white rounded-2xl p-2 shadow-lg flex gap-2">
                            <button
                                onClick={() => {
                                    setActiveTab('cooperados');
                                    setCurrentPage(1);
                                }}
                                className={`flex-1 w-4/5 rounded-xl font-bold text-base transition-all duration-300 transform ${activeTab === 'cooperados'
                                    ? 'bg-linear-to-r from-blue-500 to-blue-300 text-white shadow-lg'
                                    : 'bg-transparent text-blue-400 hover:bg-blue-50 cursor-pointer'
                                    }`}
                            >
                                Cooperados
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('em-processo');
                                    setCurrentPage(1);
                                }}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-base transition-all duration-300 transform ${activeTab === 'em-processo'
                                    ? 'bg-linear-to-r from-blue-500 to-blue-300 text-white shadow-lg'
                                    : 'bg-transparent text-blue-400 hover:bg-blue-50 cursor-pointer'
                                    }`}
                            >
                                Em processo
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="bg-white rounded-2xl p-6 shadow-xl gap-4 flex flex-col">
                            <h2 className="text-2xl font-bold text-blue-900 mb-3">
                                {activeTab === 'cooperados' ? 'Cooperados' : 'Em processo'}
                            </h2>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div
                                        onClick={() => handleStatClick('TUDO')}
                                        className={`bg-blue-50 rounded-xl p-4 text-center shadow-md hover:shadow-xl  cursor-pointer ${selectedStatus === 'TUDO' ? 'ring-2 ring-blue-500' : ''}`}
                                    >
                                        <p className="text-xs text-blue-700 mb-1 font-semibold">Total</p>
                                        <p className="text-4xl font-bold text-blue-700">{stats.total}</p>
                                    </div>
                                    <div
                                        onClick={() => handleStatClick('OK')}
                                        className={`bg-green-50 rounded-xl p-4 text-center shadow-md hover:shadow-xl  cursor-pointer ${selectedStatus === 'OK' ? 'ring-2 ring-green-600' : ''}`}
                                    >
                                        <p className="text-xs text-green-800 mb-1 font-semibold">{activeTab === 'cooperados' ? 'Em Conformidade' : 'Licença Aprovada'}</p>
                                        <p className="text-4xl font-bold text-green-800">{stats.regular}</p>
                                    </div>
                                    <div
                                        onClick={() => handleStatClick('ATENCAO')}
                                        className={`bg-yellow-50 rounded-xl p-4 text-center shadow-md hover:shadow-xl  cursor-pointer ${selectedStatus === 'ATENCAO' ? 'ring-2 ring-yellow-500' : ''}`}
                                    >
                                        <p className="text-xs text-yellow-800 mb-1 font-semibold">{activeTab === 'cooperados' ? 'À Vencer' : 'Licença Em Andamento'}</p>
                                        <p className="text-4xl font-bold text-yellow-700">{stats.pending}</p>
                                    </div>
                                    <div
                                        onClick={() => handleStatClick('INVALIDO')}
                                        className={`bg-red-50 rounded-xl p-4 text-center shadow-md hover:shadow-xl  cursor-pointer ${selectedStatus === 'INVALIDO' ? 'ring-2 ring-red-600' : ''}`}
                                    >
                                        <p className="text-xs text-red-700 mb-1 font-semibold">{activeTab === 'cooperados' ? 'Vencidos' : 'Licença Negada'}</p>
                                        <p className="text-4xl font-bold text-red-700">{stats.expired}</p>
                                    </div>
                                </div>
                            )}
                            {/* Licenças/Processos List */}
                            <div>
                                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                                    {activeTab === 'cooperados' ? 'Licenças' : 'Processos'}
                                </h3>

                                {selectedStatus === null ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="text-sm">Selecione um status acima para visualizar as licenças</p>
                                    </div>
                                ) : isLoadingLicenses ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                                    </div>
                                ) : licenses.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="text-sm">Nenhuma licença encontrada</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {licenses.map((item) => {
                                            // Define cores e ícones baseados no status
                                            const statusConfig = {
                                                OK: {
                                                    bg: 'from-green-50 to-white',
                                                    hover: 'hover:from-green-100 hover:to-green-50',
                                                    border: 'border-green-500',
                                                    icon: 'text-green-700',
                                                    IconComponent: CheckCircle,
                                                },
                                                ATENCAO: {
                                                    bg: 'from-yellow-50 to-white',
                                                    hover: 'hover:from-yellow-100 hover:to-yellow-50',
                                                    border: 'border-yellow-500',
                                                    icon: 'text-yellow-700',
                                                    IconComponent: Clock,
                                                },
                                                INVALIDO: {
                                                    bg: 'from-red-50 to-white',
                                                    hover: 'hover:from-red-100 hover:to-red-50',
                                                    border: 'border-red-500',
                                                    icon: 'text-red-700',
                                                    IconComponent: AlertTriangle,
                                                },
                                            };

                                            const config = statusConfig[item.status];
                                            const StatusIcon = config.IconComponent;

                                            return (
                                                <Link
                                                    key={item.id}
                                                    href={`/cooperativa/licenciamento/${item.id}`}
                                                >
                                                    <div
                                                        className={`mt-4 bg-linear-to-r ${config.bg} rounded-xl p-4 flex items-center justify-between ${config.hover} transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-102 border-l-4 ${config.border}`}
                                                    >
                                                        <div className="flex justify-center items-center gap-4">
                                                            <StatusIcon className={`w-7 h-7 ${config.icon} animate-pulse`} />
                                                            <div className="flex justify-between items-center gap-4">
                                                                <span>
                                                                    <p className="font-bold text-base text-gray-900">{item.name}</p>
                                                                    <p className="text-xs text-gray-600 mb-1">{item.document}</p>
                                                                    {item.dataExpiracao && (
                                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            Expira em: {formatDate(item.dataExpiracao)}
                                                                        </p>
                                                                    )}
                                                                </span>
                                                                <span>
                                                                    {item.descricao && (
                                                                        <p className="text-xs text-blue-600 font-medium mb-1">
                                                                            {item.descricao}
                                                                        </p>
                                                                    )}
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        {item.porcentagem && (
                                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                                                                                {item.porcentagem}% concluído
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="w-7 h-7 text-[#1f4585]" />
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Pagination */}
                                {selectedStatus && totalPages > 1 && !isLoadingLicenses && (
                                    <div className="flex flex-col items-center gap-3 mt-6">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={goToPreviousPage}
                                                disabled={currentPage === 0}
                                                className="p-2 bg-[#839fce] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6a8bc2] transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5 text-white" />
                                            </button>
                                            <div className="px-6 py-2 bg-[#839fce] rounded-lg shadow-md">
                                                <span className="font-bold text-base text-white">
                                                    {String(currentPage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                                                </span>
                                            </div>
                                            <button
                                                onClick={goToNextPage}
                                                disabled={currentPage >= totalPages - 1}
                                                className="p-2 bg-[#839fce] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6a8bc2] transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5 text-white" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            Exibindo {licenses.length} de {totalElements} registros (Página {currentPage + 1} de {totalPages})
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Coluna Direita - Prejuízo Estimado */}
                    <div className="space-y-6">

                        {/* Totais Dinâmicos */}
                        <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4">
                            <h2 className="text-2xl font-bold text-blue-900 mb-6">{getEstimatesTitle()}</h2>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                                </div>
                            ) : !selectedStatus ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-sm">Selecione um status para visualizar os totais</p>
                                </div>
                            ) : (
                                <>
                                    {/* Valor médio */}
                                    <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-blue-600 mb-2 font-semibold">{getEstimatesSubtitle()}</p>
                                        <p className="text-4xl font-bold text-blue-900 mb-3">
                                            {formatCurrency(estimates.avgValue)}
                                        </p>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-2xl font-bold text-yellow-500">
                                                {estimates.valuePercentage.toFixed(2)}%
                                            </span>
                                            <span className="text-gray-600 font-medium">do total</span>
                                        </div>
                                        <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
                                            <div
                                                className="bg-linear-to-r from-amber-500 via-yellow-400 to-yellow-300 h-full rounded-full shadow-lg transition-all duration-1000"
                                                style={{ width: `${estimates.valuePercentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Peso médio */}
                                    <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-blue-600 mb-2 font-semibold">Peso pendentes:</p>
                                        <p className="text-4xl font-bold text-blue-900 mb-3">
                                            {formatWeight(estimates.avgWeight)} Kg
                                        </p>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-2xl font-bold text-yellow-500">
                                                {estimates.weightPercentage.toFixed(2)}%
                                            </span>
                                            <span className="text-gray-600 font-medium">do total</span>
                                        </div>
                                        <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
                                            <div
                                                className="bg-linear-to-r from-amber-500 via-yellow-400 to-yellow-300 h-full rounded-full shadow-lg transition-all duration-1000"
                                                style={{ width: `${estimates.weightPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    {/* Total Geral */}
                                    <div className="pt-6 border-t-2 p-4">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-lg text-[#839fce] font-bold">Total Geral:</span>
                                            <span className="text-3xl font-bold  bg-clip-text text-[#1f4585]">
                                                {formatCurrency(valorTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}