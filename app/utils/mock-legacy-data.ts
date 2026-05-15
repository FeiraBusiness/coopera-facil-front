// Dados mockados para as telas legadas (Cooperado/Cooperativa) enquanto o back-end
// descrito no README-API-CONTRACTS.md não está disponível. Os tipos usados aqui
// (DadosLicenca, Pessoa, LicenseResponse, PaginatedLicenseResponse, ApiResponse,
// StatusDto) são os mesmos tipos globais já declarados em app/utils/types.ts.

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

// ----- Área do Cooperado -----

export const mockPessoaCooperado: Pessoa = {
  cnpj: '123.456.789-00',
  id: 1,
  nome: 'João Carlos Moreira',
  porcentagem: '72',
  status: 'ATENCAO',
  tipoPessoa: 'PESSOA_FISICA',
  tipoProcesso: 'LICENCIAMENTO_AMBIENTAL',
};

export const mockDadosLicencaCooperado: DadosLicenca[] = [
  {
    descricao: 'Licença Ambiental',
    id: 1001,
    nomeArquivo: 'licenca_operacao.pdf',
    fase: 'ANALISE_DOCUMENTAL',
    status: 'ATENCAO',
    pessoa: mockPessoaCooperado,
    documentos: [
      {
        especie: 'Licença de Operação',
        id: 1,
        nome: 'Licença de Operação - IAT',
        producaoAno: '1200',
        url: '/mock-files/licenca_operacao.pdf',
        validadeLicenca: daysFromNow(18),
      },
      {
        especie: 'Outorga de Água',
        id: 2,
        nome: 'Outorga de Uso da Água',
        producaoAno: '1200',
        url: '/mock-files/outorga_agua.pdf',
        validadeLicenca: daysFromNow(45),
      },
      {
        especie: 'Autorização Florestal',
        id: 3,
        nome: 'Autorização Florestal - IBAMA',
        producaoAno: '1200',
        url: '/mock-files/autorizacao_florestal.pdf',
        validadeLicenca: daysFromNow(90),
      },
    ],
  },
];

// ----- Área da Cooperativa: tabela de licenças/processos -----

interface LicenseSeed {
  id: number;
  nome: string;
  cnpj: string;
  descricao: string;
  porcentagem: string;
  status: 'OK' | 'ATENCAO' | 'INVALIDO';
  expirationOffsetDays: number;
}

const cooperadoLicenseSeeds: LicenseSeed[] = [
  { id: 1, nome: 'João Carlos Moreira', cnpj: '123.456.789-00', descricao: 'Licença de Operação', porcentagem: '100', status: 'OK', expirationOffsetDays: 320 },
  { id: 2, nome: 'Maria Aparecida Souza', cnpj: '987.654.321-00', descricao: 'Outorga de Uso da Água', porcentagem: '100', status: 'OK', expirationOffsetDays: 410 },
  { id: 3, nome: 'Carlos Eduardo Lima', cnpj: '456.789.123-00', descricao: 'Licença Ambiental Simplificada', porcentagem: '85', status: 'ATENCAO', expirationOffsetDays: 18 },
  { id: 4, nome: 'Ana Paula Ferreira', cnpj: '321.654.987-00', descricao: 'Autorização Florestal', porcentagem: '70', status: 'ATENCAO', expirationOffsetDays: 25 },
  { id: 5, nome: 'Roberto Alves Pereira', cnpj: '789.123.456-00', descricao: 'Licença de Instalação', porcentagem: '60', status: 'ATENCAO', expirationOffsetDays: 9 },
  { id: 6, nome: 'Fernanda Costa Martins', cnpj: '147.258.369-00', descricao: 'Licença de Operação', porcentagem: '0', status: 'INVALIDO', expirationOffsetDays: -12 },
  { id: 7, nome: 'Sebastião Rodrigues Neto', cnpj: '654.321.987-00', descricao: 'Outorga de Uso da Água', porcentagem: '0', status: 'INVALIDO', expirationOffsetDays: -40 },
  { id: 8, nome: 'Paulo Henrique Souza', cnpj: '258.369.147-00', descricao: 'Licença Ambiental Simplificada', porcentagem: '100', status: 'OK', expirationOffsetDays: 500 },
  { id: 9, nome: 'Juliana Martins Rocha', cnpj: '369.147.258-00', descricao: 'Autorização Florestal', porcentagem: '90', status: 'ATENCAO', expirationOffsetDays: 22 },
  { id: 10, nome: 'Agro Boa Terra Ltda', cnpj: '45.678.901/0001-33', descricao: 'Licença de Operação', porcentagem: '0', status: 'INVALIDO', expirationOffsetDays: -60 },
];

const emProcessoLicenseSeeds: LicenseSeed[] = [
  { id: 101, nome: 'Agropecuária Três Irmãos Ltda', cnpj: '12.345.678/0001-90', descricao: 'Licença de Operação', porcentagem: '45', status: 'ATENCAO', expirationOffsetDays: 180 },
  { id: 102, nome: 'Fazenda Rio Verde S/A', cnpj: '23.456.789/0001-11', descricao: 'Licença de Instalação', porcentagem: '30', status: 'ATENCAO', expirationOffsetDays: 210 },
  { id: 103, nome: 'Cooperativa Agrícola Vale Verde', cnpj: '34.567.890/0001-22', descricao: 'Outorga de Uso da Água', porcentagem: '100', status: 'OK', expirationOffsetDays: 365 },
  { id: 104, nome: 'Vale do Sol Agropecuária S/A', cnpj: '56.789.012/0001-44', descricao: 'Licença Ambiental Simplificada', porcentagem: '0', status: 'INVALIDO', expirationOffsetDays: -5 },
  { id: 105, nome: 'Fazenda Boa Terra Ltda', cnpj: '45.678.901/0001-33', descricao: 'Autorização Florestal', porcentagem: '65', status: 'ATENCAO', expirationOffsetDays: 150 },
  { id: 106, nome: 'Agro Industrial Norte S/A', cnpj: '67.890.123/0001-55', descricao: 'Licença de Operação', porcentagem: '100', status: 'OK', expirationOffsetDays: 300 },
];

function seedToLicenseResponse(seed: LicenseSeed): LicenseResponse {
  return {
    cnpj: seed.cnpj,
    dataAtualizacao: daysFromNow(-5),
    dataExpiracao: daysFromNow(seed.expirationOffsetDays),
    descricao: seed.descricao,
    id: seed.id,
    nome: seed.nome,
    porcentagem: seed.porcentagem,
    status: seed.status,
    pessoa: {
      cnpj: seed.cnpj,
      id: seed.id,
      nome: seed.nome,
      porcentagem: seed.porcentagem,
      status: seed.status,
      tipoPessoa: 'PESSOA_FISICA',
      tipoProcesso: 'LICENCIAMENTO_AMBIENTAL',
    },
  };
}

export function mockFetchLicenses(
  tipoProcesso: 'COOPERADO' | 'EM_PROCESSO',
  status: StatusType,
  page: number,
  size: number,
): PaginatedLicenseResponse {
  const seeds = tipoProcesso === 'COOPERADO' ? cooperadoLicenseSeeds : emProcessoLicenseSeeds;
  const filtered = status && status !== 'TUDO' ? seeds.filter((s) => s.status === status) : seeds;
  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const content = filtered.slice(page * size, page * size + size).map(seedToLicenseResponse);

  return {
    content,
    empty: content.length === 0,
    first: page === 0,
    last: page >= totalPages - 1,
    number: page,
    numberOfElements: content.length,
    size,
    totalElements,
    totalPages,
  };
}

export function mockFetchStats(tipoProcesso: 'COOPERADO' | 'EM_PROCESSO'): ApiResponse {
  const seeds = tipoProcesso === 'COOPERADO' ? cooperadoLicenseSeeds : emProcessoLicenseSeeds;
  const byStatus = (status: 'OK' | 'ATENCAO' | 'INVALIDO') => seeds.filter((s) => s.status === status).length;

  const valoresBase: Record<'OK' | 'ATENCAO' | 'INVALIDO', { valor: number; peso: number }> = {
    OK: { valor: 0, peso: 0 },
    ATENCAO: { valor: 8500, peso: 32000 },
    INVALIDO: { valor: 15200, peso: 54000 },
  };

  const statusDto: StatusDto[] = (['OK', 'ATENCAO', 'INVALIDO'] as const).map((status) => {
    const { valor, peso } = valoresBase[status];
    return {
      status,
      contagem: byStatus(status),
      pesoPendentes: peso,
      porcentagemPesoPendentes: `${Math.round((peso / 180000) * 100)}%`,
      porcentagemValorMedioPendentes: `${Math.round((valor / 95000) * 100)}%`,
      valorMedioPendentes: valor,
    };
  });

  return { statusDto, valorTotal: 420000 };
}

// ----- Área da Cooperativa: detalhes da licença (dados extraídos + documentos) -----

export function mockFetchDadosLicencaById(id: string): DadosLicenca[] {
  const seed = [...cooperadoLicenseSeeds, ...emProcessoLicenseSeeds].find((s) => s.id.toString() === id);
  const status = seed?.status ?? 'ATENCAO';
  const nome = seed?.nome ?? 'Produtor Rural';
  const cnpj = seed?.cnpj ?? '000.000.000-00';

  const pessoa: Pessoa = {
    cnpj,
    id: seed?.id ?? 1,
    nome,
    porcentagem: seed?.porcentagem ?? '70',
    status,
    tipoPessoa: cnpj.includes('/') ? 'PESSOA_JURIDICA' : 'PESSOA_FISICA',
    tipoProcesso: 'LICENCIAMENTO_AMBIENTAL',
  };

  return [
    {
      descricao: seed?.descricao ?? 'Licença Ambiental',
      id: Number(id) || 1,
      nomeArquivo: 'documento_original.pdf',
      fase: 'ANALISE_DOCUMENTAL',
      status,
      pessoa,
      documentos: [
        {
          especie: seed?.descricao ?? 'Licença Ambiental',
          id: 1,
          nome: `${seed?.descricao ?? 'Licença Ambiental'} - documento original`,
          producaoAno: '1200',
          url: '/mock-files/documento_original.pdf',
          validadeLicenca: seed ? daysFromNow(seed.expirationOffsetDays) : daysFromNow(30),
        },
        {
          especie: 'Comprovante complementar',
          id: 2,
          nome: 'Comprovante de regularidade',
          producaoAno: '1200',
          url: '/mock-files/comprovante.pdf',
          validadeLicenca: daysFromNow(120),
        },
      ],
    },
  ];
}
