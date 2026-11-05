import { describe, expect, it } from "vitest";
import { QUESTOES } from "@/data/questoes";
import { separarParaPdf } from "./exportacao";

describe("separarParaPdf", () => {
  it("nunca inclui questão sem autorização de reprodução", () => {
    const { incluidas, omitidas } = separarParaPdf(QUESTOES.map((q) => q.id));
    expect(incluidas.every((q) => q.permiteDownload)).toBe(true);
    expect(omitidas).toEqual(QUESTOES.filter((q) => !q.permiteDownload).map((q) => q.id));
    expect(omitidas.length).toBeGreaterThan(0);
  });

  it("ignora códigos inexistentes e mantém a ordem pedida", () => {
    const { incluidas } = separarParaPdf(["q03", "xx", "q01"]);
    expect(incluidas.map((q) => q.id)).toEqual(["q03", "q01"]);
  });
});
