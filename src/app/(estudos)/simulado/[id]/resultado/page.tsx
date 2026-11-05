"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnelProgresso, Botao, BotaoLink, Cartao, Carregando, Estatistica } from "@/components/ui";
import { nomeDisciplina } from "@/data/disciplinas";
import { resultadoSimulado } from "@/lib/estatisticas";
import { criarSimulado, irParaQuestao, useEstado, useMontado } from "@/lib/store";

function duracao(inicio: string, fim?: string) {
  if (!fim) return "—";
  const min = Math.round((new Date(fim).getTime() - new Date(inicio).getTime()) / 60000);
  return min < 1 ? "< 1 min" : `${min} min`;
}

export default function Resultado() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const estado = useEstado();
  const montado = useMontado();
  const simulado = estado.simulados[id];

  if (!montado) return <Carregando />;
  if (!simulado) return <p className="text-sm">Simulado não encontrado.</p>;

  const r = resultadoSimulado(simulado);
  const erradas = r.itens.filter((i) => !i.acertou).map((i) => i.questao.id);

  function revisar(indice: number) {
    irParaQuestao(simulado.id, indice);
    router.push(`/simulado/${simulado.id}`);
  }

  function refazerErradas() {
    const novo = criarSimulado(`${simulado.titulo} — erradas`, "tutor", erradas);
    router.push(`/simulado/${novo}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Cartao className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Resultado</p>
        <h1 className="mt-1 font-display text-2xl tracking-wide text-dals-800">{simulado.titulo}</h1>
        <div className="relative mx-auto mt-5 w-fit">
          <AnelProgresso valor={r.nota} tamanho={130} cor={r.nota >= r.mediaTurma ? "var(--color-ok)" : "var(--color-erro)"} />
          <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-semibold text-dals-800">{r.nota}%</span>
            <span className="text-xs text-neutral-500">de acerto</span>
          </span>
        </div>
        <p className="mt-4 text-sm text-neutral-600">
          {r.nota >= r.mediaTurma
            ? "Acima da média da turma. Mandou bem! 🎉"
            : "Abaixo da média da turma nessas questões. Revise as erradas. 💪"}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Estatistica rotulo="Acertos" valor={`${r.acertos}/${r.itens.length}`} detalhe={`${r.respondidas} respondidas`} destaque />
          <Estatistica rotulo="Média da turma" valor={`${r.mediaTurma}%`} detalhe="exemplo, nessas questões" />
          <Estatistica rotulo="Tempo" valor={duracao(simulado.inicio, simulado.fim)} detalhe={`modo ${simulado.modo}`} />
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Botao disabled={erradas.length === 0} onClick={refazerErradas}>
            Refazer erradas ({erradas.length})
          </Botao>
          <BotaoLink href="/questoes" variante="secundario">
            Novo simulado
          </BotaoLink>
          <BotaoLink href={`/questoes/imprimir?formato=comentado&ids=${simulado.questoes.join(",")}`} variante="secundario">
            Exportar PDF
          </BotaoLink>
        </div>
      </Cartao>

      <Cartao className="mt-6 p-0">
        <h2 className="px-5 pt-5 font-display text-lg tracking-wide text-dals-800">Questão por questão</h2>
        <ul className="mt-2 divide-y divide-neutral-100">
          {r.itens.map((item, i) => (
            <li key={item.questao.id}>
              <button type="button" onClick={() => revisar(i)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-dals-50">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                    item.acertou ? "bg-ok" : item.resposta ? "bg-erro" : "bg-neutral-300"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{item.questao.enunciado}</span>
                  <span className="text-xs text-neutral-500">
                    {nomeDisciplina(item.questao.disciplina)} · sua resposta: {item.resposta?.letra ?? "—"} · correta:{" "}
                    {item.questao.correta}
                  </span>
                </span>
                <span className="text-sm font-semibold text-dals-600">Revisar ›</span>
              </button>
            </li>
          ))}
        </ul>
      </Cartao>

      <p className="mt-4 text-center text-sm">
        <Link href="/inicio" className="font-semibold text-dals-700 hover:underline">
          Voltar ao início
        </Link>
      </p>
    </div>
  );
}
