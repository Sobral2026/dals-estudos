"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Botao, Cartao, Checkbox, TituloPagina } from "@/components/ui";
import { CICLOS, DISCIPLINAS, nomeDisciplina } from "@/data/disciplinas";
import { QUESTOES } from "@/data/questoes";
import { embaralhar, resultadoSimulado, ultimaRespostaPorQuestao } from "@/lib/estatisticas";
import { criarSimulado, excluirSimulado, useEstado, useMontado } from "@/lib/store";
import type { ModoSimulado } from "@/lib/types";

type FiltroStatus = "todas" | "nao-respondidas" | "erradas";

const STATUS: { id: FiltroStatus; rotulo: string }[] = [
  { id: "todas", rotulo: "Todas" },
  { id: "nao-respondidas", rotulo: "Não respondidas" },
  { id: "erradas", rotulo: "Que errei" },
];

export default function BancoDeQuestoes() {
  const router = useRouter();
  const estado = useEstado();
  const montado = useMontado();
  const [selecionadas, setSelecionadas] = useState<Set<string>>(() => new Set(DISCIPLINAS.map((d) => d.id)));
  const [status, setStatus] = useState<FiltroStatus>("todas");
  const [modo, setModo] = useState<ModoSimulado>("tutor");
  const [quantidade, setQuantidade] = useState(10);

  const ultimas = ultimaRespostaPorQuestao(estado.historico);
  const passaStatus = (id: string) =>
    status === "todas" ||
    (status === "nao-respondidas" && !ultimas.has(id)) ||
    (status === "erradas" && ultimas.get(id)?.acertou === false);
  const contagem = (disciplina: string) => QUESTOES.filter((q) => q.disciplina === disciplina && passaStatus(q.id)).length;
  const disponiveis = QUESTOES.filter((q) => selecionadas.has(q.disciplina) && passaStatus(q.id));
  const qtd = Math.min(quantidade, disponiveis.length);

  function alternar(ids: string[], marcar: boolean) {
    setSelecionadas((atual) => {
      const nova = new Set(atual);
      ids.forEach((id) => (marcar ? nova.add(id) : nova.delete(id)));
      return nova;
    });
  }

  function criar() {
    const ids = embaralhar(disponiveis).slice(0, qtd).map((q) => q.id);
    const nomes = [...selecionadas];
    const titulo =
      nomes.length <= 2 ? nomes.map(nomeDisciplina).join(" + ") : `Simulado de ${new Date().toLocaleDateString("pt-BR")}`;
    const id = criarSimulado(titulo, modo, ids);
    router.push(`/simulado/${id}`);
  }

  const simulados = Object.values(estado.simulados).sort((a, b) => b.inicio.localeCompare(a.inicio));

  return (
    <div>
      <TituloPagina titulo="Banco de questões" subtitulo={`${QUESTOES.length} questões cadastradas · monte um simulado do seu jeito`} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Cartao>
          <h2 className="mb-3 font-display text-lg tracking-wide text-dals-800">1. Disciplinas</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {CICLOS.map((ciclo) => {
              const ids = DISCIPLINAS.filter((d) => d.ciclo === ciclo.id).map((d) => d.id);
              const marcadas = ids.filter((id) => selecionadas.has(id)).length;
              return (
                <div key={ciclo.id} className="rounded-xl border border-neutral-200 p-2">
                  <div className="font-semibold">
                    <Checkbox
                      rotulo={ciclo.nome}
                      marcado={marcadas === ids.length}
                      indeterminado={marcadas > 0 && marcadas < ids.length}
                      aoMudar={(v) => alternar(ids, v)}
                    />
                  </div>
                  <div className="ml-5 border-l border-neutral-200 pl-2">
                    {ids.map((id) => (
                      <Checkbox
                        key={id}
                        rotulo={nomeDisciplina(id)}
                        marcado={selecionadas.has(id)}
                        aoMudar={(v) => alternar([id], v)}
                        extra={
                          <span className="rounded-md bg-dals-100 px-2 py-0.5 text-xs font-bold text-dals-700">
                            {montado ? contagem(id) : "–"}
                          </span>
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="mb-3 mt-6 font-display text-lg tracking-wide text-dals-800">2. Quais questões</h2>
          <div className="flex flex-wrap gap-2">
            {STATUS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatus(s.id)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
                  status === s.id ? "border-dals-700 bg-dals-700 text-white" : "border-neutral-300 hover:border-dals-600"
                }`}
              >
                {s.rotulo}
              </button>
            ))}
          </div>
        </Cartao>

        <Cartao className="h-fit lg:sticky lg:top-8">
          <h2 className="mb-3 font-display text-lg tracking-wide text-dals-800">3. Configurar</h2>
          <div className="space-y-2">
            {(
              [
                { id: "tutor", titulo: "Modo tutor", texto: "Gabarito e explicação logo após cada questão." },
                { id: "prova", titulo: "Modo prova", texto: "Cronômetro e resultado só no final, como na prova real." },
              ] as const
            ).map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${modo === m.id ? "border-dals-600 bg-dals-50" : "border-neutral-200"}`}
              >
                <input type="radio" name="modo" checked={modo === m.id} onChange={() => setModo(m.id)} className="mt-1 accent-dals-700" />
                <span>
                  <span className="block text-sm font-bold">{m.titulo}</span>
                  <span className="block text-xs text-neutral-600">{m.texto}</span>
                </span>
              </label>
            ))}
          </div>

          <label className="mt-5 block text-sm font-semibold">
            Número de questões: <span className="text-dals-700">{qtd}</span>
            <input
              type="range"
              min={1}
              max={Math.max(disponiveis.length, 1)}
              value={qtd}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              disabled={disponiveis.length === 0}
              className="mt-2 w-full accent-dals-700"
            />
          </label>
          <p className="mt-1 text-xs text-neutral-500">{montado ? disponiveis.length : "–"} questões disponíveis com esses filtros</p>

          <Botao className="mt-5 w-full" disabled={qtd === 0} onClick={criar}>
            Criar simulado
          </Botao>
        </Cartao>
      </div>

      {montado && simulados.length > 0 && (
        <Cartao className="mt-6">
          <h2 className="mb-3 font-display text-lg tracking-wide text-dals-800">Seus simulados</h2>
          <div className="divide-y divide-neutral-100">
            {simulados.map((s) => {
              const r = resultadoSimulado(s);
              return (
                <div key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{s.titulo}</div>
                    <div className="text-xs text-neutral-500">
                      {new Date(s.inicio).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} · modo {s.modo} ·{" "}
                      {s.finalizado ? `nota ${r.nota}%` : `${r.respondidas}/${s.questoes.length} respondidas`}
                    </div>
                  </div>
                  <Link
                    href={s.finalizado ? `/simulado/${s.id}/resultado` : `/simulado/${s.id}`}
                    className="text-sm font-bold text-dals-700 hover:underline"
                  >
                    {s.finalizado ? "Ver resultado" : "Continuar"}
                  </Link>
                  <button type="button" onClick={() => excluirSimulado(s.id)} className="text-sm text-neutral-400 hover:text-erro">
                    Excluir
                  </button>
                </div>
              );
            })}
          </div>
        </Cartao>
      )}
    </div>
  );
}
