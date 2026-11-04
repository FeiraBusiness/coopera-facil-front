'use client';

import { AlertTriangle, CheckCircle2, ChevronRight, Clock, FileUp, Inbox, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { use, useCallback, useEffect, useState } from 'react';
import Spinner from '../../admin/components/Spinner';
import StatusBadge from '../../admin/components/StatusBadge';
import { errorMessage, getLicenses, getProducer } from '../../admin/lib/api';
import { EXPIRING_THRESHOLD_DAYS, type License, type RuralProducer } from '../../admin/lib/types';
import { useAutoRefresh } from '../../admin/lib/useAutoRefresh';
import { linkEnvio, linkTecnico } from '../lib/contato';
import { COR_STATUS, contarPorStatus, formatarData, plural, prazoPorExtenso } from '../lib/formato';

// A licença enviada pelo WhatsApp aparece aqui sozinha: a lista é recarregada a cada 15 s.
const REFRESH_INTERVAL_MS = 15000;

type Carga =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; produtor: RuralProducer; licencas: License[] };

// Resumo no topo: a única coisa que o produtor precisa saber ao abrir a tela.
function Situacao({ licencas }: { licencas: License[] }) {
  const total = contarPorStatus(licencas);
  // A lista vem da API ordenada pelo vencimento mais próximo.
  const proxima = licencas.find((l) => l.daysRemaining >= 0);

  if (licencas.length === 0) {
    return (
      <Aviso cor="bg-white border border-linha" corTitulo="text-tinta" icone={Inbox} titulo="Nenhuma licença recebida ainda">
        Envie o PDF da sua licença pelo WhatsApp da cooperativa e ela aparece aqui.
      </Aviso>
    );
  }

  if (total.vencida > 0) {
    return (
      <Aviso cor="bg-vencida-claro" corTitulo="text-vencida" icone={AlertTriangle} titulo={`${total.vencida} ${plural(total.vencida, 'licença vencida', 'licenças vencidas')}`}>
        Sem licença válida a produção pode ser autuada. Fale com o técnico para regularizar.
      </Aviso>
    );
  }

  if (total.vencendo > 0 && proxima) {
    return (
      <Aviso cor="bg-vencendo-claro" corTitulo="text-vencendo" icone={Clock} titulo={`${total.vencendo} ${plural(total.vencendo, 'licença precisa', 'licenças precisam')} de renovação`}>
        A primeira vence em {formatarData(proxima.expirationDate)} ({prazoPorExtenso(proxima.daysRemaining)}). Procure o técnico para iniciar o pedido.
      </Aviso>
    );
  }

  return (
    <Aviso cor="bg-vigente-claro" corTitulo="text-vigente" icone={CheckCircle2} titulo="Todas as licenças em dia">
      {proxima
        ? `A próxima vence em ${formatarData(proxima.expirationDate)}. Avisamos ${EXPIRING_THRESHOLD_DAYS} dias antes, no prazo da renovação.`
        : 'Nenhum vencimento pela frente.'}
    </Aviso>
  );
}

function Aviso(props: {
  cor: string;
  corTitulo: string;
  icone: React.ComponentType<{ className?: string }>;
  titulo: string;
  children: React.ReactNode;
}) {
  const Icone = props.icone;
  return (
    <section className={`rounded-2xl px-5 py-4 flex gap-3.5 ${props.cor}`} role="status">
      <Icone className={`w-6 h-6 shrink-0 mt-0.5 ${props.corTitulo}`} />
      <div>
        <p className={`font-bold text-lg leading-snug ${props.corTitulo}`}>{props.titulo}</p>
        <p className="mt-1 text-slate-700">{props.children}</p>
      </div>
    </section>
  );
}

function CartaoLicenca({ licenca, produtorId }: { licenca: License; produtorId: string }) {
  const vencida = licenca.daysRemaining < 0;
  const dias = Math.abs(licenca.daysRemaining);

  return (
    <li>
      <Link
        href={`/cooperado/${produtorId}/licencas/${licenca.id}`}
        className="group flex items-center gap-4 bg-white rounded-2xl border border-linha px-4 py-4 hover:border-lavanda transition-colors"
      >
        {/* Dias restantes em destaque: é o número que o produtor procura. */}
        <div className={`w-20 shrink-0 text-center ${COR_STATUS[licenca.status]}`}>
          {/* Quatro dígitos (licenças de vários anos) usam um corpo menor para caber na coluna. */}
          <p className={`numeral ${dias >= 1000 ? 'text-2xl' : 'text-3xl'}`}>{dias}</p>
          <p className="text-xs font-semibold mt-1">{vencida ? 'dias vencida' : plural(dias, 'dia', 'dias')}</p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-tinta">{licenca.type}</p>
            <StatusBadge status={licenca.status} />
          </div>
          <p className="text-sm text-slate-600 mt-1">Vence em {formatarData(licenca.expirationDate)}</p>
          <p className="text-sm text-slate-500 truncate">
            Nº {licenca.number} · {licenca.issuingAgency}
          </p>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-marinho" aria-hidden="true" />
      </Link>
    </li>
  );
}

export default function LicencasDoProdutor({ params }: { params: Promise<{ produtorId: string }> }) {
  const { produtorId } = use(params);
  const [carga, setCarga] = useState<Carga>({ tipo: 'carregando' });

  const carregar = useCallback(() => {
    Promise.all([getProducer(produtorId), getLicenses({ producerId: produtorId, size: 100 })])
      .then(([produtor, pagina]) => setCarga({ tipo: 'pronto', produtor, licencas: pagina.content }))
      .catch((err) => setCarga({ tipo: 'erro', mensagem: errorMessage(err, 'Não foi possível carregar suas licenças.') }));
  }, [produtorId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useAutoRefresh(carregar, REFRESH_INTERVAL_MS);

  if (carga.tipo === 'carregando') {
    return <Spinner size="lg" />;
  }

  if (carga.tipo === 'erro') {
    return (
      <div className="bg-white rounded-2xl border border-linha p-6 text-center">
        <p className="font-semibold text-vencida">{carga.mensagem}</p>
        <Link href="/cooperado" className="mt-4 inline-block font-semibold text-marinho hover:underline">
          Voltar para a entrada
        </Link>
      </div>
    );
  }

  const { produtor, licencas } = carga;
  const total = contarPorStatus(licencas);
  const primeiroNome = produtor.name.split(' ')[0];
  const local = [produtor.farmName, `${produtor.city}/${produtor.state}`].filter(Boolean).join(' · ');
  const envio = linkEnvio();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-tinta [font-stretch:112%]">Olá, {primeiroNome}</h1>
        <p className="text-slate-600 mt-1">{local}</p>
      </header>

      <Situacao licencas={licencas} />

      {licencas.length > 0 && (
        <dl className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden border border-linha bg-linha">
          {[
            { rotulo: plural(total.vigente, 'vigente', 'vigentes'), valor: total.vigente, cor: 'text-vigente' },
            { rotulo: 'renovar', valor: total.vencendo, cor: 'text-vencendo' },
            { rotulo: plural(total.vencida, 'vencida', 'vencidas'), valor: total.vencida, cor: 'text-vencida' },
          ].map((item) => (
            <div key={item.rotulo} className="bg-white px-4 py-4 flex flex-col-reverse">
              <dt className="text-sm text-slate-600 mt-1.5">{item.rotulo}</dt>
              <dd className={`numeral text-3xl ${item.valor > 0 ? item.cor : 'text-slate-300'}`}>{item.valor}</dd>
            </div>
          ))}
        </dl>
      )}

      {licencas.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-tinta mb-3">Minhas licenças</h2>
          <ul className="space-y-3">
            {licencas.map((licenca) => (
              <CartaoLicenca key={licenca.id} licenca={licenca} produtorId={produtor.id} />
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 pt-2">
        {envio && (
          <a
            href={envio}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-marinho text-white font-semibold py-3.5 hover:bg-marinho-escuro transition-colors"
          >
            <FileUp className="w-5 h-5" aria-hidden="true" />
            Enviar licença pelo WhatsApp
          </a>
        )}
        <a
          href={linkTecnico(`Olá! Sou ${produtor.name} e tenho uma dúvida sobre as minhas licenças.`)}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center gap-2 rounded-xl border border-marinho text-marinho font-semibold py-3.5 hover:bg-lavanda-clara transition-colors ${envio ? '' : 'sm:col-span-2'}`}
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
          Falar com o técnico
        </a>
      </section>
    </div>
  );
}