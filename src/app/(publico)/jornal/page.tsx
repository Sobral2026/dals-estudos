"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIAS, dataCurta, postsPublicados, rotuloCategoria } from "@/lib/jornal";
import { useEstado } from "@/lib/store";
import type { CategoriaPost } from "@/lib/types";

export default function ListaJornal() {
  const { posts } = useEstado();
  const [categoria, setCategoria] = useState<CategoriaPost | "todas">("todas");
  const publicados = postsPublicados(posts).filter((p) => categoria === "todas" || p.categoria === categoria);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-wide text-dals-800">Notícias</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {[{ id: "todas" as const, rotulo: "Todas" }, ...CATEGORIAS].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategoria(c.id)}
            className={`rounded-full border px-3 py-1 text-sm font-semibold ${
              categoria === c.id ? "border-dals-700 bg-dals-700 text-white" : "border-neutral-300 hover:border-dals-600"
            }`}
          >
            {c.rotulo}
          </button>
        ))}
      </div>

      <div className="mt-6 divide-y divide-neutral-200">
        {publicados.length === 0 && <p className="py-6 text-neutral-500">Nenhuma matéria nesta categoria.</p>}
        {publicados.map((p) => (
          <Link key={p.id} href={`/jornal/${p.slug}`} className="group block py-5">
            <span className="text-xs font-bold uppercase tracking-wider text-dals-600">
              {rotuloCategoria(p.categoria)} · {dataCurta(p.publicadoEm)}
            </span>
            <h2 className="mt-1 font-display text-2xl tracking-wide text-dals-800 group-hover:underline">{p.titulo}</h2>
            <p className="mt-1 text-neutral-600">{p.resumo}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
