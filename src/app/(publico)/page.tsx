"use client";

import Link from "next/link";
import { dataCurta, postsPublicados, rotuloCategoria } from "@/lib/jornal";
import { useEstado } from "@/lib/store";

export default function CapaJornal() {
  const { posts } = useEstado();
  const publicados = postsPublicados(posts);
  const [destaque, ...demais] = publicados;

  return (
    <div>
      <section className="bg-dals-800 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr] md:py-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-dals-200">Jornal DALS</p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-wide sm:text-5xl">
              Notícias, entrevistas e projetos da Medicina FMC
            </h1>
            <p className="mt-3 max-w-xl text-dals-100/90">
              Conteúdo aberto a todos, publicado pelo Diretório Acadêmico Luiz Sobral.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-6">
            <h2 className="font-display text-2xl tracking-wide">DALS Estudos</h2>
            <p className="mt-2 text-sm text-dals-100/90">
              Banco de questões, simulados, revisão espaçada e biblioteca colaborativa, gratuitos e exclusivos para estudantes da FMC.
            </p>
            <Link
              href="/entrar"
              className="mt-4 inline-flex rounded-lg bg-white px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-dals-800 hover:bg-dals-100"
            >
              Acessar área de estudos
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {!destaque ? (
          <p className="text-neutral-500">Nenhuma matéria publicada ainda.</p>
        ) : (
          <>
            <Link href={`/jornal/${destaque.slug}`} className="group block rounded-2xl border border-neutral-200 p-6 hover:border-dals-600">
              <span className="text-xs font-bold uppercase tracking-wider text-dals-600">
                {rotuloCategoria(destaque.categoria)} · {dataCurta(destaque.publicadoEm)}
              </span>
              <h2 className="mt-2 font-display text-3xl tracking-wide text-dals-800 group-hover:underline">{destaque.titulo}</h2>
              <p className="mt-2 text-neutral-600">{destaque.resumo}</p>
            </Link>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {demais.map((p) => (
                <Link key={p.id} href={`/jornal/${p.slug}`} className="group rounded-2xl border border-neutral-200 p-5 hover:border-dals-600">
                  <span className="text-xs font-bold uppercase tracking-wider text-dals-600">
                    {rotuloCategoria(p.categoria)} · {dataCurta(p.publicadoEm)}
                  </span>
                  <h3 className="mt-1 font-display text-xl tracking-wide text-dals-800 group-hover:underline">{p.titulo}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{p.resumo}</p>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/jornal" className="font-bold text-dals-700 hover:underline">
                Ver todas as matérias →
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
