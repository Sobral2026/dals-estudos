"use client";

import Link from "next/link";
import { useState } from "react";
import { BotaoLink, Cartao, SeloStatus, TituloPagina } from "@/components/ui";
import { DISCIPLINAS, PERIODOS, nomeDisciplina } from "@/data/disciplinas";
import { ASSUNTOS, nomeAssunto } from "@/data/taxonomia";
import { buscarMateriais, rotuloTipo, TIPOS_MATERIAL } from "@/lib/biblioteca";
import { useEstado } from "@/lib/store";
import type { TipoMaterial } from "@/lib/types";

const seletor = "rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-dals-600";

export default function Biblioteca() {
  const { materiais = [] } = useEstado();
  const [termo, setTermo] = useState("");
  const [periodo, setPeriodo] = useState(0);
  const [disciplina, setDisciplina] = useState("");
  const [assunto, setAssunto] = useState("");
  const [tipo, setTipo] = useState<TipoMaterial | "">("");

  // Só material publicado aparece na Biblioteca.
  const publicados = materiais.filter((m) => m.status === "publicado");
  const lista = buscarMateriais(publicados, termo)
    .filter(
      (m) =>
        (!periodo || m.periodo === periodo) &&
        (!disciplina || m.disciplina === disciplina) &&
        (!assunto || m.assunto === assunto) &&
        (!tipo || m.tipo === tipo),
    )
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <TituloPagina titulo="Biblioteca" subtitulo="Materiais autorais de estudantes e da diretoria, revisados antes de publicar." />
        <div className="flex gap-2">
          <BotaoLink href="/biblioteca/meus-envios" variante="secundario">
            Meus envios
          </BotaoLink>
          <BotaoLink href="/biblioteca/enviar">Enviar resumo ou material</BotaoLink>
        </div>
      </div>

      <Cartao className="mb-6">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por palavra-chave (ex.: necrose, antídoto, diabetes)"
          aria-label="Buscar na biblioteca"
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none focus:border-dals-600"
        />
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <select value={periodo} onChange={(e) => setPeriodo(Number(e.target.value))} className={seletor} aria-label="Período">
            <option value={0}>Todos os períodos</option>
            {PERIODOS.map((p) => (
              <option key={p} value={p}>
                {p}º período
              </option>
            ))}
          </select>
          <select
            value={disciplina}
            onChange={(e) => {
              setDisciplina(e.target.value);
              setAssunto("");
            }}
            className={seletor}
            aria-label="Disciplina"
          >
            <option value="">Todas as disciplinas</option>
            {DISCIPLINAS.filter((d) => !periodo || d.periodo === periodo).map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
          <select value={assunto} onChange={(e) => setAssunto(e.target.value)} className={seletor} aria-label="Assunto" disabled={!disciplina}>
            <option value="">{disciplina ? "Todos os assuntos" : "Escolha a disciplina"}</option>
            {ASSUNTOS.filter((a) => a.disciplina === disciplina && !a.pai).map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoMaterial | "")} className={seletor} aria-label="Tipo">
            <option value="">Todos os tipos</option>
            {TIPOS_MATERIAL.map((t) => (
              <option key={t.id} value={t.id}>
                {t.rotulo}
              </option>
            ))}
          </select>
        </div>
      </Cartao>

      {lista.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum material encontrado com esses filtros.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lista.map((m) => (
            <Link key={m.id} href={`/biblioteca/${m.id}`}>
              <Cartao className="h-full transition hover:border-dals-600">
                <div className="flex flex-wrap items-center gap-2">
                  <SeloStatus texto={rotuloTipo(m.tipo)} tom="info" />
                  {m.disciplina && (
                    <span className="text-xs text-neutral-500">
                      {m.periodo}º período · {nomeDisciplina(m.disciplina)}
                      {m.assunto && ` › ${nomeAssunto(m.assunto)}`}
                    </span>
                  )}
                </div>
                <h2 className="mt-2 font-display text-xl tracking-wide text-dals-800">{m.titulo}</h2>
                <p className="mt-1 text-sm text-neutral-600">{m.descricao}</p>
                <p className="mt-3 text-xs text-neutral-500">
                  {m.autor}
                  {(m.colaboradores?.length ?? 0) > 0 && ` + ${m.colaboradores!.length} colaborador(es)`} · v{m.versoes.length} · atualizado em {new Date(m.atualizadoEm).toLocaleDateString("pt-BR")} ·{" "}
                  {m.permiteDownload ? "download autorizado" : "somente leitura"}
                </p>
              </Cartao>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
