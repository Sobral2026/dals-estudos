import { describe, expect, it } from "vitest";
import { MATERIAIS_INICIAIS } from "@/data/conteudo-inicial";
import { buscarMateriais, validarAnexo } from "./biblioteca";

describe("validarAnexo", () => {
  it("aceita PDF, PNG e JPG até 20 MB", () => {
    expect(validarAnexo({ type: "application/pdf", size: 1_000 })).toBeNull();
    expect(validarAnexo({ type: "image/jpeg", size: 20 * 1024 * 1024 })).toBeNull();
  });
  it("recusa outros formatos e arquivos grandes", () => {
    expect(validarAnexo({ type: "application/vnd.ms-powerpoint", size: 1_000 })).toMatch(/Formato/);
    expect(validarAnexo({ type: "text/html", size: 1_000 })).toMatch(/Formato/);
    expect(validarAnexo({ type: "application/pdf", size: 21 * 1024 * 1024 })).toMatch(/20 MB/);
  });
});

describe("buscarMateriais", () => {
  it("encontra por palavra-chave ignorando acentos e maiúsculas", () => {
    expect(buscarMateriais(MATERIAIS_INICIAIS, "ANTIDOTO").map((m) => m.id)).toEqual(["m-exemplo-2"]);
  });
  it("termo vazio devolve tudo", () => {
    expect(buscarMateriais(MATERIAIS_INICIAIS, "  ")).toHaveLength(MATERIAIS_INICIAIS.length);
  });
});
