import { DISCIPLINAS } from "@/data/disciplinas";
import { QUESTOES, questaoPorId } from "@/data/questoes";
import { COMPETENCIAS_ENAMED } from "@/data/taxonomia";
import { situacaoRevisao } from "./revisao";
import type { Estado } from "./store";
import type { Questao, RegistroResposta, Simulado } from "./types";

export function ultimaRespostaPorQuestao(historico: RegistroResposta[]) {
  const mapa = new Map<string, RegistroResposta>();
  for (const r of historico) mapa.set(r.questaoId, r);
  return mapa;
}

function media(valores: number[]) {
  return valores.length ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length) : 0;
}

export function resumirQuestoes(questoes: Questao[], ultimas: Map<string, RegistroResposta>) {
  const respondidas = questoes.filter((q) => ultimas.has(q.id));
  const acertos = respondidas.filter((q) => ultimas.get(q.id)?.acertou).length;
  return {
    total: questoes.length,
    respondidas: respondidas.length,
    acertos,
    nota: respondidas.length ? Math.round((acertos / respondidas.length) * 100) : 0,
    conclusao: questoes.length ? Math.round((respondidas.length / questoes.length) * 100) : 0,
    mediaTurma: media(questoes.map((q) => q.acertoTurma)),
  };
}

export function resumoGeral(estado: Estado) {
  return resumirQuestoes(QUESTOES, ultimaRespostaPorQuestao(estado.historico));
}

export function desempenhoPorDisciplina(estado: Estado) {
  const ultimas = ultimaRespostaPorQuestao(estado.historico);
  return DISCIPLINAS.map((d) => ({
    disciplina: d,
    ...resumirQuestoes(
      QUESTOES.filter((q) => q.disciplina === d.id),
      ultimas,
    ),
  }));
}

export function desempenhoPorCompetencia(estado: Estado) {
  const ultimas = ultimaRespostaPorQuestao(estado.historico);
  return COMPETENCIAS_ENAMED.map((c) => ({
    competencia: c,
    ...resumirQuestoes(
      QUESTOES.filter((q) => q.enamed.competencia === c.id),
      ultimas,
    ),
  }));
}

export function resumoRevisao(estado: Estado, agora: Date) {
  const contagem = { hoje: 0, atrasada: 0, "muito-atrasada": 0, aprendida: 0 };
  const pendentes: string[] = [];
  const maestria = [0, 0, 0, 0, 0, 0];
  for (const [questaoId, r] of Object.entries(estado.revisao)) {
    const situacao = situacaoRevisao(r, agora);
    contagem[situacao]++;
    if (situacao !== "aprendida") pendentes.push(questaoId);
    maestria[Math.min(r.acertosSeguidos, 5)]++;
  }
  return { ...contagem, pendentes, maestria, total: Object.keys(estado.revisao).length };
}

export function resultadoSimulado(simulado: Simulado) {
  const itens = simulado.questoes.map((id) => {
    const questao = questaoPorId(id)!;
    const resposta = simulado.respostas[id];
    return { questao, resposta, acertou: resposta?.letra === questao.correta };
  });
  const acertos = itens.filter((i) => i.acertou).length;
  return {
    itens,
    acertos,
    respondidas: itens.filter((i) => i.resposta).length,
    nota: itens.length ? Math.round((acertos / itens.length) * 100) : 0,
    mediaTurma: media(itens.map((i) => i.questao.acertoTurma)),
  };
}

export function embaralhar<T>(lista: T[]) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
