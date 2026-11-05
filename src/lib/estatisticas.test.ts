import { describe, expect, it } from "vitest";
import { QUESTOES } from "@/data/questoes";
import { embaralhar, resumirQuestoes, resumoRevisao, resultadoSimulado, ultimaRespostaPorQuestao } from "./estatisticas";
import type { RegistroResposta, Simulado } from "./types";

const resp = (questaoId: string, acertou: boolean, em: string): RegistroResposta => ({
  questaoId,
  letra: "A",
  acertou,
  confianca: 2,
  em,
});

describe("ultimaRespostaPorQuestao", () => {
  it("guarda a última tentativa de cada questão", () => {
    const m = ultimaRespostaPorQuestao([resp("q01", false, "1"), resp("q01", true, "2"), resp("q02", false, "3")]);
    expect(m.get("q01")?.acertou).toBe(true);
    expect(m.size).toBe(2);
  });
});

describe("resumirQuestoes", () => {
  it("calcula conclusão e nota sobre as respondidas", () => {
    const qs = QUESTOES.slice(0, 4);
    const ultimas = ultimaRespostaPorQuestao([resp(qs[0].id, true, "1"), resp(qs[1].id, false, "2")]);
    const r = resumirQuestoes(qs, ultimas);
    expect(r).toMatchObject({ total: 4, respondidas: 2, acertos: 1, nota: 50, conclusao: 50 });
  });

  it("sem respostas: nota e conclusão zeradas", () => {
    expect(resumirQuestoes(QUESTOES, new Map())).toMatchObject({ respondidas: 0, nota: 0, conclusao: 0 });
  });
});

describe("resumoRevisao", () => {
  it("conta pendentes e o histograma de domínio", () => {
    const agora = new Date("2026-10-29T12:00:00Z");
    const r = resumoRevisao(
      {
        historico: [],
        simulados: {},
        reportes: [],
        revisao: {
          a: { acertosSeguidos: 0, intervaloDias: 0, proxima: agora.toISOString() },
          b: { acertosSeguidos: 2, intervaloDias: 4, proxima: "2026-11-30T00:00:00Z" },
          c: { acertosSeguidos: 7, intervaloDias: 30, proxima: "2026-10-01T00:00:00Z" },
        },
      },
      agora,
    );
    expect(r.hoje).toBe(1);
    expect(r["muito-atrasada"]).toBe(1);
    expect(r.pendentes.sort()).toEqual(["a", "c"]);
    expect(r.maestria).toEqual([1, 0, 1, 0, 0, 1]);
  });
});

describe("resultadoSimulado", () => {
  it("corrige pelo gabarito", () => {
    const [q1, q2] = QUESTOES;
    const s: Simulado = {
      id: "s",
      titulo: "t",
      modo: "prova",
      questoes: [q1.id, q2.id],
      respostas: { [q1.id]: { letra: q1.correta, confianca: 3 } },
      atual: 0,
      finalizado: true,
      inicio: "",
    };
    const r = resultadoSimulado(s);
    expect(r).toMatchObject({ acertos: 1, respondidas: 1, nota: 50 });
  });
});

describe("embaralhar", () => {
  it("mantém os mesmos elementos sem alterar a lista original", () => {
    const lista = [1, 2, 3, 4, 5];
    const r = embaralhar(lista);
    expect([...r].sort()).toEqual(lista);
    expect(lista).toEqual([1, 2, 3, 4, 5]);
  });
});
