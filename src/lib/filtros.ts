import type { Questao, RegistroResposta } from "./types";

export type FiltroStatus = "todas" | "nao-respondidas" | "erradas";
export type ModeloClassificacao = "fmc" | "enamed";

export interface FiltrosQuestoes {
  modelo: ModeloClassificacao;
  /** Modelo A: disciplinas selecionadas e, opcionalmente, um assunto (ou subassunto). */
  disciplinas: Set<string>;
  assunto: string;
  /** Modelo B: competências selecionadas e, opcionalmente, uma habilidade. */
  competencias: Set<string>;
  habilidade: string;
  dificuldades: Set<Questao["dificuldade"]>;
  status: FiltroStatus;
}

export function passaStatus(q: Questao, status: FiltroStatus, ultimas: Map<string, RegistroResposta>) {
  return (
    status === "todas" ||
    (status === "nao-respondidas" && !ultimas.has(q.id)) ||
    (status === "erradas" && ultimas.get(q.id)?.acertou === false)
  );
}

/** Aplica a classificação ativa (FMC ou ENAMED), a dificuldade e o status. A questão é a mesma nos dois modelos. */
export function filtrarQuestoes(questoes: Questao[], f: FiltrosQuestoes, ultimas: Map<string, RegistroResposta>) {
  return questoes.filter((q) => {
    const classificacao =
      f.modelo === "fmc"
        ? f.disciplinas.has(q.disciplina) && (!f.assunto || q.assunto === f.assunto || q.subassunto === f.assunto)
        : f.competencias.has(q.enamed.competencia) && (!f.habilidade || q.enamed.habilidade === f.habilidade);
    return classificacao && f.dificuldades.has(q.dificuldade) && passaStatus(q, f.status, ultimas);
  });
}
