import { describe, expect, it } from "vitest";
import { migrar } from "./store";

describe("migrar (localStorage v1 → v2)", () => {
  it("preserva histórico, revisão e simulados existentes e acrescenta os campos novos", () => {
    const v1 = {
      historico: [{ questaoId: "q01", letra: "B" as const, acertou: true, confianca: 3 as const, em: "2026-10-29" }],
      revisao: { q01: { acertosSeguidos: 1, intervaloDias: 4, proxima: "2026-11-02" } },
      simulados: {},
      reportes: [],
    };
    const v2 = migrar(v1);
    expect(v2.historico).toEqual(v1.historico);
    expect(v2.revisao).toEqual(v1.revisao);
    expect(v2.versaoSchema).toBe(2);
    expect(v2.materiais?.length).toBeGreaterThan(0);
    expect(v2.posts?.length).toBeGreaterThan(0);
    expect(v2.sessao ?? null).toBeNull();
  });

  it("não sobrescreve biblioteca e jornal já existentes", () => {
    const v2 = migrar({ historico: [], revisao: {}, simulados: {}, reportes: [], materiais: [], posts: [] });
    expect(v2.materiais).toEqual([]);
    expect(v2.posts).toEqual([]);
  });
});
