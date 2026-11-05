import type { Material, StatusEditorial, TipoMaterial } from "./types";

export const TIPOS_MATERIAL: { id: TipoMaterial; rotulo: string }[] = [
  { id: "resumo", rotulo: "Resumo" },
  { id: "mapa_mental", rotulo: "Mapa mental" },
  { id: "questao_autoral", rotulo: "Questão autoral" },
  { id: "roteiro_revisao", rotulo: "Roteiro de revisão" },
];

export function rotuloTipo(t: TipoMaterial) {
  return TIPOS_MATERIAL.find((x) => x.id === t)?.rotulo ?? t;
}

export const TOM_STATUS: Record<StatusEditorial, "ok" | "alerta" | "erro" | "info" | "neutro"> = {
  triagem: "info",
  revisao_academica: "info",
  aprovado: "alerta",
  publicado: "ok",
  devolvido: "erro",
  retirado: "neutro",
};

/** Formatos aceitos e tamanho máximo do anexo (no protótipo só o nome do arquivo é guardado). */
export const ANEXO_TIPOS = ["application/pdf", "image/png", "image/jpeg"];
export const ANEXO_MAX_BYTES = 20 * 1024 * 1024;

export function validarAnexo(arquivo: { type: string; size: number }): string | null {
  if (!ANEXO_TIPOS.includes(arquivo.type)) return "Formato não aceito. Envie PDF, PNG ou JPG.";
  if (arquivo.size > ANEXO_MAX_BYTES) return "Arquivo maior que 20 MB.";
  return null;
}

function normalizar(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Busca por palavra-chave no título, descrição, palavras-chave e conteúdo da versão atual. */
export function buscarMateriais(materiais: Material[], termo: string) {
  const t = normalizar(termo.trim());
  if (!t) return materiais;
  return materiais.filter((m) =>
    normalizar([m.titulo, m.descricao, m.palavrasChave.join(" "), m.versoes.at(-1)?.conteudo ?? ""].join(" ")).includes(t),
  );
}

export function versaoAtual(m: Material) {
  return m.versoes[m.versoes.length - 1];
}
