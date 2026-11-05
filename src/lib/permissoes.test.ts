import { describe, expect, it } from "vitest";
import { acoesDisponiveis, podeAcessarPainel, transicao } from "./permissoes";

describe("fluxo editorial", () => {
  it("segue Envio → Triagem → Revisão acadêmica → Aprovação → Publicação", () => {
    expect(transicao("triagem", "encaminhar")?.para).toBe("revisao_academica");
    expect(transicao("revisao_academica", "aprovar")?.para).toBe("aprovado");
    expect(transicao("aprovado", "publicar")?.para).toBe("publicado");
  });

  it("não permite publicar direto da triagem nem da revisão", () => {
    expect(transicao("triagem", "publicar")).toBeUndefined();
    expect(transicao("revisao_academica", "publicar")).toBeUndefined();
  });

  it("devolução e retirada exigem justificativa", () => {
    expect(transicao("triagem", "devolver")?.exigeComentario).toBe(true);
    expect(transicao("publicado", "retirar")?.exigeComentario).toBe(true);
  });

  it("estudante e colaborador não têm ações editoriais", () => {
    for (const s of ["triagem", "revisao_academica", "aprovado", "publicado"] as const) {
      expect(acoesDisponiveis(s, "estudante")).toEqual([]);
      expect(acoesDisponiveis(s, "colaborador")).toEqual([]);
    }
  });

  it("revisor aprova ou devolve, mas não faz triagem nem publica", () => {
    expect(acoesDisponiveis("triagem", "revisor")).toEqual([]);
    expect(acoesDisponiveis("revisao_academica", "revisor").map((a) => a.acao)).toEqual(["aprovar", "devolver"]);
    expect(acoesDisponiveis("aprovado", "revisor")).toEqual([]);
  });

  it("editor publica e retira", () => {
    expect(acoesDisponiveis("aprovado", "editor").map((a) => a.acao)).toEqual(["publicar"]);
    expect(acoesDisponiveis("publicado", "editor").map((a) => a.acao)).toEqual(["retirar"]);
  });
});

describe("acesso ao painel", () => {
  it("só revisor ou acima", () => {
    expect(podeAcessarPainel("estudante")).toBe(false);
    expect(podeAcessarPainel("colaborador")).toBe(false);
    expect(podeAcessarPainel("revisor")).toBe(true);
    expect(podeAcessarPainel(undefined)).toBe(false);
  });
});
