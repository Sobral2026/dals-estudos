import { describe, expect, it } from "vitest";
import { contarMudancas, diffLinhas } from "./diff";

describe("diffLinhas", () => {
  it("textos iguais: tudo igual", () => {
    expect(diffLinhas("a\nb", "a\nb").every((l) => l.tipo === "igual")).toBe(true);
  });

  it("detecta linha alterada, adicionada e removida", () => {
    const d = diffLinhas("título\nlinha velha\nfim", "título\nlinha nova\nfim\nextra");
    expect(d).toEqual([
      { tipo: "igual", texto: "título" },
      { tipo: "removida", texto: "linha velha" },
      { tipo: "adicionada", texto: "linha nova" },
      { tipo: "igual", texto: "fim" },
      { tipo: "adicionada", texto: "extra" },
    ]);
    expect(contarMudancas(d)).toEqual({ adicionadas: 2, removidas: 1 });
  });

  it("reconstrói os dois textos a partir do diff", () => {
    const antes = "1\n2\n3\n4";
    const depois = "1\n3\n4\n5";
    const d = diffLinhas(antes, depois);
    expect(d.filter((l) => l.tipo !== "adicionada").map((l) => l.texto).join("\n")).toBe(antes);
    expect(d.filter((l) => l.tipo !== "removida").map((l) => l.texto).join("\n")).toBe(depois);
  });
});
