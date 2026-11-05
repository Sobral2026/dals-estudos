import { describe, expect, it } from "vitest";
import { MATERIAIS_INICIAIS } from "@/data/conteudo-inicial";
import { aplicarMovimentoContribuicao, validarProposta } from "./colaboracao";
import type { Contribuicao, Material } from "./types";

const publicado = MATERIAIS_INICIAIS.find((m) => m.status === "publicado")!;
const emTriagem = MATERIAIS_INICIAIS.find((m) => m.status === "triagem")!;

const contrib = (extra: Partial<Contribuicao> = {}): Contribuicao => ({
  id: "c1",
  autor: "Bia",
  papel: "estudante",
  conteudo: "texto melhorado",
  referencias: "ref nova",
  notas: "corrigi a definição",
  baseVersao: 1,
  status: "aprovado",
  eventos: [],
  declaracao: { autoria: true, autorizaPublicacao: true, semConteudoProibido: true, em: "" },
  em: "",
  ...extra,
});

describe("validarProposta", () => {
  it("exige login, material publicado, justificativa e texto diferente", () => {
    expect(validarProposta(publicado, "novo", "nota", undefined)).toMatch(/Entre/);
    expect(validarProposta(emTriagem, "novo", "nota", "Bia")).toMatch(/publicados/);
    expect(validarProposta(publicado, "novo", "  ", "Bia")).toMatch(/Explique/);
    expect(validarProposta(publicado, publicado.versoes[0].conteudo, "nota", "Bia")).toMatch(/não mudou/);
    expect(validarProposta(publicado, "novo", "nota", "Bia")).toBeNull();
  });

  it("uma sugestão pendente por pessoa por material", () => {
    const m: Material = { ...publicado, contribuicoes: [contrib({ status: "triagem" })] };
    expect(validarProposta(m, "outro", "nota", "Bia")).toMatch(/já tem/);
    expect(validarProposta(m, "outro", "nota", "Caio")).toBeNull();
  });
});

describe("aplicarMovimentoContribuicao", () => {
  const evento = { de: "aprovado" as const, para: "publicado" as const, ator: "Editor", papel: "editor" as const, em: "2026-10-30T10:00:00.000Z" };

  it("ao publicar, cria nova versão e credita o coautor", () => {
    const m = aplicarMovimentoContribuicao({ ...publicado, contribuicoes: [contrib()] }, "c1", "publicado", evento);
    expect(m.versoes).toHaveLength(publicado.versoes.length + 1);
    expect(m.versoes.at(-1)).toMatchObject({ numero: 2, conteudo: "texto melhorado", autor: "Bia" });
    expect(m.colaboradores).toEqual(["Bia"]);
    expect(m.contribuicoes?.[0].status).toBe("publicado");
    expect(m.atualizadoEm).toBe(evento.em);
  });

  it("não duplica coautor nem credita o próprio autor", () => {
    const comBia = aplicarMovimentoContribuicao({ ...publicado, colaboradores: ["Bia"], contribuicoes: [contrib()] }, "c1", "publicado", evento);
    expect(comBia.colaboradores).toEqual(["Bia"]);
    const doAutor = aplicarMovimentoContribuicao({ ...publicado, contribuicoes: [contrib({ autor: publicado.autor })] }, "c1", "publicado", evento);
    expect(doAutor.colaboradores).toEqual([]);
  });

  it("devolver não altera o texto publicado", () => {
    const m = aplicarMovimentoContribuicao({ ...publicado, contribuicoes: [contrib({ status: "triagem" })] }, "c1", "devolvido", { ...evento, para: "devolvido" });
    expect(m.versoes).toEqual(publicado.versoes);
    expect(m.contribuicoes?.[0].status).toBe("devolvido");
  });
});
