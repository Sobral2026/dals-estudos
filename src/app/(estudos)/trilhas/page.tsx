"use client";

import Link from "next/link";
import { AnelProgresso, Cartao, TituloPagina } from "@/components/ui";
import { QUESTOES } from "@/data/questoes";
import { TRILHAS } from "@/data/trilhas";
import { resumirQuestoes, ultimaRespostaPorQuestao } from "@/lib/estatisticas";
import { useEstado } from "@/lib/store";

export default function Trilhas() {
  const estado = useEstado();
  const ultimas = ultimaRespostaPorQuestao(estado.historico);

  return (
    <div>
      <TituloPagina titulo="Trilhas" subtitulo="Planos de estudo prontos, montados pela diretoria acadêmica, em blocos curtos." />
      <div className="grid gap-6 md:grid-cols-2">
        {TRILHAS.map((t) => {
          const disciplinas = t.blocos.flatMap((b) => b.disciplinas);
          const r = resumirQuestoes(
            QUESTOES.filter((q) => disciplinas.includes(q.disciplina)),
            ultimas,
          );
          return (
            <Link key={t.id} href={`/trilhas/${t.id}`}>
              <Cartao className="h-full transition hover:border-dals-600">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <AnelProgresso valor={r.conclusao} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{r.conclusao}%</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-xl tracking-wide text-dals-800">{t.nome}</h2>
                    <p className="mt-1 text-sm text-neutral-600">{t.descricao}</p>
                    <p className="mt-3 text-xs font-semibold text-neutral-500">
                      {t.blocos.length} blocos · {r.respondidas}/{r.total} questões
                    </p>
                  </div>
                </div>
              </Cartao>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
