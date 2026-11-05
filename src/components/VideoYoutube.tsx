import { urlIncorporacao, urlMiniatura } from "@/lib/videos";

/** Player incorporado (16:9). O vídeo continua hospedado no YouTube. */
export function PlayerYoutube({ youtubeId, titulo }: { youtubeId: string; titulo: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe
        src={urlIncorporacao(youtubeId)}
        title={titulo}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

export function MiniaturaYoutube({ youtubeId, titulo }: { youtubeId: string; titulo: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-neutral-200">
      {/* Miniatura servida pelo próprio YouTube; next/image exigiria liberar o domínio no next.config. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={urlMiniatura(youtubeId)} alt={`Miniatura: ${titulo}`} loading="lazy" className="h-full w-full object-cover" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-xl text-white">▶</span>
      </span>
    </div>
  );
}
