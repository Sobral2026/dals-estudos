"use client";

/**
 * Armazenamento do protótipo: tudo fica no localStorage do navegador de cada aluno.
 * No site definitivo, estas funções viram chamadas ao banco de dados (ex.: Supabase),
 * mantendo a mesma interface para as telas.
 */

import { useSyncExternalStore } from "react";
import { questaoPorId } from "@/data/questoes";
import { proximoEstadoRevisao } from "./revisao";
import type {
  Confianca,
  EstadoRevisao,
  Letra,
  ModoSimulado,
  RegistroResposta,
  Reporte,
  Simulado,
} from "./types";

const CHAVE = "dals-questoes:v1";

export interface Estado {
  historico: RegistroResposta[];
  revisao: Record<string, EstadoRevisao>;
  simulados: Record<string, Simulado>;
  reportes: Reporte[];
}

const VAZIO: Estado = { historico: [], revisao: {}, simulados: {}, reportes: [] };

let cache: Estado | null = null;
const ouvintes = new Set<() => void>();

function ler(): Estado {
  if (cache) return cache;
  try {
    const bruto = localStorage.getItem(CHAVE);
    cache = bruto ? { ...VAZIO, ...JSON.parse(bruto) } : VAZIO;
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
    // Sem armazenamento (aba anônima bloqueada etc.): segue só em memória.
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

function novoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
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
    inicio: new Date().toISOString(),
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
export function responderNoSimulado(
  id: string,
  questaoId: string,
  letra: Letra,
  confianca: Confianca,
) {
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
  atualizarSimulado(id, (s) => ({ ...s, finalizado: true, fim: new Date().toISOString() }));
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
    reportes: [...e.reportes, { questaoId, motivo, detalhe, em: new Date().toISOString() }],
  }));
}

export function limparProgresso() {
  gravar(() => VAZIO);
}
