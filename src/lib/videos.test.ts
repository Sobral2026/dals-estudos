import { describe, expect, it } from "vitest";
import type { Video } from "./types";
import { extrairIdYoutube, urlIncorporacao, videosRelacionados } from "./videos";

const ID = "abcDEF12_-3";

describe("extrairIdYoutube", () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&t=42s`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=xyz`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/live/${ID}`,
    `  https://youtu.be/${ID}  `,
  ])("aceita %s", (link) => expect(extrairIdYoutube(link)).toBe(ID));

  it.each([
    "",
    "não é link",
    `https://vimeo.com/${ID}`,
    `https://youtube.com.golpe.com/watch?v=${ID}`,
    `javascript:alert(1)//youtu.be/${ID}`,
    "https://www.youtube.com/watch?v=curto",
    "https://www.youtube.com/channel/UCxxxxxxxxxxxx",
  ])("recusa %s", (link) => expect(extrairIdYoutube(link)).toBeNull());
});

describe("urlIncorporacao", () => {
  it("usa o domínio de privacidade aprimorada", () => {
    expect(urlIncorporacao(ID)).toBe(`https://www.youtube-nocookie.com/embed/${ID}?rel=0`);
  });
});

describe("videosRelacionados", () => {
  const v = (id: string, status: Video["status"], disciplina: string, assunto?: string) =>
    ({ id, status, disciplina, assunto }) as Video;
  const lista = [v("a", "publicado", "anatomia", "anat-ms"), v("b", "publicado", "anatomia"), v("c", "triagem", "anatomia", "anat-ms")];

  it("prioriza o mesmo assunto e ignora não publicados", () => {
    expect(videosRelacionados(lista, "anatomia", ["anat-ms"]).map((x) => x.id)).toEqual(["a"]);
  });
  it("sem vídeo do assunto, usa a disciplina", () => {
    expect(videosRelacionados(lista, "anatomia", ["outro"]).map((x) => x.id)).toEqual(["a", "b"]);
  });
});
