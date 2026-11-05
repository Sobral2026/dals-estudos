"use client";

import Link from "next/link";
import { useState } from "react";
import { BotaoLink, Cartao, SeloStatus, TituloPagina } from "@/components/ui";
import { MiniaturaYoutube } from "@/components/VideoYoutube";
import { DISCIPLINAS, PERIODOS, nomeDisciplina } from "@/data/disciplinas";
import { ASSUNTOS, nomeAssunto } from "@/data/taxonomia";
import { TOM_STATUS } from "@/lib/biblioteca";
import { ROTULO_STATUS } from "@/lib/permissoes";
import { useEstado } from "@/lib/store";
import { buscarVideos } from "@/lib/videos";

const seletor = "rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-dals-600";

export default function Videos() {
  const { videos = [], sessao } = useEstado();
  const [termo, setTermo] = useState("");
  const [periodo, setPeriodo] = useState(0);
  const [disciplina, setDisciplina] = useState("");
  const [assunto, setAssunto] = useState("");

  const publicados = videos.filter((v) => v.status === "publicado");
  const lista = buscarVideos(publicados, termo)
    .filter((v) => (!periodo || v.periodo === periodo) && (!disciplina || v.disciplina === disciplina) && (!assunto || v.assunto === assunto))
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  const minhasSugestoes = videos.filter((v) => v.sugeridoPor === sessao?.nome && v.status !== "publicado");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <TituloPagina titulo="Vídeos" subtitulo="Aulas e explicações do YouTube sobre as matérias, selecionadas e revisadas pela diretoria." />
        <BotaoLink href="/videos/sugerir">Sugerir vídeo</BotaoLink>
      </div>

      <Cartao className="mb-6">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por título, canal ou palavra-chave"
          aria-label="Buscar vídeos"
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none focus:border-dals-600"
        />
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <select
            value={periodo}
            onChange={(e) => {
              setPeriodo(Number(e.target.value));
              setDisciplina("");
              setAssunto("");
            }}
            className={seletor}
            aria-label="Período"
          >
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
            {ASSUNTOS.filter((a) => a.disciplina === disciplina).map((a) => (
              <option key={a.id} value={a.id}>
                {a.pai ? `└ ${a.nome}` : a.nome}
              </option>
            ))}
          </select>
        </div>
      </Cartao>

      {publicados.length === 0 ? (
        <Cartao className="text-center">
          <div className="text-4xl">🎬</div>
          <h2 className="mt-2 font-display text-xl tracking-wide text-dals-800">Nenhum vídeo publicado ainda</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-neutral-600">
            Conhece uma boa aula no YouTube sobre alguma matéria? Sugira o link. Depois da revisão da diretoria, ele aparece aqui para todos.
          </p>
          <BotaoLink href="/videos/sugerir" className="mt-4">
            Sugerir o primeiro vídeo
          </BotaoLink>
        </Cartao>
      ) : lista.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum vídeo encontrado com esses filtros.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((v) => (
            <Link key={v.id} href={`/videos/${v.id}`} className="group">
              <MiniaturaYoutube youtubeId={v.youtubeId} titulo={v.titulo} />
              <h2 className="mt-2 font-semibold leading-snug text-dals-900 group-hover:underline">{v.titulo}</h2>
              <p className="text-xs text-neutral-500">
                {v.canal}
                {v.disciplina && ` · ${nomeDisciplina(v.disciplina)}`}
                {v.assunto && ` › ${nomeAssunto(v.assunto)}`}
              </p>
            </Link>
          ))}
        </div>
      )}

      {minhasSugestoes.length > 0 && (
        <Cartao className="mt-8">
          <h2 className="mb-3 font-display text-lg tracking-wide text-dals-800">Minhas sugestões em análise</h2>
          <ul className="divide-y divide-neutral-100">
            {minhasSugestoes.map((v) => {
              const ultimo = v.eventos[v.eventos.length - 1];
              return (
                <li key={v.id} className="py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeloStatus texto={ROTULO_STATUS[v.status]} tom={TOM_STATUS[v.status]} />
                    <Link href={`/videos/${v.id}`} className="font-semibold hover:underline">
                      {v.titulo}
                    </Link>
                  </div>
                  {ultimo.comentario && <p className="mt-1 text-sm text-neutral-600">Comentário da equipe: {ultimo.comentario}</p>}
                </li>
              );
            })}
          </ul>
        </Cartao>
      )}
    </div>
  );
}
