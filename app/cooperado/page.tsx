'use client';

import { ArrowRight, FileUp, Loader2, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { errorMessage, getProducers } from '../admin/lib/api';
import type { RuralProducer } from '../admin/lib/types';
import { linkTecnico } from './lib/contato';
import { documentoCompleto, formatarDocumento, somenteDigitos } from './lib/documento';

// Entrada da área do cooperado: o produtor se identifica pelo CPF/CNPJ do cadastro.
// Sem login por enquanto (versão de demonstração): quem sabe o documento vê as licenças.

type Situacao = { tipo: 'livre' } | { tipo: 'buscando' } | { tipo: 'nao-encontrado' } | { tipo: 'erro'; mensagem: string };

// A API busca por trecho do texto; o mesmo documento pode estar salvo com ou sem pontuação, então vão as duas formas.
async function buscarPorDocumento(documento: string): Promise<RuralProducer | null> {
  const digitos = somenteDigitos(documento);
  const termos = Array.from(new Set([formatarDocumento(digitos), digitos]));
  const paginas = await Promise.all(termos.map((search) => getProducers({ search, active: true, size: 20 })));
  const produtores = paginas.flatMap((pagina) => pagina.content);
  return produtores.find((produtor) => somenteDigitos(produtor.document) === digitos) ?? null;
}

export default function EntradaCooperado() {
  const router = useRouter();
  const [documento, setDocumento] = useState('');
  const [situacao, setSituacao] = useState<Situacao>({ tipo: 'livre' });

  const podeBuscar = documentoCompleto(documento) && situacao.tipo !== 'buscando';

  const entrar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!podeBuscar) return;

    setSituacao({ tipo: 'buscando' });
    try {
      const produtor = await buscarPorDocumento(documento);
      if (produtor) {
        router.push(`/cooperado/${produtor.id}`);
      } else {
        setSituacao({ tipo: 'nao-encontrado' });
      }
    } catch (err) {
      setSituacao({ tipo: 'erro', mensagem: errorMessage(err, 'Não foi possível buscar o cadastro.') });
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-linha p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-tinta leading-tight [font-stretch:112%] text-balance">
          Consulte suas licenças ambientais
        </h1>
        <p className="mt-3 text-slate-600">
          Digite o CPF ou CNPJ cadastrado na cooperativa para ver a validade de cada licença e quando renovar.
        </p>

        <form onSubmit={entrar} className="mt-6 space-y-4">
          <div>
            <label htmlFor="documento" className="block text-sm font-semibold text-tinta mb-1.5">
              CPF ou CNPJ
            </label>
            <input
              id="documento"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              value={documento}
              onChange={(e) => {
                setDocumento(formatarDocumento(e.target.value));
                if (situacao.tipo !== 'buscando') setSituacao({ tipo: 'livre' });
              }}
              className="w-full rounded-xl border border-linha bg-white px-4 py-3.5 text-lg text-tinta tracking-wide placeholder:text-slate-400 focus:border-marinho focus:outline-none focus:ring-2 focus:ring-lavanda/40"
            />
          </div>

          <button
            type="submit"
            disabled={!podeBuscar}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-marinho text-white font-semibold text-lg py-3.5 hover:bg-marinho-escuro transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {situacao.tipo === 'buscando' ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            )}
            Ver minhas licenças
          </button>
        </form>

        {situacao.tipo === 'nao-encontrado' && (
          <div className="mt-5 rounded-xl bg-vencendo-claro px-4 py-3.5 text-sm text-tinta" role="status">
            <p className="font-semibold text-vencendo">Não encontramos esse documento entre os produtores da cooperativa.</p>
            <p className="mt-1 text-slate-700">Confira os números ou peça ao técnico para fazer o seu cadastro.</p>
            <a
              href={linkTecnico('Olá! Quero me cadastrar na área do cooperado do Coopera Fácil.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 font-semibold text-marinho hover:underline"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              Falar com o técnico
            </a>
          </div>
        )}

        {situacao.tipo === 'erro' && (
          <p className="mt-5 rounded-xl bg-vencida-claro px-4 py-3.5 text-sm font-semibold text-vencida" role="alert">
            {situacao.mensagem}
          </p>
        )}
      </section>

      {/* Lembrete do fluxo principal: a licença nova entra pelo WhatsApp, não por esta tela. */}
      <section className="flex gap-4 px-1">
        <span className="w-10 h-10 shrink-0 rounded-xl bg-lavanda-clara text-marinho flex items-center justify-center">
          <FileUp className="w-5 h-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold text-tinta">Recebeu uma licença nova?</p>
          <p className="text-sm text-slate-600 mt-0.5">
            Envie o PDF pelo WhatsApp da cooperativa. A leitura é automática e a licença aparece aqui em instantes.
          </p>
        </div>
      </section>
    </div>
  );
}