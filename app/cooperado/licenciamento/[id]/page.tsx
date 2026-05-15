'use client';

import Spinner from '@/app/admin/components/Spinner';
import { useLicense } from '@/app/contexts/LicenseContext';
import { mockDadosLicencaCooperado } from '@/app/utils/mock-legacy-data';
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, Download, FileText, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LicenciamentoDetalhes({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { isProcessCompleted } = useLicense();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [license, setLicense] = useState<LicenseDetails | null>(null);
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

                if (!data || data.length === 0) {
                    setError('Nenhuma licença encontrada');
                    return;
                }

                // Transform ALL documents from ALL licenses
                const allDocuments: DocumentItem[] = data.flatMap((licenca, licIndex) =>
                    licenca.documentos.map((doc, docIndex) => ({
                        id: `${licIndex}-${docIndex}`,
                        title: doc.nome || doc.especie || 'Documento',
                        completed: licenca.status === 'OK',
                        url: doc.url,
                        apiId: doc.id,
                        status: licenca.status,
                    }))
                );

                const totalDocs = allDocuments.length;
                const completedDocs = allDocuments.filter(d => d.completed).length;

                // Get first license for title and base info
                const primeiraLicenca = data[0];
                const progress = totalDocs > 0
                    ? Math.round((completedDocs / totalDocs) * 100)
                    : parseFloat(primeiraLicenca.pessoa.porcentagem) || 0;

                setLicense({
                    id: '111',
                    title: primeiraLicenca.descricao || 'LICENÇA',
                    progress,
                    documents: allDocuments,
                });

                setDocuments(allDocuments);
            } catch (err) {
                console.error('Error fetching license data:', err);
                setError('Erro ao carregar dados da licença');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLicenseData();
    }, []);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0 && currentDocumentId) {
            // Aqui você implementará a lógica de upload dos arquivos
            console.log('Upload do documento:', currentDocumentId);
            console.log('Arquivos selecionados:', files);
            alert(`${files.length} arquivo(s) selecionado(s) para upload no documento ${currentDocumentId}`);
            // TODO: Implementar lógica de upload HTTP aqui
            // Exemplo: uploadDocument(currentDocumentId, files)
        }
        // Limpa o input para permitir selecionar o mesmo arquivo novamente
        event.target.value = '';
    };

    const handleUpload = (documentId: string) => {
        setCurrentDocumentId(documentId);
        // Abre o seletor de arquivos
        fileInputRef.current?.click();
    };

    const handleDownload = (documentId: string) => {
        const doc = documents.find(d => d.id === documentId);
        if (doc?.url) {
            // const downloadUrl = `${API_BASE_URL}/download-pdf?mediaUrl=${encodeURIComponent(doc.url)}`;
            window.open(doc.url, '_blank');
        } else {
            alert('URL do documento não disponível');
        }
    };

    const handleContactTechnician = () => {
        const phoneNumber = '5545991351089';
        const whatsappUrl = `https://wa.me/${phoneNumber}`;
        window.open(whatsappUrl, '_blank');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !license) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xl text-red-600 mb-4">{error || 'Licença não encontrada'}</div>
                    <button
                        onClick={() => router.back()}
                        className="text-blue-700 hover:text-blue-900 underline cursor-pointer"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    // Visualização quando o processo está completo
    if (isProcessCompleted) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
                    {/* Header com botão de voltar */}
                    <div className="mb-6 pt-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4 cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Voltar</span>
                        </button>

                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                            DETALHES {license.title}
                        </h1>
                    </div>

                    {/* Progress Info */}
                    <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-slate-100">
                        <p className="text-lg font-semibold text-slate-600">
                            DADOS LICENÇA {license.id} -
                        </p>
                    </div>

                    {/* Documents List with icon buttons */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 mb-6">
                        <div className="space-y-3">
                            {documents.map((doc) => {
                                // Define cores e ícones baseados no status
                                const statusConfig = {
                                    OK: {
                                        bg: 'bg-emerald-50',
                                        border: 'border-emerald-500',
                                        icon: 'text-emerald-700',
                                        IconComponent: CheckCircle,
                                    },
                                    ATENCAO: {
                                        bg: 'bg-amber-50',
                                        border: 'border-amber-500',
                                        icon: 'text-amber-700',
                                        IconComponent: Clock,
                                    },
                                    INVALIDO: {
                                        bg: 'bg-red-50',
                                        border: 'border-red-500',
                                        icon: 'text-red-700',
                                        IconComponent: AlertTriangle,
                                    },
                                };

                                const config = statusConfig[doc.status || 'ATENCAO'];
                                const StatusIcon = config.IconComponent;

                                return (
                                    <div
                                        key={doc.id}
                                        className={`flex items-center justify-between p-4 ${config.bg} rounded-xl border-l-4 ${config.border} shadow-sm hover:shadow-md transition-all duration-300`}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Status Icon */}
                                            <StatusIcon className={`w-7 h-7 ${config.icon}`} />

                                            {/* Document Title */}
                                            <span className="text-base font-semibold text-slate-900">
                                                {doc.title}
                                            </span>
                                        </div>

                                        {/* Action Icon - Download or Upload */}
                                        <div className="flex items-center gap-2">
                                            {doc.completed ? (
                                                <button
                                                    onClick={() => handleDownload(doc.id)}
                                                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                                    title="Baixar arquivo"
                                                >
                                                    <Download className="w-8 h-8 text-slate-600 hover:text-blue-700" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUpload(doc.id)}
                                                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                                    title="Enviar arquivo"
                                                >
                                                    <Upload className="w-8 h-8 text-slate-500 hover:text-blue-700" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Hidden File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="*/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Action Buttons */}
                    <div className="space-y-4 mt-auto">
                        <button
                            onClick={handleContactTechnician}
                            className="w-full bg-blue-700 text-white font-bold text-lg py-4 rounded-2xl shadow-sm hover:bg-blue-800 hover:shadow-md transition-all duration-300 cursor-pointer"
                        >
                            FALAR COM TÉCNICO
                        </button>

                    </div>
                </div>
            </div>
        );
    }

    // Visualização quando o processo está em andamento (original)
    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header com botão de voltar */}
                <div className="mb-6 pt-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4 cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Voltar</span>
                    </button>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                        {license.title}
                    </h1>
                </div>

                {/* Progress Info */}
                <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-slate-100">
                    <p className="text-lg font-semibold text-slate-600">
                        DADOS LICENÇA {license.id} - {license.progress}%
                    </p>
                </div>

                {/* Documents List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 mb-6">
                    <div className="space-y-3">
                        {documents.map((doc) => {
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
                                },
                            };

                            const config = statusConfig[doc.status || 'ATENCAO'];
                            const StatusIcon = config.IconComponent;

                            return (
                                <div
                                    key={doc.id}
                                    className={`flex items-center justify-between p-4 bg-linear-to-r ${config.bg} rounded-xl border-l-4 ${config.border} shadow-md hover:shadow-lg transition-all duration-300`}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        {/* Status Icon */}
                                        <StatusIcon className={`w-7 h-7 ${config.icon}`} />

                                        {/* Document Title */}
                                        <span className="text-base font-semibold text-slate-900">
                                            {doc.title}
                                        </span>
                                    </div>

                                    {/* Action Icon - Upload or File */}
                                    {doc.completed ? (
                                        <button
                                            onClick={() => handleDownload(doc.id)}
                                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                            title="Baixar arquivo"
                                        >
                                            <FileText className="w-8 h-8 text-blue-700" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpload(doc.id)}
                                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                            title="Enviar arquivo"
                                        >
                                            <Upload className="w-8 h-8 text-slate-400 hover:text-blue-700" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="*/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Footer Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Clique no ícone <Upload className="inline w-4 h-4" /> para enviar ou <FileText className="inline w-4 h-4" /> para baixar documentos
                    </p>
                </div>
            </div>
        </div>
    );
}
