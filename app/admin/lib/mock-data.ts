import type {
  DashboardSummary,
  DocumentStatus,
  License,
  LicenseStatus,
  RuralProducer,
  WhatsAppDocument,
} from './types';

// Datas relativas a "hoje" para a demo sempre parecer atual
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function computeLicenseStatus(expirationDate: string): LicenseStatus {
  const diffMs = new Date(expirationDate).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'VENCIDA';
  if (diffDays <= 30) return 'VENCENDO';
  return 'VIGENTE';
}

export function daysRemaining(expirationDate: string): number {
  const diffMs = new Date(expirationDate).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

interface ProducerSeed {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string | null;
  city: string;
  state: string;
  farmName: string | null;
  active: boolean;
}

export const producersSeed: ProducerSeed[] = [
  { id: 'p-001', name: 'João Carlos Moreira', document: '123.456.789-00', phone: '5545999010001', email: 'joao.moreira@email.com', city: 'Cascavel', state: 'PR', farmName: 'Fazenda Santa Luzia', active: true },
  { id: 'p-002', name: 'Maria Aparecida Souza', document: '987.654.321-00', phone: '5545999010002', email: 'maria.souza@email.com', city: 'Toledo', state: 'PR', farmName: 'Sítio Boa Vista', active: true },
  { id: 'p-003', name: 'Agropecuária Três Irmãos Ltda', document: '12.345.678/0001-90', phone: '5545999010003', email: 'contato@tresirmaos.com.br', city: 'Marechal Cândido Rondon', state: 'PR', farmName: 'Fazenda Três Irmãos', active: true },
  { id: 'p-004', name: 'Carlos Eduardo Lima', document: '456.789.123-00', phone: '5545999010004', email: null, city: 'Francisco Beltrão', state: 'PR', farmName: 'Chácara Primavera', active: true },
  { id: 'p-005', name: 'Fazenda Rio Verde S/A', document: '23.456.789/0001-11', phone: '5545999010005', email: 'financeiro@riovende.com.br', city: 'Guarapuava', state: 'PR', farmName: 'Fazenda Rio Verde', active: true },
  { id: 'p-006', name: 'Ana Paula Ferreira', document: '321.654.987-00', phone: '5545999010006', email: 'ana.ferreira@email.com', city: 'Medianeira', state: 'PR', farmName: null, active: true },
  { id: 'p-007', name: 'Sebastião Rodrigues Neto', document: '654.321.987-00', phone: '5545999010007', email: null, city: 'Chapecó', state: 'SC', farmName: 'Sítio Esperança', active: true },
  { id: 'p-008', name: 'Cooperativa Agrícola Vale Verde', document: '34.567.890/0001-22', phone: '5545999010008', email: 'adm@valeverde.coop.br', city: 'Pato Branco', state: 'PR', farmName: 'Núcleo Vale Verde', active: true },
  { id: 'p-009', name: 'Roberto Alves Pereira', document: '789.123.456-00', phone: '5545999010009', email: 'roberto.pereira@email.com', city: 'Cascavel', state: 'PR', farmName: 'Fazenda São José', active: true },
  { id: 'p-010', name: 'Fernanda Costa Martins', document: '147.258.369-00', phone: '5545999010010', email: null, city: 'Erechim', state: 'RS', farmName: 'Granja Costa', active: true },
  { id: 'p-011', name: 'Agro Boa Terra Ltda', document: '45.678.901/0001-33', phone: '5545999010011', email: 'contato@boaterra.com.br', city: 'Cascavel', state: 'PR', farmName: 'Fazenda Boa Terra', active: true },
  { id: 'p-012', name: 'Paulo Henrique Souza', document: '258.369.147-00', phone: '5545999010012', email: 'paulo.souza@email.com', city: 'Londrina', state: 'PR', farmName: null, active: false },
  { id: 'p-013', name: 'Juliana Martins Rocha', document: '369.147.258-00', phone: '5545999010013', email: 'juliana.rocha@email.com', city: 'Palotina', state: 'PR', farmName: 'Chácara Rocha', active: true },
  { id: 'p-014', name: 'Vale do Sol Agropecuária S/A', document: '56.789.012/0001-44', phone: '5545999010014', email: 'financeiro@valedosol.com.br', city: 'Xanxerê', state: 'SC', farmName: 'Fazenda Vale do Sol', active: true },
];

interface LicenseSeed {
  id: string;
  producerId: string;
  type: string;
  number: string;
  issuingAgency: string;
  issueOffsetDays: number;
  expirationOffsetDays: number;
  fileName: string;
}

const licenseTypes = ['Licença de Operação', 'Outorga de Uso da Água', 'Licença Ambiental Simplificada', 'Autorização Florestal', 'Licença de Instalação'];

export const licensesSeed: LicenseSeed[] = [
  { id: 'l-001', producerId: 'p-001', type: licenseTypes[0], number: 'LO-2023-00891', issuingAgency: 'IAT', issueOffsetDays: -400, expirationOffsetDays: -12, fileName: 'licenca_operacao_joao.pdf' },
  { id: 'l-002', producerId: 'p-001', type: licenseTypes[1], number: 'OU-2024-01123', issuingAgency: 'SEMA', issueOffsetDays: -200, expirationOffsetDays: 18, fileName: 'outorga_agua_joao.pdf' },
  { id: 'l-003', producerId: 'p-002', type: licenseTypes[2], number: 'LAS-2024-00456', issuingAgency: 'IAT', issueOffsetDays: -300, expirationOffsetDays: 120, fileName: 'licenca_simplificada_maria.pdf' },
  { id: 'l-004', producerId: 'p-003', type: licenseTypes[0], number: 'LO-2022-00712', issuingAgency: 'IAP', issueOffsetDays: -720, expirationOffsetDays: -60, fileName: 'licenca_operacao_tres_irmaos.pdf' },
  { id: 'l-005', producerId: 'p-003', type: licenseTypes[4], number: 'LI-2024-00998', issuingAgency: 'IAT', issueOffsetDays: -90, expirationOffsetDays: 300, fileName: 'licenca_instalacao_tres_irmaos.pdf' },
  { id: 'l-006', producerId: 'p-004', type: licenseTypes[3], number: 'AF-2023-00345', issuingAgency: 'IBAMA', issueOffsetDays: -500, expirationOffsetDays: 9, fileName: 'autorizacao_florestal_carlos.pdf' },
  { id: 'l-007', producerId: 'p-005', type: licenseTypes[1], number: 'OU-2023-00678', issuingAgency: 'SEMA', issueOffsetDays: -600, expirationOffsetDays: -5, fileName: 'outorga_agua_rioverde.pdf' },
  { id: 'l-008', producerId: 'p-005', type: licenseTypes[0], number: 'LO-2024-01567', issuingAgency: 'IAT', issueOffsetDays: -60, expirationOffsetDays: 540, fileName: 'licenca_operacao_rioverde.pdf' },
  { id: 'l-009', producerId: 'p-006', type: licenseTypes[2], number: 'LAS-2023-00234', issuingAgency: 'Prefeitura Municipal', issueOffsetDays: -400, expirationOffsetDays: 25, fileName: 'licenca_simplificada_ana.pdf' },
  { id: 'l-010', producerId: 'p-007', type: licenseTypes[0], number: 'LO-2024-00112', issuingAgency: 'IAT', issueOffsetDays: -150, expirationOffsetDays: 200, fileName: 'licenca_operacao_sebastiao.pdf' },
  { id: 'l-011', producerId: 'p-008', type: licenseTypes[1], number: 'OU-2024-00789', issuingAgency: 'SEMA', issueOffsetDays: -100, expirationOffsetDays: 7, fileName: 'outorga_agua_valeverde.pdf' },
  { id: 'l-012', producerId: 'p-009', type: licenseTypes[4], number: 'LI-2023-00456', issuingAgency: 'IAP', issueOffsetDays: -450, expirationOffsetDays: -30, fileName: 'licenca_instalacao_roberto.pdf' },
  { id: 'l-013', producerId: 'p-010', type: licenseTypes[0], number: 'LO-2024-00901', issuingAgency: 'IAT', issueOffsetDays: -30, expirationOffsetDays: 365, fileName: 'licenca_operacao_fernanda.pdf' },
  { id: 'l-014', producerId: 'p-011', type: licenseTypes[3], number: 'AF-2024-00223', issuingAgency: 'IBAMA', issueOffsetDays: -200, expirationOffsetDays: 3, fileName: 'autorizacao_florestal_boaterra.pdf' },
  { id: 'l-015', producerId: 'p-013', type: licenseTypes[2], number: 'LAS-2024-00667', issuingAgency: 'Prefeitura Municipal', issueOffsetDays: -80, expirationOffsetDays: 410, fileName: 'licenca_simplificada_juliana.pdf' },
  { id: 'l-016', producerId: 'p-014', type: licenseTypes[0], number: 'LO-2023-00998', issuingAgency: 'IAT', issueOffsetDays: -500, expirationOffsetDays: -90, fileName: 'licenca_operacao_valedosol.pdf' },
];

export function buildLicense(seed: LicenseSeed, producerName: string): License {
  const issueDate = daysFromNow(seed.issueOffsetDays);
  const expirationDate = daysFromNow(seed.expirationOffsetDays);
  return {
    id: seed.id,
    producerId: seed.producerId,
    producerName,
    type: seed.type,
    number: seed.number,
    issuingAgency: seed.issuingAgency,
    issueDate,
    expirationDate,
    status: computeLicenseStatus(expirationDate),
    sourceDocumentId: `doc-${seed.id}`,
    fileUrl: `/mock-files/${seed.fileName}`,
    fileName: seed.fileName,
    extractedFields: [
      { key: 'titular', label: 'Titular', value: producerName, confidence: 0.98, reviewed: true },
      { key: 'numero', label: 'Número do documento', value: seed.number, confidence: 0.95, reviewed: true },
      { key: 'orgao', label: 'Órgão emissor', value: seed.issuingAgency, confidence: 0.9, reviewed: false },
      { key: 'validade', label: 'Validade', value: new Date(expirationDate).toLocaleDateString('pt-BR'), confidence: 0.82, reviewed: false },
      { key: 'atividade', label: 'Atividade licenciada', value: seed.type, confidence: 0.88, reviewed: false },
    ],
    createdAt: issueDate,
    updatedAt: issueDate,
  };
}

interface DocumentSeed {
  id: string;
  producerId: string | null;
  phoneNumber: string;
  fileName: string;
  status: DocumentStatus;
  receivedOffsetDays: number;
  processedOffsetDays: number | null;
  errorMessage: string | null;
  generatedLicenseId: string | null;
  reprocessCount: number;
}

export const documentsSeed: DocumentSeed[] = [
  { id: 'doc-l-002', producerId: 'p-001', phoneNumber: '5545999010001', fileName: 'outorga_agua_joao.pdf', status: 'CONCLUIDO', receivedOffsetDays: -2, processedOffsetDays: -2, errorMessage: null, generatedLicenseId: 'l-002', reprocessCount: 0 },
  { id: 'doc-l-008', producerId: 'p-005', phoneNumber: '5545999010005', fileName: 'licenca_operacao_rioverde.pdf', status: 'CONCLUIDO', receivedOffsetDays: -1, processedOffsetDays: -1, errorMessage: null, generatedLicenseId: 'l-008', reprocessCount: 0 },
  { id: 'doc-901', producerId: null, phoneNumber: '5545999020099', fileName: 'foto_documento_ilegivel.jpg', status: 'ERRO', receivedOffsetDays: -1, processedOffsetDays: -1, errorMessage: 'Não foi possível identificar o texto do documento (imagem de baixa qualidade).', generatedLicenseId: null, reprocessCount: 1 },
  { id: 'doc-902', producerId: 'p-009', phoneNumber: '5545999010009', fileName: 'licenca_instalacao_roberto.pdf', status: 'ERRO', receivedOffsetDays: -3, processedOffsetDays: -3, errorMessage: 'Campo de validade não encontrado no documento.', generatedLicenseId: null, reprocessCount: 2 },
  { id: 'doc-903', producerId: 'p-013', phoneNumber: '5545999010013', fileName: 'licenca_simplificada_juliana.pdf', status: 'PROCESSANDO', receivedOffsetDays: 0, processedOffsetDays: null, errorMessage: null, generatedLicenseId: null, reprocessCount: 0 },
  { id: 'doc-904', producerId: null, phoneNumber: '5545999020055', fileName: 'documento_novo_produtor.pdf', status: 'PENDENTE', receivedOffsetDays: 0, processedOffsetDays: null, errorMessage: null, generatedLicenseId: null, reprocessCount: 0 },
  { id: 'doc-905', producerId: 'p-007', phoneNumber: '5545999010007', fileName: 'licenca_operacao_sebastiao.pdf', status: 'PENDENTE', receivedOffsetDays: 0, processedOffsetDays: null, errorMessage: null, generatedLicenseId: null, reprocessCount: 0 },
  { id: 'doc-906', producerId: 'p-011', phoneNumber: '5545999010011', fileName: 'autorizacao_florestal_boaterra.pdf', status: 'CONCLUIDO', receivedOffsetDays: -4, processedOffsetDays: -4, errorMessage: null, generatedLicenseId: 'l-014', reprocessCount: 0 },
];

export function seedProducers(): RuralProducer[] {
  return producersSeed.map((seed) => {
    const producerLicenses = licensesSeed
      .filter((l) => l.producerId === seed.id)
      .map((l) => computeLicenseStatus(daysFromNow(l.expirationOffsetDays)));

    return {
      id: seed.id,
      name: seed.name,
      document: seed.document,
      phone: seed.phone,
      email: seed.email,
      city: seed.city,
      state: seed.state,
      farmName: seed.farmName,
      active: seed.active,
      licensesSummary: {
        vigente: producerLicenses.filter((s) => s === 'VIGENTE').length,
        vencendo: producerLicenses.filter((s) => s === 'VENCENDO').length,
        vencida: producerLicenses.filter((s) => s === 'VENCIDA').length,
      },
      createdAt: daysFromNow(-900),
      updatedAt: daysFromNow(-5),
    };
  });
}

export function seedLicenses(): License[] {
  const producersById = new Map(producersSeed.map((p) => [p.id, p.name]));
  return licensesSeed.map((seed) => buildLicense(seed, producersById.get(seed.producerId) ?? 'Desconhecido'));
}

export function seedDocuments(): WhatsAppDocument[] {
  const producersById = new Map(producersSeed.map((p) => [p.id, p.name]));
  return documentsSeed.map((seed) => ({
    id: seed.id,
    producerId: seed.producerId,
    producerName: seed.producerId ? producersById.get(seed.producerId) ?? null : null,
    phoneNumber: seed.phoneNumber,
    fileName: seed.fileName,
    fileUrl: `/mock-files/${seed.fileName}`,
    status: seed.status,
    receivedAt: daysFromNow(seed.receivedOffsetDays),
    processedAt: seed.processedOffsetDays !== null ? daysFromNow(seed.processedOffsetDays) : null,
    errorMessage: seed.errorMessage,
    generatedLicenseId: seed.generatedLicenseId,
    reprocessCount: seed.reprocessCount,
  }));
}

export function buildDashboardSummary(
  producers: RuralProducer[],
  licenses: License[],
  documents: WhatsAppDocument[],
): DashboardSummary {
  const activeLicenses = licenses.map((l) => ({ ...l, status: computeLicenseStatus(l.expirationDate) }));

  const upcoming: UpcomingExpirationInternal[] = activeLicenses
    .filter((l) => l.status !== 'VENCIDA')
    .map((l) => ({
      licenseId: l.id,
      producerName: l.producerName,
      licenseType: l.type,
      expirationDate: l.expirationDate,
      daysRemaining: daysRemaining(l.expirationDate),
    }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 8);

  return {
    totalProducers: producers.filter((p) => p.active).length,
    totalLicenses: licenses.length,
    licensesByStatus: {
      vigente: activeLicenses.filter((l) => l.status === 'VIGENTE').length,
      vencendo: activeLicenses.filter((l) => l.status === 'VENCENDO').length,
      vencida: activeLicenses.filter((l) => l.status === 'VENCIDA').length,
    },
    documentsByStatus: {
      pendente: documents.filter((d) => d.status === 'PENDENTE').length,
      processando: documents.filter((d) => d.status === 'PROCESSANDO').length,
      concluido: documents.filter((d) => d.status === 'CONCLUIDO').length,
      erro: documents.filter((d) => d.status === 'ERRO').length,
    },
    upcomingExpirations: upcoming,
  };
}

type UpcomingExpirationInternal = DashboardSummary['upcomingExpirations'][number];
