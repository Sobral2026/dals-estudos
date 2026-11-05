"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Carregando } from "@/components/ui";
import { dataCurta, paragrafos, rotuloCategoria } from "@/lib/jornal";
import { useEstado, useMontado } from "@/lib/store";

export default function MateriaJornal() {
  const { slug } = useParams<{ slug: string }>();
  const { posts } = useEstado();
  const montado = useMontado();
  // Rascunhos e matérias arquivadas não ficam acessíveis no ambiente público.
  const post = posts?.find((p) => p.slug === slug && p.status === "publicado");

  if (!post && !montado) return <Carregando />;
  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="mb-4">Matéria não encontrada.</p>
        <Link href="/jornal" className="font-bold text-dals-700 hover:underline">
          Voltar às notícias
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/jornal" className="text-sm font-semibold text-dals-600 hover:underline">
        ← Notícias
      </Link>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-dals-600">
        {rotuloCategoria(post.categoria)} · {dataCurta(post.publicadoEm)}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-wide text-dals-800">{post.titulo}</h1>
      <p className="mt-3 text-lg text-neutral-600">{post.resumo}</p>
      <p className="mt-2 text-sm text-neutral-500">Por {post.autor}</p>
      <div className="mt-6 space-y-4 border-t border-neutral-200 pt-6 text-[17px] leading-relaxed text-neutral-800">
        {paragrafos(post.corpo).map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
