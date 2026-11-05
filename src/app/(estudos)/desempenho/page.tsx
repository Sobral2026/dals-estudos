"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BarraProgresso, Botao, Cartao, Estatistica, TituloPagina } from "@/components/ui";
import { CICLOS } from "@/data/disciplinas";
import { QUESTOES } from "@/data/questoes";
import { desempenhoPorCompetencia, desempenhoPorDisciplina, resumoGeral, ultimaRespostaPorQuestao } from "@/lib/estatisticas";
import { criarSimulado, useEstado } from "@/lib/store";

export default function Desempenho() {
  const router = useRouter();
  const estado = useEstado();
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const geral = resumoGeral(estado);
  const porCompetencia = desempenhoPorCompetencia(estado);
  // Recomenda as competências com acerto abaixo de 70% entre as já praticadas.
  const recomendacoes = porCompetencia
    .filter((c) => c.respondidas > 0 && c.nota < 70)
    .sort((a, b) => a.nota - b.nota)
    .slice(0, 3);
  const linhas = desempenhoPorDisciplina(estado);
  const ultimas = ultimaRespostaPorQuestao(estado.historico);
  const erradas = QUESTOES.filter((q) => ultimas.get(q.id)?.acertou === false).map((q) => q.id);

  function alternar(id: string) {
    setMarcadas((atual) => {
      const nova = new Set(atual);
      if (nova.has(id)) nova.delete(id);
      else nova.add(id);
      return nova;
    });
  }

  function iniciar(titulo: string, ids: string[]) {
    const id = criarSimulado(titulo, "tutor", ids);
    router.push(`/simulado/${id}`);
  }

  /** Revisão adaptativa: nas disciplinas marcadas, o que errou ou ainda não respondeu. */
  const adaptativa = QUESTOES.filter((q) => marcadas.has(q.disciplina) && ultimas.get(q.id)?.acertou !== true).map((q) => q.id);

  return (
    <div>
      <TituloPagina titulo="Desempenho" subtitulo="Compare seu acerto com a média da turma em cada disciplina." />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Estatistica rotulo="Concluído" valor={`${geral.conclusao}%`} detalhe={`${geral.respondidas}/${geral.total} respondidas`} />
        <Estatistica rotulo="Sua nota" valor={`${geral.nota}%`} detalhe={`${geral.acertos} corretas`} destaque />
        <Estatistica rotulo="Média da turma" valor={`${geral.mediaTurma}%`} detalhe="dado de exemplo" />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Botao disabled={adaptativa.length === 0} onClick={() => iniciar("Revisão adaptativa", adaptativa)}>
          Revisão adaptativa ({adaptativa.length})
        </Botao>
        <Botao variante="secundario" disabled={erradas.length === 0} onClick={() => iniciar("Refazer erradas", erradas)}>
          Refazer erradas ({erradas.length})
        </Botao>
      </div>
      <p className="-mt-2 mb-4 text-xs text-neutral-500">
        Marque disciplinas na tabela para a revisão adaptativa. Ela junta as questões que você errou ou ainda não fez.
      </p>

      {CICLOS.map((ciclo) => (
        <Cartao key={ciclo.id} className="mb-6 overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-xs uppercase tracking-wider text-neutral-500">
                <th className="w-10 px-4 py-3" />
                <th className="py-3 font-display text-base normal-case tracking-wide text-dals-800">{ciclo.nome}</th>
                <th className="px-3 py-3">Respondidas</th>
                <th className="w-1/3 px-3 py-3">Seu acerto</th>
                <th className="px-4 py-3 text-right">Turma (exemplo)</th>
              </tr>
            </thead>
            <tbody>
              {linhas
                .filter((l) => l.disciplina.ciclo === ciclo.id)
                .map((l) => (
                  <tr key={l.disciplina.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={marcadas.has(l.disciplina.id)}
                        onChange={() => alternar(l.disciplina.id)}
                        className="h-4 w-4 accent-dals-700"
                        aria-label={`Selecionar ${l.disciplina.nome}`}
                      />
                    </td>
                    <td className="py-3 font-semibold">{l.disciplina.nome}</td>
                    <td className="px-3 py-3 text-neutral-600">
                      {l.respondidas}/{l.total}
                    </td>
                    <td className="px-3 py-3">
                      {l.respondidas === 0 ? (
                        <span className="text-xs text-neutral-400">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <BarraProgresso valor={l.nota} cor={l.nota >= l.mediaTurma ? "bg-ok" : "bg-erro"} />
                          <span className="w-10 text-right font-bold">{l.nota}%</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">{l.mediaTurma}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Cartao>
      ))}

      <Cartao className="mb-6">
        <h2 className="mb-1 font-display text-lg tracking-wide text-dals-800">Por competência ENAMED</h2>
        <p className="mb-4 text-xs text-neutral-500">Classificação de exemplo, até a matriz oficial ser cadastrada.</p>
        <div className="space-y-4">
          {porCompetencia.map((c) => (
            <div key={c.competencia.id}>
              <div className="mb-1 flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-semibold">{c.competencia.descricao}</span>
                <span className="text-neutral-500">
                  {c.respondidas}/{c.total} respondidas{c.respondidas > 0 && ` · ${c.nota}% de acerto`}
                </span>
              </div>
              <BarraProgresso valor={c.respondidas ? c.nota : 0} cor={c.nota >= 70 ? "bg-ok" : c.respondidas ? "bg-alerta" : "bg-neutral-300"} />
            </div>
          ))}
        </div>
        {recomendacoes.length > 0 && (
          <div className="mt-5 rounded-xl bg-dals-50 p-4 text-sm">
            <b>Recomendação de estudo:</b> revise {recomendacoes.map((c) => c.competencia.descricao.replace(" (exemplo)", "")).join("; ")}.
          </div>
        )}
      </Cartao>
    </div>
  );
}
