import type { CategoriaPost, Post } from "./types";

export const CATEGORIAS: { id: CategoriaPost; rotulo: string }[] = [
  { id: "noticia", rotulo: "Notícia" },
  { id: "entrevista", rotulo: "Entrevista" },
  { id: "reportagem", rotulo: "Reportagem" },
  { id: "projeto", rotulo: "Projeto" },
  { id: "evento", rotulo: "Evento" },
  { id: "pesquisa", rotulo: "Pesquisa" },
  { id: "institucional", rotulo: "Institucional" },
];

export function rotuloCategoria(c: CategoriaPost) {
  return CATEGORIAS.find((x) => x.id === c)?.rotulo ?? c;
}

/** Só o que está publicado aparece no ambiente público, do mais recente ao mais antigo. */
export function postsPublicados(posts: Post[] = []) {
  return posts
    .filter((p) => p.status === "publicado")
    .sort((a, b) => (b.publicadoEm ?? "").localeCompare(a.publicadoEm ?? ""));
}

export function dataCurta(iso?: string) {
  return iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "";
}

/** O corpo é texto simples: cada bloco separado por linha em branco vira um parágrafo (sem HTML). */
export function paragrafos(corpo: string) {
  return corpo
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
