'use client';

import { ArrowLeft, FileText, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import Spinner from '../../../../admin/components/Spinner';
import StatusBadge from '../../../../admin/components/StatusBadge';
import ValidityBar from '../../../../admin/components/ValidityBar';
import { errorMessage, getLicense } from '../../../../admin/lib/api';
import { EXPIRING_THRESHOLD_DAYS, type License } from '../../../../admin/lib/types';
import { linkTecnico } from '../../../lib/contato';
import { COR_STATUS, formatarData, plural, prazoPorExtenso } from '../../../lib/formato';

type Carga = { tipo: 'carregando' } | { tipo: 'erro'; mensagem: string } | { tipo: 'pronto'; licenca: License };

const DIA_MS = 86_400_000;

// Data em que começa o prazo de renovação (120 dias antes do vencimento).
function inicioDaRenovacao(licenca: License) {
  return new Date(new Date(licenca.expirationDate).getTime() - EXPIRING_THRESHOLD_DAYS * DIA_MS).toISOString();
}

// Orientação conforme a situação: o produtor lê o que fazer, não só a cor.
function OQueFazer({ licenca }: { licenca: License }) {
  const textos = {
    VIGENTE: {
      titulo: 'Está tudo certo',
      texto: `O prazo para pedir a renovação começa em ${formatarData(inicioDaRenovacao(licenca))}. A cooperativa acompanha e avisa quando chegar a hora.`,
      cor: 'bg-vigente-claro',
    },
    VENCENDO: {
      titulo: 'Hora de renovar',
      texto: `O prazo de renovação começou em ${formatarData(inicioDaRenovacao(licenca))}. Fale com o técnico para dar entrada no pedido antes do vencimento.`,
      cor: 'bg-vencendo-claro',
    },
    VENCIDA: {
      titulo: 'Licença vencida',
      texto: `Esta licença venceu em ${formatarData(licenca.expirationDate)}. Fale com o técnico para regularizar a situação.`,
      cor: 'bg-vencida-claro',
    },
  }[licenca.status];

  return (
    <section className={`rounded-2xl px-5 py-4 ${textos.cor}`}>
      <p className={`font-bold text-lg ${COR_STATUS[licenca.status]}`}>{textos.titulo}</p>
      <p className="mt-1 text-slate-700">{textos.texto}</p>
    </section>
  );
}

function formatarProducao(kg: number) {
  return `${kg.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg por ano`;
}

export default function DetalheLicencaCooperado({
  params,
}: {
  params: Promise<{ produtorId: string; licencaId: string }>;
}) {
  const { produtorId, licencaId } = use(params);
  const [carga, setCarga] = useState<Carga>({ tipo: 'carregando' });

  useEffect(() => {
    getLicense(licencaId)
      .then((licenca) =>
        // Só mostra a licença se ela for do produtor da URL.
        licenca.producerId === produtorId
          ? setCarga({ tipo: 'pronto', licenca })
          : setCarga({ tipo: 'erro', mensagem: 'Licença não encontrada.' }),
      )
      .catch((err) => setCarga({ tipo: 'erro', mensagem: errorMessage(err, 'Não foi possível carregar a licença.') }));
  }, [produtorId, licencaId]);

  const voltar = (
    <Link
      href={`/cooperado/${produtorId}`}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-marinho"
    >
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      Minhas licenças
    </Link>
  );

  if (carga.tipo === 'carregando') {
    return <Spinner size="lg" />;
  }

  if (carga.tipo === 'erro') {
    return (
      <div className="space-y-4">
        {voltar}
        <p className="bg-white rounded-2xl border border-linha p-6 text-center font-semibold text-vencida">{carga.mensagem}</p>
      </div>
    );
  }

  const { licenca } = carga;
  const dias = Math.abs(licenca.daysRemaining);

  // Campos vazios não aparecem: o produtor vê só o que foi lido do documento.
  const dados = [
    { rotulo: 'Órgão emissor', valor: licenca.issuingAgency },
    { rotulo: 'Número da licença', valor: licenca.number },
    { rotulo: 'Protocolo', valor: licenca.protocolNumber },
    { rotulo: 'Emitida em', valor: licenca.issueDate ? formatarData(licenca.issueDate) : null },
    { rotulo: 'Válida até', valor: formatarData(licenca.expirationDate) },
    { rotulo: 'Titular', valor: licenca.holderName },
    { rotulo: 'Município', valor: licenca.municipality },
    { rotulo: 'Atividade', valor: licenca.activity },
    { rotulo: 'Espécies', valor: licenca.cultivatedSpecies },
    { rotulo: 'Produção autorizada', valor: licenca.annualProductionKg ? formatarProducao(licenca.annualProductionKg) : null },
  ].filter((item) => item.valor);

  return (
    <div className="space-y-6">
      {voltar}

      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <StatusBadge status={licenca.status} />
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-tinta leading-tight [font-stretch:112%]">{licenca.type}</h1>
          <p className="text-slate-600 mt-1">Nº {licenca.number}</p>
        </div>
        <div className={`text-right shrink-0 ${COR_STATUS[licenca.status]}`}>
          <p className="numeral text-5xl">{dias}</p>
          <p className="text-sm font-semibold mt-1">
            {licenca.daysRemaining < 0 ? `${plural(dias, 'dia', 'dias')} vencida` : `${plural(dias, 'dia', 'dias')} restantes`}
          </p>
        </div>
      </header>

      <OQueFazer licenca={licenca} />

      <ValidityBar license={licenca} />

      <section className="bg-white rounded-2xl border border-linha">
        <h2 className="px-5 pt-5 pb-3 font-bold text-tinta">Dados da licença</h2>
        <dl className="divide-y divide-linha">
          {dados.map((item) => (
            <div key={item.rotulo} className="px-5 py-3 grid grid-cols-[9rem_1fr] gap-3">
              <dt className="text-sm text-slate-500">{item.rotulo}</dt>
              <dd className="text-sm font-medium text-tinta break-words">{item.valor}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {licenca.fileUrl && (
          <a
            href={licenca.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-marinho text-marinho font-semibold py-3.5 hover:bg-lavanda-clara transition-colors"
          >
            <FileText className="w-5 h-5" aria-hidden="true" />
            Ver o documento (PDF)
          </a>
        )}
        <a
          href={linkTecnico(`Olá! Quero falar sobre a ${licenca.type} nº ${licenca.number} (${prazoPorExtenso(licenca.daysRemaining)}).`)}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center gap-2 rounded-xl bg-marinho text-white font-semibold py-3.5 hover:bg-marinho-escuro transition-colors ${licenca.fileUrl ? '' : 'sm:col-span-2'}`}
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
          Falar com o técnico
        </a>
      </section>
    </div>
  );
}