import { describe, expect, it } from "vitest";
import { proximoEstadoRevisao, situacaoRevisao } from "./revisao";

const DIA = 24 * 60 * 60 * 1000;
const agora = new Date("2026-10-29T12:00:00Z");

describe("proximoEstadoRevisao", () => {
  it("errou: volta agora e zera a sequência", () => {
    const anterior = { acertosSeguidos: 3, intervaloDias: 8, proxima: agora.toISOString() };
    expect(proximoEstadoRevisao(anterior, false, 3, agora)).toEqual({
      acertosSeguidos: 0,
      intervaloDias: 0,
      proxima: agora.toISOString(),
    });
  });

  it.each([
    [1, 1],
    [2, 2],
    [3, 4],
  ] as const)("primeiro acerto com confiança %i agenda para %i dia(s)", (confianca, dias) => {
    const r = proximoEstadoRevisao(undefined, true, confianca, agora);
    expect(r.acertosSeguidos).toBe(1);
    expect(r.intervaloDias).toBe(dias);
    expect(new Date(r.proxima).getTime() - agora.getTime()).toBe(dias * DIA);
  });

  it("acertos seguidos dobram o intervalo", () => {
    const r1 = proximoEstadoRevisao(undefined, true, 3, agora);
    const r2 = proximoEstadoRevisao(r1, true, 3, agora);
    const r3 = proximoEstadoRevisao(r2, true, 3, agora);
    expect([r1.intervaloDias, r2.intervaloDias, r3.intervaloDias]).toEqual([4, 8, 16]);
    expect(r3.acertosSeguidos).toBe(3);
  });

  it("comportamento atual (achado R1): acerto com 'Chutei' após sequência também dobra", () => {
    const r1 = proximoEstadoRevisao(undefined, true, 3, agora);
    expect(proximoEstadoRevisao(r1, true, 1, agora).intervaloDias).toBe(8);
  });

  it("acerto após erro recomeça pelo intervalo base", () => {
    const erro = proximoEstadoRevisao(undefined, false, 2, agora);
    expect(proximoEstadoRevisao(erro, true, 2, agora).intervaloDias).toBe(2);
  });
});

describe("situacaoRevisao", () => {
  const com = (deslocamentoMs: number) => ({
    acertosSeguidos: 1,
    intervaloDias: 1,
    proxima: new Date(agora.getTime() + deslocamentoMs).toISOString(),
  });

  it("antes do prazo: aprendida", () => expect(situacaoRevisao(com(1000), agora)).toBe("aprendida"));
  it("no prazo e até 24 h: hoje", () => {
    expect(situacaoRevisao(com(0), agora)).toBe("hoje");
    expect(situacaoRevisao(com(-23 * 60 * 60 * 1000), agora)).toBe("hoje");
  });
  it("de 1 a 7 dias: atrasada", () => expect(situacaoRevisao(com(-3 * DIA), agora)).toBe("atrasada"));
  it("7 dias ou mais: muito atrasada", () => expect(situacaoRevisao(com(-7 * DIA), agora)).toBe("muito-atrasada"));
});
