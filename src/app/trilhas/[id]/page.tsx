"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnelProgresso, BarraProgresso, Botao, Cartao } from "@/components/ui";
import { nomeDisciplina } from "@/data/disciplinas";
import { QUESTOES } from "@/data/questoes";
import { trilhaPorId } from "@/data/trilhas";
import { resumirQuestoes, ultimaRespostaPorQuestao } from "@/lib/estatisticas";
import { criarSimulado, useEstado } from "@/lib/store";

export default function DetalheTrilha() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const estado = useEstado();
  const trilha = trilhaPorId(id);
  if (!trilha) return <p className="text-sm">Trilha não encontrada.</p>;

  const ultimas = ultimaRespostaPorQuestao(estado.historico);
  const blocos = trilha.blocos.map((b) => {
    const questoes = QUESTOES.filter((q) => b.disciplinas.includes(q.disciplina));
    return { bloco: b, questoes, ...resumirQuestoes(questoes, ultimas) };
  });
  const geral = resumirQuestoes(
    blocos.flatMap((b) => b.questoes),
    ultimas,
  );

  function praticar(titulo: string, ids: string[]) {
    const simuladoId = criarSimulado(titulo, "tutor", ids);
    router.push(`/simulado/${simuladoId}`);
  }

  return (
    <div>
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/trilhas" className="hover:underline">
          Trilhas
        </Link>{" "}
        / <span className="font-semibold text-neutral-800">{trilha.nome}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <Cartao className="mb-6">
            <h1 className="font-display text-2xl tracking-wide text-dals-800">{trilha.nome}</h1>
            <p className="mt-1 text-sm text-neutral-600">{trilha.descricao}</p>
          </Cartao>

          <ol className="relative space-y-4 border-l-2 border-dals-200 pl-6">
            {blocos.map((b, i) => (
              <li key={b.bloco.id} className="relative">
                <span
                  className={`absolute -left-[33px] top-6 h-4 w-4 rounded-full border-2 ${
                    b.conclusao === 100 ? "border-ok bg-ok" : "border-dals-600 bg-white"
                  }`}
                />
                <Cartao>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg tracking-wide text-dals-800">
                        Bloco {i + 1}: {b.bloco.titulo}
                      </h2>
                      <p className="text-xs text-neutral-500">{b.bloco.disciplinas.map(nomeDisciplina).join(" · ")}</p>
                    </div>
                    <Botao onClick={() => praticar(`${trilha.nome} — ${b.bloco.titulo}`, b.questoes.map((q) => q.id))}>
                      {b.respondidas === 0 ? "Começar" : "Praticar"}
                    </Botao>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <BarraProgresso valor={b.conclusao} />
                    <span className="w-12 text-right font-bold">{b.conclusao}%</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    {b.respondidas}/{b.total} questões · {b.respondidas > 0 ? `${b.nota}% de acerto` : "ainda não iniciado"}
                  </p>
                </Cartao>
              </li>
            ))}
          </ol>
        </div>

        <Cartao className="h-fit lg:sticky lg:top-8">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-600">Seu progresso</span>
            <div className="relative">
              <AnelProgresso valor={geral.conclusao} tamanho={56} />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{geral.conclusao}%</span>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <b>{geral.respondidas}</b>/{geral.total} questões respondidas
            </li>
            <li>
              <b>{geral.nota}%</b> de acerto · turma {geral.mediaTurma}%
            </li>
          </ul>
        </Cartao>
      </div>
    </div>
  );
}
