"use client";

import { useState } from "react";
import { versaoAtual } from "@/lib/biblioteca";
import { contribuicoesPendentes } from "@/lib/colaboracao";
import { contarMudancas, diffLinhas } from "@/lib/diff";
import { proporContribuicao, useEstado } from "@/lib/store";
import type { Material } from "@/lib/types";
import { Botao, Cartao } from "./ui";

/** Mostra o que mudou entre dois textos, linha a linha (verde = adicionado, vermelho = removido). */
export function Comparacao({ antes, depois }: { antes: string; depois: string }) {
  const diff = diffLinhas(antes, depois);
  const { adicionadas, removidas } = contarMudancas(diff);
  return (
    <div>
      <p className="mb-1 text-xs text-neutral-500">
        <span className="font-bold text-ok">+{adicionadas}</span> linha(s) adicionada(s) ·{" "}
        <span className="font-bold text-erro">−{removidas}</span> removida(s)
      </p>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-neutral-200 bg-neutral-50 p-2 font-sans text-sm leading-relaxed">
        {diff.map((l, i) => (
          <div
            key={i}
            className={l.tipo === "adicionada" ? "bg-ok-suave text-ok" : l.tipo === "removida" ? "bg-erro-suave text-erro line-through" : "text-neutral-700"}
          >
            <span className="mr-2 inline-block w-3 select-none text-neutral-400">{l.tipo === "adicionada" ? "+" : l.tipo === "removida" ? "−" : " "}</span>
            {l.texto || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}

const DECLARACOES = [
  { id: "autoria", texto: "As alterações que proponho são de minha autoria." },
  { id: "autorizaPublicacao", texto: "Autorizo a publicação, com meu nome entre os colaboradores do material." },
  { id: "semConteudoProibido", texto: "Não incluí trechos de livros, slides de professores, provas internas nem dados que identifiquem pacientes." },
] as const;

/** Formulário para outro estudante sugerir melhoria num resumo publicado. */
export function SugerirMelhoria({ material }: { material: Material }) {
  const { sessao } = useEstado();
  const atual = versaoAtual(material);
  const [aberto, setAberto] = useState(false);
  const [conteudo, setConteudo] = useState(atual.conteudo);
  const [referencias, setReferencias] = useState(atual.referencias);
  const [notas, setNotas] = useState("");
  const [declaracao, setDeclaracao] = useState({ autoria: false, autorizaPublicacao: false, semConteudoProibido: false });
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);
  const pendentes = contribuicoesPendentes(material);
  const minhaPendente = pendentes.find((c) => c.autor === sessao?.nome);

  function enviar() {
    const erro = proporContribuicao(material.id, { conteudo, referencias, notas, declaracao: { ...declaracao, em: new Date().toISOString() } });
    setResultado(erro ? { ok: false, texto: erro } : { ok: true, texto: "Sugestão enviada! Ela passa pela triagem e pela revisão acadêmica antes de entrar no texto." });
    if (!erro) setAberto(false);
  }

  return (
    <Cartao className="mt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg tracking-wide text-dals-800">Construa este resumo junto</h2>
          <p className="text-sm text-neutral-600">
            Encontrou um erro, falta um tópico ou dá para explicar melhor? Sugira uma melhoria. Se for aprovada, ela vira a próxima versão e
            você entra como colaborador.
          </p>
          {pendentes.length > 0 && <p className="mt-1 text-xs text-neutral-500">{pendentes.length} sugestão(ões) em análise.</p>}
        </div>
        {!aberto && !minhaPendente && (
          <Botao
            onClick={() => {
              setAberto(true);
              setResultado(null);
            }}
          >
            Sugerir melhoria
          </Botao>
        )}
      </div>

      {minhaPendente && !aberto && (
        <p className="mt-3 rounded-lg bg-info-suave p-2 text-sm text-info">Sua sugestão para este material está em análise. Acompanhe em Meus envios.</p>
      )}
      {resultado && (
        <p className={`mt-3 rounded-lg p-2 text-sm ${resultado.ok ? "bg-ok-suave text-ok" : "bg-erro-suave text-erro"}`}>{resultado.texto}</p>
      )}

      {aberto && (
        <div className="mt-4 space-y-4">
          <label className="block text-sm font-semibold">
            Texto do resumo (edite diretamente; partimos da versão {atual.numero})
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows={12}
              className="mt-1 w-full rounded-lg border border-neutral-300 p-3 font-normal outline-none focus:border-dals-600"
            />
          </label>
          {conteudo !== atual.conteudo && (
            <div>
              <p className="mb-1 text-sm font-semibold">Suas alterações</p>
              <Comparacao antes={atual.conteudo} depois={conteudo} />
            </div>
          )}
          <label className="block text-sm font-semibold">
            Referências
            <textarea
              value={referencias}
              onChange={(e) => setReferencias(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-neutral-300 p-2 font-normal outline-none focus:border-dals-600"
            />
          </label>
          <label className="block text-sm font-semibold">
            O que você melhorou? *
            <input
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              maxLength={200}
              placeholder="Ex.: corrigi o valor de referência e acrescentei a necrose fibrinoide"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal outline-none focus:border-dals-600"
            />
          </label>
          <div className="space-y-2">
            {DECLARACOES.map((d) => (
              <label key={d.id} className="flex gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={declaracao[d.id]}
                  onChange={(e) => setDeclaracao((atual) => ({ ...atual, [d.id]: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-dals-700"
                />
                <span>{d.texto}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Botao disabled={!notas.trim() || !Object.values(declaracao).every(Boolean) || conteudo.trim() === atual.conteudo.trim()} onClick={enviar}>
              Enviar sugestão
            </Botao>
            <Botao variante="fantasma" onClick={() => setAberto(false)}>
              Cancelar
            </Botao>
          </div>
        </div>
      )}
    </Cartao>
  );
}
