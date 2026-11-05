import { describe, expect, it } from "vitest";
import { DISCIPLINAS } from "@/data/disciplinas";
import { QUESTOES } from "@/data/questoes";
import { COMPETENCIAS_ENAMED } from "@/data/taxonomia";
import { filtrarQuestoes, type FiltrosQuestoes } from "./filtros";

const base: FiltrosQuestoes = {
  modelo: "fmc",
  disciplinas: new Set(DISCIPLINAS.map((d) => d.id)),
  assunto: "",
  competencias: new Set(COMPETENCIAS_ENAMED.map((c) => c.id)),
  habilidade: "",
  dificuldades: new Set(["facil", "media", "dificil"]),
  status: "todas",
};

describe("dupla classificação", () => {
  it("todas as questões aparecem nos dois modelos, sem duplicação", () => {
    const fmc = filtrarQuestoes(QUESTOES, base, new Map());
    const enamed = filtrarQuestoes(QUESTOES, { ...base, modelo: "enamed" }, new Map());
    expect(fmc.length).toBe(QUESTOES.length);
    expect(enamed.map((q) => q.id).sort()).toEqual(fmc.map((q) => q.id).sort());
    expect(new Set(QUESTOES.map((q) => q.id)).size).toBe(QUESTOES.length);
  });

  it("toda questão tem disciplina, assunto, área e competência válidos", () => {
    for (const q of QUESTOES) {
      expect(DISCIPLINAS.some((d) => d.id === q.disciplina)).toBe(true);
      expect(q.assunto).toBeTruthy();
      expect(COMPETENCIAS_ENAMED.find((c) => c.id === q.enamed.competencia)?.area).toBe(q.enamed.area);
    }
  });

  it("filtra por subassunto (Modelo A)", () => {
    const r = filtrarQuestoes(QUESTOES, { ...base, assunto: "anat-ms-plexo" }, new Map());
    expect(r.map((q) => q.id)).toEqual(["q01"]);
  });

  it("filtra por competência (Modelo B)", () => {
    const r = filtrarQuestoes(QUESTOES, { ...base, modelo: "enamed", competencias: new Set(["comp-urgencia"]) }, new Map());
    expect(r.every((q) => q.enamed.competencia === "comp-urgencia")).toBe(true);
    expect(r.length).toBeGreaterThan(0);
  });

  it("filtra erradas pelo histórico", () => {
    const ultimas = new Map([["q02", { questaoId: "q02", letra: "A" as const, acertou: false, confianca: 1 as const, em: "" }]]);
    expect(filtrarQuestoes(QUESTOES, { ...base, status: "erradas" }, ultimas).map((q) => q.id)).toEqual(["q02"]);
  });
});
