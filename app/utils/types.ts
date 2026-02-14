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

interface Document {
  id: string;
  title: string;
  completed: boolean;
  url?: string;
  apiId?: number;
  status?: 'OK' | 'ATENCAO' | 'INVALIDO';
}

interface LicenseDetails {
  id: string;
  title: string;
  progress: number;
  documents: DocumentItem[];
}

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

interface DocumentItem {
    id: string;
    title: string;
    completed: boolean;
    url: string;
    apiId: number;
    status: 'OK' | 'ATENCAO' | 'INVALIDO';
}

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

interface Toast {
  message: string;
  type: 'success' | 'error';
}

interface CooperadoLicense {
    id: string;
    name: string;
    document: string;
    status: 'OK' | 'ATENCAO' | 'INVALIDO';
    porcentagem?: string;
    cnpj?: string;
    descricao?: string;
    dataExpiracao?: string;
    pessoa?: {
        nome: string;
        status: string;
        tipoPessoa: string;
        porcentagem: string;
    };
}

type TabType = 'cooperados' | 'em-processo';
type StatusType = 'OK' | 'ATENCAO' | 'INVALIDO' | 'TUDO' | null;

interface StatusDto {
    contagem: number;
    pesoPendentes: number;
    porcentagemPesoPendentes: string;
    porcentagemValorMedioPendentes: string;
    status: 'OK' | 'ATENCAO' | 'INVALIDO' | 'TUDO';
    valorMedioPendentes: number;
}

interface ApiResponse {
    statusDto: StatusDto[];
    valorTotal: number;
}

interface PessoaInfo {
    cnpj: string;
    id: number;
    nome: string;
    porcentagem: string;
    status: string;
    tipoPessoa: string;
    tipoProcesso: string;
}

interface LicenseResponse {
    cnpj: string;
    dataAtualizacao: string;
    dataExpiracao: string;
    descricao: string;
    id: number;
    nome: string;
    pessoa?: PessoaInfo; // Made optional
    porcentagem: string;
    status: 'OK' | 'ATENCAO' | 'INVALIDO' | 'TUDO';
}

interface PaginatedLicenseResponse {
    content: LicenseResponse[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

interface Stats {
    total: number;
    regular: number;
    pending: number;
    expired: number;
}

interface Estimates {
    avgValue: number;
    valuePercentage: number;
    avgWeight: number;
    weightPercentage: number;
    totalGeneral: number;
}