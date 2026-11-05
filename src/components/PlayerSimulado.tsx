"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { nomeDisciplina } from "@/data/disciplinas";
import { questaoPorId } from "@/data/questoes";
import { finalizarSimulado, irParaQuestao, reportarErro, responderNoSimulado, useEstado } from "@/lib/store";
import type { Confianca, Letra, Questao, Simulado } from "@/lib/types";
import { Botao } from "./ui";

const CONFIANCA: { valor: Confianca; emoji: string; rotulo: string; cor: string }[] = [
  { valor: 1, emoji: "😟", rotulo: "Chutei", cor: "bg-erro hover:brightness-95" },
  { valor: 2, emoji: "😐", rotulo: "Acho que sei", cor: "bg-info hover:brightness-95" },
  { valor: 3, emoji: "😄", rotulo: "Tenho certeza", cor: "bg-ok hover:brightness-95" },
];

function formatarTempo(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const mmss = `${String(m).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
}

function Cronometro({ inicio }: { inicio: string }) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="font-mono text-sm tabular-nums">⏱ {formatarTempo(agora - new Date(inicio).getTime())}</span>;
}

export function PlayerSimulado({ simulado }: { simulado: Simulado }) {
  const router = useRouter();
  const total = simulado.questoes.length;
  const questao = questaoPorId(simulado.questoes[simulado.atual]);
  const respondidas = Object.keys(simulado.respostas).length;
  const acertos = simulado.questoes.filter((id) => simulado.respostas[id]?.letra === questaoPorId(id)?.correta).length;
  const mostraCorrecao = (id: string) => simulado.finalizado || (simulado.modo === "tutor" && !!simulado.respostas[id]);

  function finalizar() {
    if (!simulado.finalizado) {
      const faltam = total - respondidas;
      if (faltam > 0 && !window.confirm(`Ainda faltam ${faltam} questão(ões). Finalizar mesmo assim?`)) return;
      finalizarSimulado(simulado.id);
    }
    router.push(`/simulado/${simulado.id}/resultado`);
  }

  function corDoNumero(id: string, i: number) {
    const r = simulado.respostas[id];
    const atual = i === simulado.atual ? "ring-2 ring-dals-700 ring-offset-1" : "";
    if (r && mostraCorrecao(id)) {
      return `${r.letra === questaoPorId(id)?.correta ? "bg-ok text-white" : "bg-erro text-white"} ${atual}`;
    }
    if (r) return `bg-dals-200 text-dals-900 ${atual}`;
    return `bg-white text-neutral-700 hover:bg-dals-50 ${atual}`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-2 bg-dals-800 px-4 py-3 text-white">
        <Link href="/questoes" className="rounded-md px-2 py-1 text-xl leading-none hover:bg-white/10" aria-label="Sair do simulado">
          ✕
        </Link>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-lg tracking-wide">{simulado.titulo}</div>
          <div className="text-xs text-dals-200">
            Modo {simulado.modo} · {respondidas}/{total} respondidas
            {simulado.modo === "tutor" && ` · ${acertos} acertos`}
          </div>
        </div>
        {simulado.modo === "prova" && !simulado.finalizado && <Cronometro inicio={simulado.inicio} />}
        <button
          type="button"
          onClick={finalizar}
          className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-dals-800 hover:bg-dals-100"
        >
          {simulado.finalizado ? "Ver resultado" : "Finalizar"}
        </button>
      </header>

      <div className="flex flex-1">
        <nav className="sticky top-[60px] hidden max-h-[calc(100vh-60px)] w-16 shrink-0 flex-col gap-1 overflow-y-auto border-r border-neutral-200 bg-white p-2 sm:flex">
          {simulado.questoes.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={() => irParaQuestao(simulado.id, i)}
              className={`h-9 rounded-md text-sm font-bold ${corDoNumero(id, i)}`}
            >
              {i + 1}
            </button>
          ))}
        </nav>

        <div className="flex-1 px-3 py-4 sm:px-8 sm:py-8">
          <div className="mb-3 flex items-center justify-between sm:hidden">
            <span className="text-sm font-semibold">
              Questão {simulado.atual + 1} de {total}
            </span>
          </div>
          {questao && (
            <CartaoQuestao
              key={questao.id}
              simulado={simulado}
              questao={questao}
              numero={simulado.atual + 1}
              comCorrecao={mostraCorrecao(questao.id)}
              aoFinalizar={finalizar}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CartaoQuestao({
  simulado,
  questao,
  numero,
  comCorrecao,
  aoFinalizar,
}: {
  simulado: Simulado;
  questao: Questao;
  numero: number;
  comCorrecao: boolean;
  aoFinalizar: () => void;
}) {
  const estado = useEstado();
  const resposta = simulado.respostas[questao.id];
  const [selecionada, setSelecionada] = useState<Letra | null>(resposta?.letra ?? null);
  const [aba, setAba] = useState<"explicacao" | "referencia">("explicacao");
  const [reportando, setReportando] = useState(false);
  const ultima = numero === simulado.questoes.length;
  const acertou = resposta?.letra === questao.correta;
  const intervalo = estado.revisao[questao.id]?.intervaloDias ?? 0;

  function confirmar(confianca: Confianca) {
    if (!selecionada || comCorrecao) return;
    responderNoSimulado(simulado.id, questao.id, selecionada, confianca);
    if (simulado.modo === "prova" && !ultima) irParaQuestao(simulado.id, numero);
  }

  function navegar(delta: number) {
    irParaQuestao(simulado.id, numero - 1 + delta);
  }

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (reportando || e.target instanceof HTMLTextAreaElement) return;
      const tecla = e.key.toUpperCase();
      if (!comCorrecao && "ABCDE".includes(tecla) && tecla.length === 1) setSelecionada(tecla as Letra);
      if (!comCorrecao && ["1", "2", "3"].includes(e.key) && selecionada) {
        responderNoSimulado(simulado.id, questao.id, selecionada, Number(e.key) as Confianca);
        if (simulado.modo === "prova" && !ultima) irParaQuestao(simulado.id, numero);
      }
      if (e.key === "ArrowRight") irParaQuestao(simulado.id, numero);
      if (e.key === "ArrowLeft") irParaQuestao(simulado.id, numero - 2);
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [comCorrecao, numero, questao.id, reportando, selecionada, simulado.id, simulado.modo, ultima]);

  const bordaCartao = !comCorrecao ? "border-transparent" : acertou ? "border-ok" : "border-erro";

  return (
    <div className="mx-auto max-w-3xl">
      <article className={`rounded-2xl border-2 bg-white shadow-sm ${bordaCartao}`}>
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 px-5 py-3 text-xs text-neutral-500">
          <span className="rounded-md bg-dals-100 px-2 py-0.5 font-bold text-dals-700">{nomeDisciplina(questao.disciplina)}</span>
          <span>{questao.fonte}</span>
          <span className="ml-auto font-semibold">Questão {numero}</span>
        </div>

        <div className="p-5 sm:p-6">
          <p className="whitespace-pre-line leading-relaxed text-neutral-900">{questao.enunciado}</p>

          <div className="mt-5 space-y-2">
            {questao.alternativas.map((alt) => {
              const marcada = selecionada === alt.letra;
              const correta = alt.letra === questao.correta;
              let estilo = marcada ? "border-dals-600 bg-dals-50" : "border-neutral-200 hover:border-dals-500";
              let simbolo: string = alt.letra;
              if (comCorrecao) {
                if (correta) {
                  estilo = "border-ok bg-ok-suave";
                  simbolo = "✔";
                } else if (marcada) {
                  estilo = "border-erro bg-erro-suave";
                  simbolo = "✖";
                } else estilo = "border-neutral-200 opacity-80";
              }
              return (
                <button
                  key={alt.letra}
                  type="button"
                  disabled={comCorrecao}
                  onClick={() => setSelecionada(alt.letra)}
                  className={`flex w-full gap-3 rounded-xl border-2 p-3 text-left transition disabled:cursor-default ${estilo}`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      comCorrecao && correta
                        ? "bg-ok text-white"
                        : comCorrecao && marcada
                          ? "bg-erro text-white"
                          : marcada
                            ? "bg-dals-700 text-white"
                            : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {simbolo}
                  </span>
                  <span className="flex-1">
                    <span className="block">{alt.texto}</span>
                    {comCorrecao && (correta || marcada) && (
                      <span className={`mt-1 block text-sm ${correta ? "text-ok" : "text-erro"}`}>{alt.comentario}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {!comCorrecao && (
          <div className="border-t border-neutral-100 px-5 py-4">
            <p className="mb-3 text-center text-sm font-semibold text-neutral-700">
              {selecionada ? "Quanta certeza você tem? Clique para confirmar:" : "Escolha uma alternativa (ou tecle A–E)"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {CONFIANCA.map((c) => (
                <button
                  key={c.valor}
                  type="button"
                  disabled={!selecionada}
                  onClick={() => confirmar(c.valor)}
                  className={`rounded-xl px-2 py-3 text-white transition disabled:cursor-not-allowed disabled:opacity-35 ${c.cor}`}
                >
                  <span className="block text-2xl">{c.emoji}</span>
                  <span className="block text-xs font-bold uppercase tracking-wide">{c.rotulo}</span>
                </button>
              ))}
            </div>
            {simulado.modo === "prova" && resposta && (
              <p className="mt-2 text-center text-xs text-neutral-500">Resposta salva ({resposta.letra}). Você pode mudar até finalizar.</p>
            )}
          </div>
        )}

        {comCorrecao && (
          <>
            <div className={`px-5 py-3 text-center font-bold text-white ${acertou ? "bg-ok" : "bg-erro"}`}>
              {!resposta
                ? "Questão não respondida"
                : acertou
                  ? `✔ Correto! ${simulado.modo === "tutor" && !simulado.finalizado ? `Volta para revisão em ${intervalo} dia${intervalo === 1 ? "" : "s"}.` : ""}`
                  : `✖ Incorreto. ${simulado.modo === "tutor" && !simulado.finalizado ? "Ela volta para a sua revisão de hoje." : `A correta é a ${questao.correta}.`}`}
            </div>
            <div className="px-5 pt-4">
              <div className="flex gap-6 border-b border-neutral-200 text-sm font-bold uppercase tracking-wide">
                {(["explicacao", "referencia"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAba(a)}
                    className={`-mb-px border-b-2 pb-2 ${aba === a ? "border-dals-700 text-dals-800" : "border-transparent text-neutral-400"}`}
                  >
                    {a === "explicacao" ? "Explicação" : "Referência"}
                  </button>
                ))}
              </div>
              <div className="py-4 text-sm leading-relaxed text-neutral-800">
                {aba === "explicacao" ? (
                  <>
                    <p className="mb-2 font-bold">Resposta correta: {questao.correta}</p>
                    <p>{questao.explicacao}</p>
                  </>
                ) : (
                  <p>{questao.referencia ?? "Sem referência cadastrada para esta questão."}</p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 px-5 py-3">
          <button type="button" onClick={() => setReportando(true)} className="text-xs font-semibold text-neutral-500 hover:text-erro">
            ⚑ Reportar erro
          </button>
          <span className="ml-auto text-xs text-neutral-400">Turma acerta {questao.acertoTurma}%</span>
        </div>
      </article>

      <div className="mt-4 flex items-center justify-between">
        <Botao variante="fantasma" disabled={numero === 1} onClick={() => navegar(-1)}>
          ← Anterior
        </Botao>
        {ultima ? (
          <Botao onClick={aoFinalizar}>{simulado.finalizado ? "Ver resultado" : "Finalizar simulado"}</Botao>
        ) : (
          <Botao onClick={() => navegar(1)}>Próxima →</Botao>
        )}
      </div>
      <p className="mt-3 hidden text-center text-xs text-neutral-400 sm:block">
        Atalhos: A–E escolhe · 1, 2, 3 confirma · ← → navega
      </p>

      {reportando && <ModalReporte questaoId={questao.id} aoFechar={() => setReportando(false)} />}
    </div>
  );
}

const MOTIVOS = ["Gabarito errado", "Enunciado confuso", "Explicação incompleta", "Erro de digitação", "Outro"];

function ModalReporte({ questaoId, aoFechar }: { questaoId: string; aoFechar: () => void }) {
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [detalhe, setDetalhe] = useState("");
  const [enviado, setEnviado] = useState(false);

  function enviar() {
    reportarErro(questaoId, motivo, detalhe);
    setEnviado(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={aoFechar}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {enviado ? (
          <div className="text-center">
            <div className="text-4xl">🙏</div>
            <p className="mt-2 font-semibold">Obrigado! A diretoria acadêmica vai revisar esta questão.</p>
            <Botao className="mt-4" onClick={aoFechar}>
              Fechar
            </Botao>
          </div>
        ) : (
          <>
            <h3 className="font-display text-xl tracking-wide text-dals-800">Reportar erro na questão</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {MOTIVOS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMotivo(m)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    motivo === m ? "border-dals-700 bg-dals-700 text-white" : "border-neutral-300"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <textarea
              value={detalhe}
              onChange={(e) => setDetalhe(e.target.value)}
              placeholder="Conte o que está errado (opcional)"
              rows={4}
              className="mt-3 w-full rounded-lg border border-neutral-300 p-3 text-sm outline-none focus:border-dals-600"
            />
            <div className="mt-3 flex justify-end gap-2">
              <Botao variante="fantasma" onClick={aoFechar}>
                Cancelar
              </Botao>
              <Botao onClick={enviar}>Enviar</Botao>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
