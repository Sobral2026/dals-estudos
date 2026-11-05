import type { Confianca, EstadoRevisao } from "./types";

const DIA = 24 * 60 * 60 * 1000;

/** Intervalo inicial (dias) após um acerto, conforme a confiança declarada. */
const INTERVALO_BASE: Record<Confianca, number> = { 1: 1, 2: 2, 3: 4 };

export type SituacaoRevisao = "aprendida" | "hoje" | "atrasada" | "muito-atrasada";

/**
 * Errou: volta hoje e zera a sequência.
 * Acertou: intervalo base pela confiança; acertos seguidos dobram o intervalo anterior.
 */
export function proximoEstadoRevisao(
  anterior: EstadoRevisao | undefined,
  acertou: boolean,
  confianca: Confianca,
  agora: Date,
): EstadoRevisao {
  if (!acertou) {
    return { acertosSeguidos: 0, intervaloDias: 0, proxima: agora.toISOString() };
  }
  const base = INTERVALO_BASE[confianca];
  const intervaloDias =
    anterior && anterior.acertosSeguidos > 0 ? Math.max(base, anterior.intervaloDias * 2) : base;
  return {
    acertosSeguidos: (anterior?.acertosSeguidos ?? 0) + 1,
    intervaloDias,
    proxima: new Date(agora.getTime() + intervaloDias * DIA).toISOString(),
  };
}

export function situacaoRevisao(estado: EstadoRevisao, agora: Date): SituacaoRevisao {
  const atraso = (agora.getTime() - new Date(estado.proxima).getTime()) / DIA;
  if (atraso < 0) return "aprendida";
  if (atraso < 1) return "hoje";
  if (atraso < 7) return "atrasada";
  return "muito-atrasada";
}
