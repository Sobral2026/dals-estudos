"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Botao, BotaoLink, Cartao, SeloStatus, TituloPagina } from "@/components/ui";
import { rotuloTipo, TOM_STATUS, versaoAtual } from "@/lib/biblioteca";
import { ROTULO_STATUS } from "@/lib/permissoes";
import { reenviarMaterial, useEstado } from "@/lib/store";
import type { Material } from "@/lib/types";

function Correcao({ material }: { material: Material }) {
  const [conteudo, setConteudo] = useState(versaoAtual(material).conteudo);
  const [notas, setNotas] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div className="mt-3 rounded-xl border border-erro/30 bg-erro-suave/40 p-3">
      <label className="block text-sm font-semibold">
        Versão corrigida
        <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} rows={6} className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2 font-normal" />
      </label>
      <label className="mt-2 block text-sm font-semibold">
        O que mudou?
        <input value={notas} onChange={(e) => setNotas(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2 font-normal" />
      </label>
      <Botao className="mt-3" disabled={!notas.trim()} onClick={() => setErro(reenviarMaterial(material.id, conteudo, notas.trim()))}>
        Reenviar para triagem
      </Botao>
      {erro && <p className="mt-2 text-sm text-erro">{erro}</p>}
    </div>
  );
}

function Lista() {
  const { materiais = [], sessao } = useEstado();
  const enviado = useSearchParams().get("enviado");
  const meus = materiais.filter((m) => m.autor === sessao?.nome).sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  const minhasContribuicoes = materiais
    .flatMap((m) => (m.contribuicoes ?? []).filter((c) => c.autor === sessao?.nome).map((c) => ({ m, c })))
    .sort((a, b) => b.c.em.localeCompare(a.c.em));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <TituloPagina titulo="Meus envios" subtitulo="Acompanhe cada material no fluxo editorial." />
        <BotaoLink href="/biblioteca/enviar">Enviar material</BotaoLink>
      </div>
      {enviado && (
        <div className="mb-4 rounded-xl bg-ok-suave p-3 text-sm font-semibold text-ok">
          Material enviado! Ele está agora na triagem editorial.
        </div>
      )}
      {meus.length === 0 ? (
        <p className="text-sm text-neutral-500">Você ainda não enviou materiais.</p>
      ) : (
        <div className="space-y-4">
          {meus.map((m) => {
            const ultimo = m.eventos[m.eventos.length - 1];
            return (
              <Cartao key={m.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <SeloStatus texto={ROTULO_STATUS[m.status]} tom={TOM_STATUS[m.status]} />
                  <span className="text-xs text-neutral-500">
                    {rotuloTipo(m.tipo)} · versão {versaoAtual(m).numero}
                  </span>
                </div>
                <Link href={`/biblioteca/${m.id}`} className="mt-2 block font-display text-xl tracking-wide text-dals-800 hover:underline">
                  {m.titulo}
                </Link>
                <p className="text-xs text-neutral-500">Última movimentação: {new Date(ultimo.em).toLocaleString("pt-BR")}</p>
                {ultimo.comentario && (
                  <p className="mt-2 rounded-lg bg-neutral-50 p-2 text-sm">
                    <b>Comentário da equipe:</b> {ultimo.comentario}
                  </p>
                )}
                {m.status === "devolvido" && <Correcao material={m} />}
              </Cartao>
            );
          })}
        </div>
      )}

      <h2 className="mb-3 mt-8 font-display text-xl tracking-wide text-dals-800">Minhas sugestões de melhoria</h2>
      {minhasContribuicoes.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Você ainda não sugeriu melhorias. Abra qualquer resumo da{" "}
          <Link href="/biblioteca" className="font-semibold text-dals-700 hover:underline">
            Biblioteca
          </Link>{" "}
          e clique em &ldquo;Sugerir melhoria&rdquo;.
        </p>
      ) : (
        <div className="space-y-3">
          {minhasContribuicoes.map(({ m, c }) => {
            const ultimo = c.eventos[c.eventos.length - 1];
            return (
              <Cartao key={c.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <SeloStatus texto={ROTULO_STATUS[c.status]} tom={TOM_STATUS[c.status]} />
                  <span className="text-xs text-neutral-500">enviada em {new Date(c.em).toLocaleDateString("pt-BR")}</span>
                </div>
                <Link href={`/biblioteca/${m.id}`} className="mt-1 block font-semibold text-dals-800 hover:underline">
                  {m.titulo}
                </Link>
                <p className="text-sm text-neutral-600">{c.notas}</p>
                {ultimo.comentario && ultimo.ator !== c.autor && (
                  <p className="mt-2 rounded-lg bg-neutral-50 p-2 text-sm">
                    <b>Comentário da equipe:</b> {ultimo.comentario}
                  </p>
                )}
                {c.status === "publicado" && <p className="mt-1 text-xs font-semibold text-ok">Incorporada ao material. Você agora é colaborador.</p>}
              </Cartao>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MeusEnvios() {
  return (
    <Suspense>
      <Lista />
    </Suspense>
  );
}
