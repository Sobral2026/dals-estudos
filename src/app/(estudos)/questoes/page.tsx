"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AvisoExemplo, Botao, Cartao, Checkbox, TituloPagina } from "@/components/ui";
import { DISCIPLINAS, PERIODOS, nomeDisciplina } from "@/data/disciplinas";
import { QUESTOES } from "@/data/questoes";
import { ASSUNTOS, AREAS_ENAMED, COMPETENCIAS_ENAMED, HABILIDADES_ENAMED, ROTULO_DIFICULDADE, TAXONOMIA_VALIDADA } from "@/data/taxonomia";
import { embaralhar, resultadoSimulado, ultimaRespostaPorQuestao } from "@/lib/estatisticas";
import { filtrarQuestoes, passaStatus, type FiltroStatus, type FiltrosQuestoes, type ModeloClassificacao } from "@/lib/filtros";
import { criarSimulado, excluirSimulado, useEstado, useMontado } from "@/lib/store";
import type { ModoSimulado, Questao } from "@/lib/types";

const STATUS: { id: FiltroStatus; rotulo: string }[] = [
  { id: "todas", rotulo: "Todas" },
  { id: "nao-respondidas", rotulo: "Não respondidas" },
  { id: "erradas", rotulo: "Que errei" },
];

const DIFICULDADES = Object.keys(ROTULO_DIFICULDADE) as Questao["dificuldade"][];

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
        ativo ? "border-dals-700 bg-dals-700 text-white" : "border-neutral-300 hover:border-dals-600"
      }`}
    >
      {children}
    </button>
  );
}

export default function BancoDeQuestoes() {
  const router = useRouter();
  const estado = useEstado();
  const montado = useMontado();
  const [modelo, setModelo] = useState<ModeloClassificacao>("fmc");
  const [disciplinas, setDisciplinas] = useState<Set<string>>(() => new Set(DISCIPLINAS.map((d) => d.id)));
  const [assunto, setAssunto] = useState("");
  const [competencias, setCompetencias] = useState<Set<string>>(() => new Set(COMPETENCIAS_ENAMED.map((c) => c.id)));
  const [habilidade, setHabilidade] = useState("");
  const [dificuldades, setDificuldades] = useState<Set<Questao["dificuldade"]>>(() => new Set(DIFICULDADES));
  const [status, setStatus] = useState<FiltroStatus>("todas");
  const [modo, setModo] = useState<ModoSimulado>("tutor");
  const [quantidade, setQuantidade] = useState(10);

  const ultimas = ultimaRespostaPorQuestao(estado.historico);
  const filtros: FiltrosQuestoes = { modelo, disciplinas, assunto, competencias, habilidade, dificuldades, status };
  const disponiveis = filtrarQuestoes(QUESTOES, filtros, ultimas);
  const qtd = Math.min(quantidade, disponiveis.length);
  const contar = (pred: (q: Questao) => boolean) =>
    QUESTOES.filter((q) => pred(q) && dificuldades.has(q.dificuldade) && passaStatus(q, status, ultimas)).length;

  function alternar<T>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, ids: T[], marcar: boolean) {
    setter((atual) => {
      const nova = new Set(atual);
      ids.forEach((id) => (marcar ? nova.add(id) : nova.delete(id)));
      return nova;
    });
  }

  const assuntosVisiveis = ASSUNTOS.filter((a) => disciplinas.has(a.disciplina));
  const habilidadesVisiveis = HABILIDADES_ENAMED.filter((h) => competencias.has(h.competencia));

  function criar() {
    const ids = embaralhar(disponiveis).slice(0, qtd).map((q) => q.id);
    const nomes = [...disciplinas];
    const titulo =
      modelo === "fmc" && nomes.length <= 2
        ? nomes.map(nomeDisciplina).join(" + ")
        : `Simulado de ${new Date().toLocaleDateString("pt-BR")}`;
    const id = criarSimulado(titulo, modo, ids);
    router.push(`/simulado/${id}`);
  }

  function exportar() {
    const ids = disponiveis.slice(0, qtd).map((q) => q.id);
    router.push(`/questoes/imprimir?ids=${ids.join(",")}`);
  }

  const simulados = Object.values(estado.simulados).sort((a, b) => b.inicio.localeCompare(a.inicio));

  return (
    <div>
      <TituloPagina titulo="Banco de questões" subtitulo={`${QUESTOES.length} questões cadastradas · monte um simulado ou exporte uma lista`} />
      {!TAXONOMIA_VALIDADA && (
        <AvisoExemplo>
          Classificação de <b>exemplo</b>. Períodos, disciplinas e itens do ENAMED serão substituídos pela grade oficial da FMC e pela
          matriz oficial do INEP, depois de validados pelo DALS.
        </AvisoExemplo>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Cartao>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg tracking-wide text-dals-800">1. Classificação</h2>
            <div className="flex rounded-lg border border-neutral-200 p-1 text-sm font-semibold" role="tablist">
              {(
                [
                  ["fmc", "Período FMC"],
                  ["enamed", "ENAMED"],
                ] as const
              ).map(([id, rotulo]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={modelo === id}
                  onClick={() => setModelo(id)}
                  className={`rounded-md px-3 py-1.5 ${modelo === id ? "bg-dals-700 text-white" : "text-neutral-600 hover:bg-dals-50"}`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </div>

          {modelo === "fmc" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {PERIODOS.map((periodo) => {
                  const ids = DISCIPLINAS.filter((d) => d.periodo === periodo).map((d) => d.id);
                  const marcadas = ids.filter((id) => disciplinas.has(id)).length;
                  return (
                    <div key={periodo} className="rounded-xl border border-neutral-200 p-2">
                      <div className="font-semibold">
                        <Checkbox
                          rotulo={`${periodo}º período`}
                          marcado={marcadas === ids.length}
                          indeterminado={marcadas > 0 && marcadas < ids.length}
                          aoMudar={(v) => alternar(setDisciplinas, ids, v)}
                        />
                      </div>
                      <div className="ml-5 border-l border-neutral-200 pl-2">
                        {ids.map((id) => (
                          <Checkbox
                            key={id}
                            rotulo={nomeDisciplina(id)}
                            marcado={disciplinas.has(id)}
                            aoMudar={(v) => alternar(setDisciplinas, [id], v)}
                            extra={
                              <span className="rounded-md bg-dals-100 px-2 py-0.5 text-xs font-bold text-dals-700">
                                {montado ? contar((q) => q.disciplina === id) : "–"}
                              </span>
                            }
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <label className="mt-4 block text-sm font-semibold">
                Assunto / subassunto
                <select
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal outline-none focus:border-dals-600"
                >
                  <option value="">Todos os assuntos das disciplinas marcadas</option>
                  {assuntosVisiveis.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.pai ? `   └ ${a.nome}` : `${nomeDisciplina(a.disciplina)} › ${a.nome}`}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {AREAS_ENAMED.map((area) => {
                  const ids = COMPETENCIAS_ENAMED.filter((c) => c.area === area.id).map((c) => c.id);
                  const marcadas = ids.filter((id) => competencias.has(id)).length;
                  return (
                    <div key={area.id} className="rounded-xl border border-neutral-200 p-2">
                      <div className="font-semibold">
                        <Checkbox
                          rotulo={area.nome}
                          marcado={marcadas === ids.length}
                          indeterminado={marcadas > 0 && marcadas < ids.length}
                          aoMudar={(v) => alternar(setCompetencias, ids, v)}
                        />
                      </div>
                      <div className="ml-5 border-l border-neutral-200 pl-2">
                        {COMPETENCIAS_ENAMED.filter((c) => c.area === area.id).map((c) => (
                          <Checkbox
                            key={c.id}
                            rotulo={c.descricao}
                            marcado={competencias.has(c.id)}
                            aoMudar={(v) => alternar(setCompetencias, [c.id], v)}
                            extra={
                              <span className="rounded-md bg-dals-100 px-2 py-0.5 text-xs font-bold text-dals-700">
                                {montado ? contar((q) => q.enamed.competencia === c.id) : "–"}
                              </span>
                            }
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <label className="mt-4 block text-sm font-semibold">
                Habilidade
                <select
                  value={habilidade}
                  onChange={(e) => setHabilidade(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal outline-none focus:border-dals-600"
                >
                  <option value="">Todas as habilidades das competências marcadas</option>
                  {habilidadesVisiveis.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.descricao}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          <h2 className="mb-3 mt-6 font-display text-lg tracking-wide text-dals-800">2. Quais questões</h2>
          <div className="flex flex-wrap gap-2">
            {STATUS.map((s) => (
              <Chip key={s.id} ativo={status === s.id} onClick={() => setStatus(s.id)}>
                {s.rotulo}
              </Chip>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-neutral-600">Dificuldade:</span>
            {DIFICULDADES.map((d) => (
              <Chip key={d} ativo={dificuldades.has(d)} onClick={() => alternar(setDificuldades, [d], !dificuldades.has(d))}>
                {ROTULO_DIFICULDADE[d]}
              </Chip>
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
          <Botao variante="secundario" className="mt-2 w-full" disabled={qtd === 0} onClick={exportar}>
            Exportar lista em PDF
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
