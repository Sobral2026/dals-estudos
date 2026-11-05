import type { Video } from "./types";

const ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;
const HOSTS_YOUTUBE = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtube-nocookie.com", "youtube-nocookie.com"]);

/**
 * Extrai o ID de 11 caracteres de um link do YouTube.
 * Aceita: youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID e /live/ID.
 * Qualquer outro domínio é recusado.
 */
export function extrairIdYoutube(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(url.protocol) || !HOSTS_YOUTUBE.has(url.hostname)) return null;

  let id: string | null = null;
  if (url.hostname === "youtu.be") id = url.pathname.slice(1).split("/")[0];
  else if (url.pathname === "/watch") id = url.searchParams.get("v");
  else {
    const [, tipo, valor] = url.pathname.split("/");
    if (["embed", "shorts", "live"].includes(tipo)) id = valor;
  }
  return id && ID_YOUTUBE.test(id) ? id : null;
}

/** Incorporação em modo de privacidade aprimorada (não grava cookies de rastreamento antes do play). */
export function urlIncorporacao(youtubeId: string) {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`;
}

export function urlMiniatura(youtubeId: string) {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function urlYoutube(youtubeId: string) {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

function normalizar(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function buscarVideos(videos: Video[], termo: string) {
  const t = normalizar(termo.trim());
  if (!t) return videos;
  return videos.filter((v) => normalizar([v.titulo, v.canal, v.descricao, v.palavrasChave.join(" ")].join(" ")).includes(t));
}

/** Vídeos publicados do mesmo assunto/subassunto; se não houver, da mesma disciplina. */
export function videosRelacionados(videos: Video[], disciplina: string, assuntos: (string | undefined)[]) {
  const publicados = videos.filter((v) => v.status === "publicado");
  const doAssunto = publicados.filter((v) => v.assunto && assuntos.includes(v.assunto));
  return doAssunto.length > 0 ? doAssunto : publicados.filter((v) => v.disciplina === disciplina);
}
