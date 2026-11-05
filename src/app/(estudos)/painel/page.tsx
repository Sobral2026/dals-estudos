"use client";

import Link from "next/link";
import { useState } from "react";
import { AvisoExemplo, Botao, Cartao, SeloStatus, TituloPagina } from "@/components/ui";
import { nomeDisciplina, periodoDaDisciplina } from "@/data/disciplinas";
import { QUESTOES } from "@/data/questoes";
import { nomeAssunto, nomeCompetencia } from "@/data/taxonomia";
import { rotuloTipo, TOM_STATUS, versaoAtual } from "@/lib/biblioteca";
import { CATEGORIAS, rotuloCategoria } from "@/lib/jornal";
import {
  acoesDisponiveis,
  PAPEIS,
  podeAcessarPainel,
  podeEditarJornal,
  podeVerAuditoria,
  rotuloPapel,
  ROTULO_STATUS,
} from "@/lib/permissoes";
import { Comparacao } from "@/components/Colaboracao";
import { STATUS_PENDENTES } from "@/lib/colaboracao";
import { moverContribuicao, mudarStatusPost, moverMaterial, moverVideo, salvarPost, tratarReporte, useEstado } from "@/lib/store";
import type { CategoriaPost, Post, StatusEditorial } from "@/lib/types";

type Aba = "fluxo" | "contribuicoes" | "videos" | "questoes" | "reportes" | "jornal" | "usuarios" | "auditoria";

const FILTROS_FLUXO: (StatusEditorial | "pendentes")[] = ["pendentes", "triagem", "revisao_academica", "aprovado", "publicado", "devolvido", "retirado"];

function FluxoEditorial() {
  const { materiais = [], sessao } = useEstado();
  const [filtro, setFiltro] = useState<StatusEditorial | "pendentes">("pendentes");
  const [erro, setErro] = useState<string | null>(null);
  const lista = materiais
    .filter((m) => (filtro === "pendentes" ? ["triagem", "revisao_academica", "aprovado"].includes(m.status) : m.status === filtro))
    .sort((a, b) => a.atualizadoEm.localeCompare(b.atualizadoEm));

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTROS_FLUXO.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${filtro === f ? "border-dals-700 bg-dals-700 text-white" : "border-neutral-300"}`}
          >
            {f === "pendentes" ? "Pendentes de ação" : ROTULO_STATUS[f]} ({materiais.filter((m) => (f === "pendentes" ? ["triagem", "revisao_academica", "aprovado"].includes(m.status) : m.status === f)).length})
          </button>
        ))}
      </div>
      {erro && <p className="mb-3 rounded-lg bg-erro-suave p-2 text-sm text-erro">{erro}</p>}
      {lista.length === 0 && <p className="text-sm text-neutral-500">Nada aqui.</p>}
      <div className="space-y-3">
        {lista.map((m) => {
          const acoes = acoesDisponiveis(m.status, sessao?.papel);
          return (
            <Cartao key={m.id}>
              <div className="flex flex-wrap items-center gap-2">
                <SeloStatus texto={ROTULO_STATUS[m.status]} tom={TOM_STATUS[m.status]} />
                <span className="text-xs text-neutral-500">
                  {rotuloTipo(m.tipo)} · {m.autor} · v{m.versoes.length} · {m.disciplina ? nomeDisciplina(m.disciplina) : "sem disciplina"}
                </span>
              </div>
              <Link href={`/biblioteca/${m.id}`} className="mt-1 block font-semibold text-dals-800 hover:underline">
                {m.titulo}
              </Link>
              <p className="text-xs text-neutral-500">
                Declaração de autoria: {m.declaracao.autoria && m.declaracao.autorizaPublicacao && m.declaracao.semConteudoProibido ? "completa ✔" : "incompleta ✖"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {acoes.length === 0 && <span className="text-xs text-neutral-400">Seu papel não tem ação nesta etapa.</span>}
                {acoes.map((a) => (
                  <Botao
                    key={a.acao}
                    variante={a.acao === "devolver" || a.acao === "retirar" ? "secundario" : "primario"}
                    className="!px-3 !py-1.5 !text-xs"
                    onClick={() => {
                      const comentario = a.exigeComentario ? window.prompt(`${a.rotulo}: informe a justificativa`) ?? "" : undefined;
                      if (a.exigeComentario && !comentario?.trim()) return;
                      setErro(moverMaterial(m.id, a.acao, comentario));
                    }}
                  >
                    {a.rotulo}
                  </Botao>
                ))}
              </div>
            </Cartao>
          );
        })}
      </div>
    </div>
  );
}

function Contribuicoes() {
  const { materiais = [], sessao } = useEstado();
  const [verTodas, setVerTodas] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const itens = materiais
    .flatMap((m) => (m.contribuicoes ?? []).map((c) => ({ m, c })))
    .filter(({ c }) => verTodas || STATUS_PENDENTES.includes(c.status))
    .sort((a, b) => a.c.em.localeCompare(b.c.em));

  return (
    <div>
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={verTodas} onChange={(e) => setVerTodas(e.target.checked)} className="accent-dals-700" />
        Mostrar também as já publicadas, devolvidas e retiradas
      </label>
      {erro && <p className="mb-3 rounded-lg bg-erro-suave p-2 text-sm text-erro">{erro}</p>}
      {itens.length === 0 && <p className="text-sm text-neutral-500">Nenhuma sugestão de melhoria {verTodas ? "" : "pendente"}.</p>}
      <div className="space-y-4">
        {itens.map(({ m, c }) => {
          const atual = versaoAtual(m);
          const acoes = acoesDisponiveis(c.status, sessao?.papel).filter((a) => a.acao !== "retirar");
          return (
            <Cartao key={c.id}>
              <div className="flex flex-wrap items-center gap-2">
                <SeloStatus texto={ROTULO_STATUS[c.status]} tom={TOM_STATUS[c.status]} />
                <span className="text-xs text-neutral-500">
                  Sugestão de {c.autor} ({rotuloPapel(c.papel)}) · {new Date(c.em).toLocaleString("pt-BR")}
                </span>
              </div>
              <Link href={`/biblioteca/${m.id}`} className="mt-1 block font-semibold text-dals-800 hover:underline">
                {m.titulo}
              </Link>
              <p className="mt-1 text-sm">
                <b>O que mudou:</b> {c.notas}
              </p>
              {c.baseVersao !== atual.numero && STATUS_PENDENTES.includes(c.status) && (
                <p className="mt-1 rounded bg-alerta-suave p-2 text-xs">
                  Atenção: a sugestão foi escrita sobre a versão {c.baseVersao}, mas o material já está na versão {atual.numero}. Confira se ela
                  não desfaz alterações mais recentes.
                </p>
              )}
              <div className="mt-3">
                <Comparacao antes={atual.conteudo} depois={c.conteudo} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUS_PENDENTES.includes(c.status) && acoes.length === 0 && (
                  <span className="text-xs text-neutral-400">Seu papel não tem ação nesta etapa.</span>
                )}
                {acoes.map((a) => (
                  <Botao
                    key={a.acao}
                    variante={a.acao === "devolver" ? "secundario" : "primario"}
                    className="!px-3 !py-1.5 !text-xs"
                    onClick={() => {
                      const comentario = a.exigeComentario ? window.prompt(`${a.rotulo}: informe a justificativa`) ?? "" : undefined;
                      if (a.exigeComentario && !comentario?.trim()) return;
                      setErro(moverContribuicao(m.id, c.id, a.acao, comentario));
                    }}
                  >
                    {a.acao === "publicar" ? "Publicar como nova versão" : a.rotulo}
                  </Botao>
                ))}
              </div>
            </Cartao>
          );
        })}
      </div>
    </div>
  );
}

function FluxoVideos() {
  const { videos = [], sessao } = useEstado();
  const [erro, setErro] = useState<string | null>(null);
  const lista = [...videos].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));

  if (lista.length === 0) return <p className="text-sm text-neutral-500">Nenhum vídeo sugerido ainda. As sugestões dos estudantes aparecem aqui.</p>;
  return (
    <div>
      {erro && <p className="mb-3 rounded-lg bg-erro-suave p-2 text-sm text-erro">{erro}</p>}
      <div className="space-y-3">
        {lista.map((v) => {
          const acoes = acoesDisponiveis(v.status, sessao?.papel);
          return (
            <Cartao key={v.id}>
              <div className="flex flex-wrap items-center gap-2">
                <SeloStatus texto={ROTULO_STATUS[v.status]} tom={TOM_STATUS[v.status]} />
                <span className="text-xs text-neutral-500">
                  {v.canal} · sugerido por {v.sugeridoPor} · {v.disciplina ? nomeDisciplina(v.disciplina) : "sem disciplina"}
                </span>
              </div>
              <Link href={`/videos/${v.id}`} className="mt-1 block font-semibold text-dals-800 hover:underline">
                {v.titulo}
              </Link>
              <p className="text-xs text-neutral-500">
                Declaração: {v.declaracao.publicoEIncorporavel && v.declaracao.semConteudoProibido ? "completa ✔" : "incompleta ✖"} · confira o
                conteúdo e a fonte antes de aprovar.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {acoes.length === 0 && <span className="text-xs text-neutral-400">Seu papel não tem ação nesta etapa.</span>}
                {acoes.map((a) => (
                  <Botao
                    key={a.acao}
                    variante={a.acao === "devolver" || a.acao === "retirar" ? "secundario" : "primario"}
                    className="!px-3 !py-1.5 !text-xs"
                    onClick={() => {
                      const comentario = a.exigeComentario ? window.prompt(`${a.rotulo}: informe a justificativa`) ?? "" : undefined;
                      if (a.exigeComentario && !comentario?.trim()) return;
                      setErro(moverVideo(v.id, a.acao, comentario));
                    }}
                  >
                    {a.rotulo}
                  </Botao>
                ))}
              </div>
            </Cartao>
          );
        })}
      </div>
    </div>
  );
}

function Questoes() {
  return (
    <Cartao className="overflow-x-auto p-0">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-left text-xs uppercase tracking-wider text-neutral-500">
            <th className="px-4 py-3">Código</th>
            <th className="py-3">FMC</th>
            <th className="py-3">ENAMED</th>
            <th className="py-3">Autoria / versão</th>
            <th className="px-4 py-3">PDF</th>
          </tr>
        </thead>
        <tbody>
          {QUESTOES.map((q) => (
            <tr key={q.id} className="border-b border-neutral-50 align-top">
              <td className="px-4 py-2 font-mono text-xs">{q.id}</td>
              <td className="py-2">
                {periodoDaDisciplina(q.disciplina)}º · {nomeDisciplina(q.disciplina)}
                <div className="text-xs text-neutral-500">
                  {nomeAssunto(q.assunto)}
                  {q.subassunto && ` › ${nomeAssunto(q.subassunto)}`}
                </div>
              </td>
              <td className="py-2 text-xs">{nomeCompetencia(q.enamed.competencia)}</td>
              <td className="py-2 text-xs">
                {q.autoria} · v{q.versao} · {q.atualizadaEm}
              </td>
              <td className="px-4 py-2">{q.permiteDownload ? <SeloStatus texto="Autorizado" tom="ok" /> : <SeloStatus texto="Só online" tom="neutro" />}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-3 text-xs text-neutral-500">
        Protótipo: as questões estão em <code>src/data/questoes.ts</code>. O cadastro, a edição com versionamento e o fluxo de revisão de questões
        pelo painel dependem do banco de dados.
      </p>
    </Cartao>
  );
}

function Reportes() {
  const { reportes } = useEstado();
  if (reportes.length === 0) return <p className="text-sm text-neutral-500">Nenhum reporte de erro.</p>;
  return (
    <div className="space-y-3">
      {reportes.map((r, i) => (
        <Cartao key={i}>
          <div className="flex flex-wrap items-center gap-2">
            <SeloStatus texto={r.status ?? "aberto"} tom={r.status === "procedente" ? "ok" : r.status === "improcedente" ? "neutro" : "alerta"} />
            <span className="font-mono text-xs">{r.questaoId}</span>
            <span className="text-xs text-neutral-500">{new Date(r.em).toLocaleString("pt-BR")}</span>
          </div>
          <p className="mt-1 text-sm">
            <b>{r.motivo}</b> {r.detalhe && `— ${r.detalhe}`}
          </p>
          <div className="mt-2 flex gap-2">
            <Botao variante="secundario" className="!px-3 !py-1 !text-xs" onClick={() => tratarReporte(i, "procedente")}>
              Procedente
            </Botao>
            <Botao variante="fantasma" className="!px-3 !py-1 !text-xs" onClick={() => tratarReporte(i, "improcedente")}>
              Improcedente
            </Botao>
          </div>
        </Cartao>
      ))}
      <p className="text-xs text-neutral-500">Protótipo: só aparecem os reportes feitos neste navegador.</p>
    </div>
  );
}

function EditorPost({ post, aoFechar }: { post?: Post; aoFechar: () => void }) {
  const [titulo, setTitulo] = useState(post?.titulo ?? "");
  const [resumo, setResumo] = useState(post?.resumo ?? "");
  const [corpo, setCorpo] = useState(post?.corpo ?? "");
  const [categoria, setCategoria] = useState<CategoriaPost>(post?.categoria ?? "noticia");
  const campo = "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal outline-none focus:border-dals-600";
  return (
    <Cartao className="mb-4 space-y-3">
      <h3 className="font-display text-lg tracking-wide text-dals-800">{post ? "Editar matéria" : "Nova matéria"}</h3>
      <label className="block text-sm font-semibold">
        Título
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={campo} />
      </label>
      <label className="block text-sm font-semibold">
        Categoria
        <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaPost)} className={campo}>
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.rotulo}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold">
        Resumo
        <input value={resumo} onChange={(e) => setResumo(e.target.value)} className={campo} />
      </label>
      <label className="block text-sm font-semibold">
        Texto (parágrafos separados por linha em branco; sem HTML)
        <textarea value={corpo} onChange={(e) => setCorpo(e.target.value)} rows={8} className={campo} />
      </label>
      <div className="flex gap-2">
        <Botao
          disabled={!titulo.trim() || !corpo.trim()}
          onClick={() => {
            salvarPost({ titulo: titulo.trim(), resumo: resumo.trim(), corpo, categoria }, post?.id);
            aoFechar();
          }}
        >
          Salvar rascunho
        </Botao>
        <Botao variante="fantasma" onClick={aoFechar}>
          Cancelar
        </Botao>
      </div>
    </Cartao>
  );
}

function Jornal() {
  const { posts = [], sessao } = useEstado();
  const [editando, setEditando] = useState<Post | "novo" | null>(null);
  if (!podeEditarJornal(sessao?.papel)) return <p className="text-sm text-neutral-500">Apenas editores e administradores publicam no Jornal.</p>;
  return (
    <div>
      {editando ? (
        <EditorPost key={editando === "novo" ? "novo" : editando.id} post={editando === "novo" ? undefined : editando} aoFechar={() => setEditando(null)} />
      ) : (
        <Botao className="mb-4" onClick={() => setEditando("novo")}>
          Nova matéria
        </Botao>
      )}
      <div className="space-y-3">
        {[...posts]
          .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
          .map((p) => (
            <Cartao key={p.id}>
              <div className="flex flex-wrap items-center gap-2">
                <SeloStatus texto={p.status} tom={p.status === "publicado" ? "ok" : p.status === "rascunho" ? "alerta" : "neutro"} />
                <span className="text-xs text-neutral-500">
                  {rotuloCategoria(p.categoria)} · {p.autor} · atualizado {new Date(p.atualizadoEm).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="mt-1 font-semibold">{p.titulo}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Botao variante="secundario" className="!px-3 !py-1 !text-xs" onClick={() => setEditando(p)}>
                  Editar
                </Botao>
                {p.status !== "publicado" && (
                  <Botao className="!px-3 !py-1 !text-xs" onClick={() => mudarStatusPost(p.id, "publicado")}>
                    Publicar
                  </Botao>
                )}
                {p.status === "publicado" && (
                  <>
                    <Link href={`/jornal/${p.slug}`} className="px-2 py-1 text-xs font-bold text-dals-700 hover:underline">
                      Ver no Jornal
                    </Link>
                    <Botao variante="fantasma" className="!px-3 !py-1 !text-xs" onClick={() => mudarStatusPost(p.id, "arquivado")}>
                      Arquivar
                    </Botao>
                  </>
                )}
              </div>
            </Cartao>
          ))}
      </div>
    </div>
  );
}

function Usuarios() {
  return (
    <Cartao>
      <p className="mb-4 text-sm text-neutral-600">
        Protótipo: não há cadastro real. O papel é escolhido na tela de entrada para demonstrar as permissões. No site definitivo, o administrador
        aprova vínculos com a FMC e atribui papéis aqui, com registro em auditoria.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
            <th className="py-2">Papel</th>
            <th className="py-2">Permissões</th>
          </tr>
        </thead>
        <tbody>
          {PAPEIS.map((p) => (
            <tr key={p.id} className="border-t border-neutral-100">
              <td className="py-2 font-semibold">{p.rotulo}</td>
              <td className="py-2 text-neutral-600">{p.descricao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Cartao>
  );
}

function Auditoria() {
  const { auditoria = [], sessao } = useEstado();
  if (!podeVerAuditoria(sessao?.papel)) return <p className="text-sm text-neutral-500">Apenas administradores veem a auditoria.</p>;
  return (
    <Cartao className="overflow-x-auto p-0">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-left text-xs uppercase tracking-wider text-neutral-500">
            <th className="px-4 py-3">Quando</th>
            <th className="py-3">Quem</th>
            <th className="py-3">Ação</th>
            <th className="px-4 py-3">Alvo</th>
          </tr>
        </thead>
        <tbody>
          {[...auditoria].reverse().map((a, i) => (
            <tr key={i} className="border-b border-neutral-50 align-top">
              <td className="whitespace-nowrap px-4 py-2 text-xs">{new Date(a.em).toLocaleString("pt-BR")}</td>
              <td className="py-2 text-xs">
                {a.ator} <span className="text-neutral-400">({a.papel === "anonimo" ? "anônimo" : rotuloPapel(a.papel)})</span>
              </td>
              <td className="py-2">{a.acao}</td>
              <td className="px-4 py-2 text-xs">
                {a.alvo}
                {a.detalhe && <div className="text-neutral-500">{a.detalhe}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {auditoria.length === 0 && <p className="px-4 py-3 text-sm text-neutral-500">Sem registros.</p>}
    </Cartao>
  );
}

export default function Painel() {
  const { sessao, materiais = [], reportes, videos = [] } = useEstado();
  const [aba, setAba] = useState<Aba>("fluxo");

  if (!podeAcessarPainel(sessao?.papel)) {
    return (
      <Cartao className="mx-auto max-w-lg text-center">
        <h1 className="font-display text-2xl tracking-wide text-dals-800">Acesso restrito</h1>
        <p className="mt-2 text-sm text-neutral-600">O painel editorial é exclusivo para revisores, editores e administradores autorizados pelo DALS.</p>
      </Cartao>
    );
  }

  const pendentes = materiais.filter((m) => ["triagem", "revisao_academica", "aprovado"].includes(m.status)).length;
  const abas: { id: Aba; rotulo: string }[] = [
    { id: "fluxo", rotulo: `Fluxo editorial (${pendentes})` },
    {
      id: "contribuicoes",
      rotulo: `Contribuições (${materiais.flatMap((m) => m.contribuicoes ?? []).filter((c) => STATUS_PENDENTES.includes(c.status)).length})`,
    },
    { id: "videos", rotulo: `Vídeos (${videos.filter((v) => ["triagem", "revisao_academica", "aprovado"].includes(v.status)).length})` },
    { id: "questoes", rotulo: "Questões" },
    { id: "reportes", rotulo: `Reportes (${reportes.filter((r) => (r.status ?? "aberto") === "aberto").length})` },
    { id: "jornal", rotulo: "Jornal" },
    { id: "usuarios", rotulo: "Usuários e papéis" },
    { id: "auditoria", rotulo: "Auditoria" },
  ];

  return (
    <div>
      <TituloPagina titulo="Painel editorial" subtitulo={`Conectado como ${sessao!.nome} · ${rotuloPapel(sessao!.papel)}`} />
      <AvisoExemplo>
        <b>Protótipo:</b> as permissões são verificadas no navegador e os dados ficam neste dispositivo. No site definitivo, cada ação é validada no
        servidor e no banco de dados.
      </AvisoExemplo>
      <div className="mb-5 flex flex-wrap gap-1 border-b border-neutral-200" role="tablist">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            onClick={() => setAba(a.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-bold ${aba === a.id ? "border-dals-700 text-dals-800" : "border-transparent text-neutral-500 hover:text-dals-700"}`}
          >
            {a.rotulo}
          </button>
        ))}
      </div>
      {aba === "fluxo" && <FluxoEditorial />}
      {aba === "contribuicoes" && <Contribuicoes />}
      {aba === "videos" && <FluxoVideos />}
      {aba === "questoes" && <Questoes />}
      {aba === "reportes" && <Reportes />}
      {aba === "jornal" && <Jornal />}
      {aba === "usuarios" && <Usuarios />}
      {aba === "auditoria" && <Auditoria />}
    </div>
  );
}
