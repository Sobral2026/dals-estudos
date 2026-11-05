"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnelProgresso, BarraProgresso, BarrasRevisao, Botao, BotaoLink, Cartao, Estatistica } from "@/components/ui";
import { QUESTOES } from "@/data/questoes";
import { TRILHAS } from "@/data/trilhas";
import {
  desempenhoPorDisciplina,
  resumirQuestoes,
  resumoGeral,
  resumoRevisao,
  ultimaRespostaPorQuestao,
} from "@/lib/estatisticas";
import { criarSimulado, useEstado, useMontado } from "@/lib/store";

export default function Inicio() {
  const router = useRouter();
  const estado = useEstado();
  const montado = useMontado();
  const geral = resumoGeral(estado);
  const ultimas = ultimaRespostaPorQuestao(estado.historico);
  const revisao = resumoRevisao(estado, new Date());
  const pontosFracos = desempenhoPorDisciplina(estado)
    .filter((d) => d.respondidas > 0)
    .sort((a, b) => a.nota - b.nota)
    .slice(0, 3);

  function responderPendentes() {
    const id = criarSimulado("Revisão do dia", "tutor", revisao.pendentes);
    router.push(`/simulado/${id}`);
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-dals-800 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-dals-200">Diretório Acadêmico Luiz Sobral</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-wide sm:text-4xl">Bora estudar, futuro médico.</h1>
        <p className="mt-2 max-w-xl text-sm text-dals-100/90">
          Resolva questões, entenda cada alternativa e deixe a revisão espaçada lembrar você do que precisa voltar.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <BotaoLink href="/questoes" className="bg-white !text-dals-800 hover:bg-dals-100">
            Criar simulado
          </BotaoLink>
          <BotaoLink href="/trilhas" variante="secundario" className="border-white/60 !text-white hover:bg-white/10">
            Ver trilhas
          </BotaoLink>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Cartao className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl tracking-wide text-dals-800">Banco de questões</h2>
            <Link href="/desempenho" className="text-sm font-semibold text-dals-600 hover:underline">
              Detalhes
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Estatistica rotulo="Concluído" valor={`${geral.conclusao}%`} detalhe={`${geral.respondidas}/${geral.total} respondidas`} />
            <Estatistica rotulo="Sua nota" valor={`${geral.nota}%`} detalhe={`${geral.acertos}/${geral.respondidas} corretas`} destaque />
            <Estatistica rotulo="Média da turma" valor={`${geral.mediaTurma}%`} detalhe="acerto médio" />
          </div>
          {montado && geral.respondidas === 0 && (
            <p className="mt-4 rounded-lg bg-dals-50 p-3 text-sm text-dals-800">
              Você ainda não respondeu nenhuma questão. Comece com um simulado curto no modo tutor.
            </p>
          )}
        </Cartao>

        <Cartao>
          <h2 className="font-display text-xl tracking-wide text-dals-800">Revisão espaçada</h2>
          <p className="mb-4 text-xs text-neutral-500">Questões que voltam na hora certa</p>
          <BarrasRevisao hoje={revisao.hoje} atrasada={revisao.atrasada} muitoAtrasada={revisao["muito-atrasada"]} />
          <Botao className="mt-5 w-full" disabled={revisao.pendentes.length === 0} onClick={responderPendentes}>
            Responder pendentes
          </Botao>
        </Cartao>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Cartao>
          <h2 className="mb-4 font-display text-xl tracking-wide text-dals-800">Trilhas</h2>
          <div className="space-y-3">
            {TRILHAS.map((t) => {
              const disciplinas = t.blocos.flatMap((b) => b.disciplinas);
              const progresso = resumirQuestoes(
                QUESTOES.filter((q) => disciplinas.includes(q.disciplina)),
                ultimas,
              );
              return (
                <Link key={t.id} href={`/trilhas/${t.id}`} className="flex items-center gap-4 rounded-xl border border-neutral-200 p-3 hover:border-dals-600">
                  <AnelProgresso valor={progresso.conclusao} tamanho={44} />
                  <div className="flex-1">
                    <div className="font-semibold">{t.nome}</div>
                    <div className="text-xs text-neutral-500">
                      {t.blocos.length} blocos · {progresso.conclusao}% concluído
                    </div>
                  </div>
                  <span className="text-dals-600">›</span>
                </Link>
              );
            })}
          </div>
        </Cartao>

        <Cartao>
          <h2 className="mb-4 font-display text-xl tracking-wide text-dals-800">Onde focar</h2>
          {pontosFracos.length === 0 ? (
            <p className="text-sm text-neutral-500">Responda algumas questões para descobrir seus pontos fracos.</p>
          ) : (
            <div className="space-y-4">
              {pontosFracos.map((d) => (
                <div key={d.disciplina.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold">{d.disciplina.nome}</span>
                    <span className="text-neutral-500">
                      {d.nota}% · turma {d.mediaTurma}%
                    </span>
                  </div>
                  <BarraProgresso valor={d.nota} cor={d.nota >= d.mediaTurma ? "bg-ok" : "bg-erro"} />
                </div>
              ))}
            </div>
          )}
        </Cartao>
      </div>
    </div>
  );
}
