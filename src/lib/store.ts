"use client";

/**
 * Armazenamento do protótipo: tudo fica no localStorage do navegador.
 * No site definitivo, estas funções viram chamadas ao servidor/banco de dados,
 * mantendo a mesma interface para as telas.
 *
 * Schema v2 (DALS Estudos): acrescenta sessão de demonstração, biblioteca, jornal e auditoria.
 * A migração do v1 só ACRESCENTA campos; histórico, revisão e simulados existentes são preservados.
 */

import { useSyncExternalStore } from "react";
import { MATERIAIS_INICIAIS, POSTS_INICIAIS } from "@/data/conteudo-inicial";
import { questaoPorId } from "@/data/questoes";
import { versaoAtual } from "./biblioteca";
import { aplicarMovimentoContribuicao, validarProposta } from "./colaboracao";
import { temNivel, transicao, type AcaoFluxo } from "./permissoes";
import { proximoEstadoRevisao } from "./revisao";
import type {
  Confianca,
  Contribuicao,
  EstadoRevisao,
  EventoAuditoria,
  Letra,
  Material,
  ModoSimulado,
  Post,
  RegistroResposta,
  Reporte,
  Sessao,
  Simulado,
  Video,
} from "./types";

const CHAVE = "dals-questoes:v1";
const VERSAO_SCHEMA = 2;

export interface Estado {
  versaoSchema?: number;
  historico: RegistroResposta[];
  revisao: Record<string, EstadoRevisao>;
  simulados: Record<string, Simulado>;
  reportes: Reporte[];
  sessao?: Sessao | null;
  materiais?: Material[];
  posts?: Post[];
  auditoria?: EventoAuditoria[];
  videos?: Video[];
}

const VAZIO: Estado = {
  videos: [],
  versaoSchema: VERSAO_SCHEMA,
  historico: [],
  revisao: {},
  simulados: {},
  reportes: [],
  sessao: null,
  materiais: MATERIAIS_INICIAIS,
  posts: POSTS_INICIAIS,
  auditoria: [],
};

let cache: Estado | null = null;
const ouvintes = new Set<() => void>();

/** Acrescenta os campos novos sem tocar nos existentes. */
export function migrar(bruto: Partial<Estado>): Estado {
  return {
    ...VAZIO,
    ...bruto,
    materiais: bruto.materiais ?? MATERIAIS_INICIAIS,
    posts: bruto.posts ?? POSTS_INICIAIS,
    auditoria: bruto.auditoria ?? [],
    videos: bruto.videos ?? [],
    versaoSchema: VERSAO_SCHEMA,
  };
}

function ler(): Estado {
  if (cache) return cache;
  try {
    const bruto = localStorage.getItem(CHAVE);
    cache = bruto ? migrar(JSON.parse(bruto)) : VAZIO;
  } catch {
    cache = VAZIO;
  }
  return cache ?? VAZIO;
}

function gravar(atualizar: (e: Estado) => Estado) {
  cache = atualizar(ler());
  try {
    localStorage.setItem(CHAVE, JSON.stringify(cache));
  } catch {
    // Sem armazenamento (aba anônima bloqueada, cota cheia): segue só em memória.
  }
  ouvintes.forEach((f) => f());
}

function assinar(f: () => void) {
  ouvintes.add(f);
  const aoMudarOutraAba = (e: StorageEvent) => {
    if (e.key === CHAVE) {
      cache = null;
      f();
    }
  };
  window.addEventListener("storage", aoMudarOutraAba);
  return () => {
    ouvintes.delete(f);
    window.removeEventListener("storage", aoMudarOutraAba);
  };
}

export function useEstado() {
  return useSyncExternalStore(assinar, ler, () => VAZIO);
}

/** true só no navegador, depois da hidratação (o servidor não enxerga o localStorage). */
export function useMontado() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function novoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function agoraIso() {
  return new Date().toISOString();
}

function auditar(e: Estado, acao: string, alvo: string, detalhe?: string): EventoAuditoria[] {
  const evento: EventoAuditoria = {
    acao,
    alvo,
    detalhe,
    ator: e.sessao?.nome ?? "anônimo",
    papel: e.sessao?.papel ?? "anonimo",
    em: agoraIso(),
  };
  return [...(e.auditoria ?? []), evento];
}

// ---------- Sessão de demonstração (sem senha; NÃO é autenticação real) ----------

export function entrarDemo(sessao: Sessao) {
  gravar((e) => {
    const comSessao = { ...e, sessao };
    return { ...comSessao, auditoria: auditar(comSessao, "entrou", "sessão", `papel: ${sessao.papel}`) };
  });
}

export function sair() {
  gravar((e) => ({ ...e, auditoria: auditar(e, "saiu", "sessão"), sessao: null }));
}

// ---------- Estudo (funções originais preservadas) ----------

export function registrarResposta(questaoId: string, letra: Letra, confianca: Confianca) {
  const questao = questaoPorId(questaoId);
  if (!questao) return;
  const agora = new Date();
  const acertou = questao.correta === letra;
  gravar((e) => ({
    ...e,
    historico: [...e.historico, { questaoId, letra, acertou, confianca, em: agora.toISOString() }],
    revisao: {
      ...e.revisao,
      [questaoId]: proximoEstadoRevisao(e.revisao[questaoId], acertou, confianca, agora),
    },
  }));
}

export function criarSimulado(titulo: string, modo: ModoSimulado, questoes: string[]) {
  const id = novoId();
  const simulado: Simulado = {
    id,
    titulo,
    modo,
    questoes,
    respostas: {},
    atual: 0,
    finalizado: false,
    inicio: agoraIso(),
  };
  gravar((e) => ({ ...e, simulados: { ...e.simulados, [id]: simulado } }));
  return id;
}

function atualizarSimulado(id: string, mudar: (s: Simulado) => Simulado) {
  gravar((e) => {
    const s = e.simulados[id];
    return s ? { ...e, simulados: { ...e.simulados, [id]: mudar(s) } } : e;
  });
}

export function irParaQuestao(id: string, indice: number) {
  atualizarSimulado(id, (s) => ({
    ...s,
    atual: Math.max(0, Math.min(indice, s.questoes.length - 1)),
  }));
}

/** No modo tutor a resposta já conta para o histórico; no modo prova, só ao finalizar. */
export function responderNoSimulado(id: string, questaoId: string, letra: Letra, confianca: Confianca) {
  const simulado = ler().simulados[id];
  if (!simulado || simulado.finalizado) return;
  if (simulado.modo === "tutor" && simulado.respostas[questaoId]) return;
  atualizarSimulado(id, (s) => ({
    ...s,
    respostas: { ...s.respostas, [questaoId]: { letra, confianca } },
  }));
  if (simulado.modo === "tutor") registrarResposta(questaoId, letra, confianca);
}

export function finalizarSimulado(id: string) {
  const simulado = ler().simulados[id];
  if (!simulado || simulado.finalizado) return;
  if (simulado.modo === "prova") {
    for (const [questaoId, r] of Object.entries(simulado.respostas)) {
      registrarResposta(questaoId, r.letra, r.confianca);
    }
  }
  atualizarSimulado(id, (s) => ({ ...s, finalizado: true, fim: agoraIso() }));
}

export function excluirSimulado(id: string) {
  gravar((e) => {
    const simulados = { ...e.simulados };
    delete simulados[id];
    return { ...e, simulados };
  });
}

export function reportarErro(questaoId: string, motivo: string, detalhe: string) {
  gravar((e) => ({
    ...e,
    reportes: [...e.reportes, { questaoId, motivo, detalhe, em: agoraIso(), status: "aberto" }],
    auditoria: auditar(e, "reportou erro", `questão ${questaoId}`, motivo),
  }));
}

export function tratarReporte(indice: number, status: NonNullable<Reporte["status"]>) {
  gravar((e) => {
    const r = e.reportes[indice];
    if (!r) return e;
    const reportes = e.reportes.map((x, i) => (i === indice ? { ...x, status } : x));
    return { ...e, reportes, auditoria: auditar(e, `marcou reporte como ${status}`, `questão ${r.questaoId}`) };
  });
}

/** Apaga só o progresso de estudo deste navegador. Biblioteca, jornal e auditoria são mantidos. */
export function limparProgresso() {
  gravar((e) => ({
    ...e,
    historico: [],
    revisao: {},
    simulados: {},
    auditoria: auditar(e, "apagou o próprio progresso", "progresso"),
  }));
}

export function registrarExportacao(formato: string, ids: string[]) {
  gravar((e) => ({ ...e, auditoria: auditar(e, `exportou PDF (${formato})`, `${ids.length} questões`, ids.join(", ")) }));
}

// ---------- Biblioteca e fluxo editorial ----------

export type NovoMaterial = Pick<
  Material,
  "tipo" | "titulo" | "descricao" | "palavrasChave" | "periodo" | "disciplina" | "assunto" | "permiteDownload" | "declaracao"
> & { conteudo: string; referencias: string; arquivoNome?: string };

export function enviarMaterial(novo: NovoMaterial) {
  const id = novoId();
  gravar((e) => {
    const autor = e.sessao?.nome ?? "anônimo";
    const em = agoraIso();
    const { conteudo, referencias, arquivoNome, ...dados } = novo;
    const material: Material = {
      ...dados,
      id,
      autor,
      status: "triagem",
      versoes: [{ numero: 1, conteudo, referencias, arquivoNome, notas: "Primeiro envio", em }],
      eventos: [{ para: "triagem", ator: autor, papel: e.sessao?.papel ?? "estudante", em }],
      atualizadoEm: em,
    };
    return {
      ...e,
      materiais: [...(e.materiais ?? []), material],
      auditoria: auditar(e, "enviou material", material.titulo),
    };
  });
  return id;
}

type ColecaoEditorial = "materiais" | "videos";
type ItemEditorial = Material | Video;

/** Aplica uma ação editorial (materiais ou vídeos), respeitando o fluxo e o papel. Retorna mensagem de erro, se houver. */
function moverItem(colecao: ColecaoEditorial, id: string, acao: AcaoFluxo, comentario?: string): string | null {
  const e = ler();
  const item = (e[colecao] as ItemEditorial[] | undefined)?.find((m) => m.id === id);
  if (!item) return "Item não encontrado.";
  const t = transicao(item.status, acao);
  if (!t) return "Ação não permitida neste status.";
  if (!temNivel(e.sessao?.papel, t.minimo)) return "Seu papel não permite esta ação.";
  if (t.exigeComentario && !comentario?.trim()) return "Informe a justificativa.";
  gravar((est) => {
    const lista = ((est[colecao] ?? []) as ItemEditorial[]).map((m) =>
      m.id !== id
        ? m
        : {
            ...m,
            status: t.para,
            atualizadoEm: agoraIso(),
            eventos: [
              ...m.eventos,
              { de: m.status, para: t.para, ator: est.sessao?.nome ?? "?", papel: est.sessao!.papel, comentario, em: agoraIso() },
            ],
          },
    );
    return {
      ...est,
      [colecao]: lista,
      auditoria: auditar(est, `${t.rotulo.toLowerCase()} (${colecao === "videos" ? "vídeo" : "material"})`, item.titulo, comentario),
    } as Estado;
  });
  return null;
}

export function moverMaterial(id: string, acao: AcaoFluxo, comentario?: string) {
  return moverItem("materiais", id, acao, comentario);
}

export function moverVideo(id: string, acao: AcaoFluxo, comentario?: string) {
  return moverItem("videos", id, acao, comentario);
}

// ---------- Resumos colaborativos ----------

/** Outro estudante propõe uma melhoria a um material publicado. Entra na triagem; o texto publicado não muda até a publicação. */
export function proporContribuicao(
  materialId: string,
  dados: { conteudo: string; referencias: string; notas: string; declaracao: Material["declaracao"] },
): string | null {
  const e = ler();
  const material = e.materiais?.find((m) => m.id === materialId);
  if (!material) return "Material não encontrado.";
  const erro = validarProposta(material, dados.conteudo, dados.notas, e.sessao?.nome);
  if (erro) return erro;
  gravar((est) => {
    const em = agoraIso();
    const autor = est.sessao!.nome;
    const contribuicao: Contribuicao = {
      ...dados,
      notas: dados.notas.trim(),
      id: novoId(),
      autor,
      papel: est.sessao!.papel,
      baseVersao: versaoAtual(material).numero,
      status: "triagem",
      eventos: [{ para: "triagem", ator: autor, papel: est.sessao!.papel, comentario: dados.notas.trim(), em }],
      em,
    };
    return {
      ...est,
      materiais: (est.materiais ?? []).map((m) => (m.id === materialId ? { ...m, contribuicoes: [...(m.contribuicoes ?? []), contribuicao] } : m)),
      auditoria: auditar(est, "sugeriu melhoria", material.titulo, dados.notas.trim()),
    };
  });
  return null;
}

export function moverContribuicao(materialId: string, contribId: string, acao: AcaoFluxo, comentario?: string): string | null {
  const e = ler();
  const material = e.materiais?.find((m) => m.id === materialId);
  const c = material?.contribuicoes?.find((x) => x.id === contribId);
  if (!material || !c) return "Contribuição não encontrada.";
  const t = transicao(c.status, acao);
  if (!t || acao === "reenviar") return "Ação não permitida neste status.";
  if (!temNivel(e.sessao?.papel, t.minimo)) return "Seu papel não permite esta ação.";
  if (t.exigeComentario && !comentario?.trim()) return "Informe a justificativa.";
  gravar((est) => {
    const evento = { de: c.status, para: t.para, ator: est.sessao!.nome, papel: est.sessao!.papel, comentario, em: agoraIso() };
    return {
      ...est,
      materiais: (est.materiais ?? []).map((m) => (m.id === materialId ? aplicarMovimentoContribuicao(m, contribId, t.para, evento) : m)),
      auditoria: auditar(est, `${t.rotulo.toLowerCase()} (contribuição de ${c.autor})`, material.titulo, comentario),
    };
  });
  return null;
}

export type NovoVideo =Pick<Video, "youtubeId" | "titulo" | "canal" | "descricao" | "palavrasChave" | "periodo" | "disciplina" | "assunto" | "declaracao">;

/** Sugestão de vídeo: entra na triagem editorial, como qualquer material. */
export function sugerirVideo(novo: NovoVideo) {
  const id = novoId();
  gravar((e) => {
    const autor = e.sessao?.nome ?? "anônimo";
    const em = agoraIso();
    const video: Video = {
      ...novo,
      id,
      sugeridoPor: autor,
      status: "triagem",
      eventos: [{ para: "triagem", ator: autor, papel: e.sessao?.papel ?? "estudante", em }],
      atualizadoEm: em,
    };
    return { ...e, videos: [...(e.videos ?? []), video], auditoria: auditar(e, "sugeriu vídeo", video.titulo) };
  });
  return id;
}

/** O autor envia a versão corrigida de um material devolvido. */
export function reenviarMaterial(id: string, conteudo: string, notas: string): string | null {
  const e = ler();
  const material = e.materiais?.find((m) => m.id === id);
  if (!material) return "Material não encontrado.";
  if (material.status !== "devolvido") return "Só materiais devolvidos podem ser reenviados.";
  if (material.autor !== e.sessao?.nome) return "Só o autor pode reenviar.";
  gravar((est) => ({
    ...est,
    materiais: (est.materiais ?? []).map((m) => {
      if (m.id !== id) return m;
      const anterior = m.versoes[m.versoes.length - 1];
      const em = agoraIso();
      return {
        ...m,
        status: "triagem",
        atualizadoEm: em,
        versoes: [...m.versoes, { ...anterior, numero: anterior.numero + 1, conteudo, notas, em }],
        eventos: [...m.eventos, { de: "devolvido", para: "triagem", ator: m.autor, papel: est.sessao!.papel, comentario: notas, em }],
      };
    }),
    auditoria: auditar(est, "reenviou versão corrigida", material.titulo),
  }));
  return null;
}

// ---------- Jornal ----------

function slugificar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function salvarPost(dados: Pick<Post, "titulo" | "resumo" | "corpo" | "categoria">, id?: string): string {
  const postId = id ?? novoId();
  gravar((e) => {
    const posts = e.posts ?? [];
    const existente = posts.find((p) => p.id === postId);
    const em = agoraIso();
    const post: Post = existente
      ? { ...existente, ...dados, atualizadoEm: em }
      : { ...dados, id: postId, slug: `${slugificar(dados.titulo)}-${postId.slice(-4)}`, autor: e.sessao?.nome ?? "?", status: "rascunho", atualizadoEm: em };
    return {
      ...e,
      posts: existente ? posts.map((p) => (p.id === postId ? post : p)) : [...posts, post],
      auditoria: auditar(e, existente ? "editou post" : "criou post", post.titulo),
    };
  });
  return postId;
}

export function mudarStatusPost(id: string, status: Post["status"]) {
  gravar((e) => {
    const post = e.posts?.find((p) => p.id === id);
    if (!post) return e;
    return {
      ...e,
      posts: (e.posts ?? []).map((p) =>
        p.id === id ? { ...p, status, publicadoEm: status === "publicado" ? (p.publicadoEm ?? agoraIso()) : p.publicadoEm, atualizadoEm: agoraIso() } : p,
      ),
      auditoria: auditar(e, `mudou post para ${status}`, post.titulo),
    };
  });
}
