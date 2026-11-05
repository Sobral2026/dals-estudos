"use client";

import { useRouter } from "next/navigation";
import { BarrasRevisao, Botao, Cartao, TituloPagina } from "@/components/ui";
import { resumoRevisao } from "@/lib/estatisticas";
import { criarSimulado, limparProgresso, useEstado } from "@/lib/store";

export default function Revisao() {
  const router = useRouter();
  const estado = useEstado();
  const r = resumoRevisao(estado, new Date());
  const maiorBarra = Math.max(...r.maestria, 1);

  function responder() {
    const id = criarSimulado("Revisão do dia", "tutor", r.pendentes);
    router.push(`/simulado/${id}`);
  }

  function zerar() {
    if (window.confirm("Apagar todo o seu histórico, revisões e simulados deste navegador?")) limparProgresso();
  }

  return (
    <div>
      <TituloPagina titulo="Revisão espaçada" subtitulo="Cada questão volta no momento certo para você não esquecer." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Cartao>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl tracking-wide text-dals-800">Pendentes</h2>
              <p className="text-xs text-neutral-500">Questões que precisam voltar</p>
            </div>
            <div className="rounded-xl border border-neutral-200 px-4 py-2 text-center">
              <div className="text-xs text-neutral-500">Para hoje</div>
              <div className="font-display text-2xl font-semibold text-dals-800">{r.pendentes.length}</div>
            </div>
          </div>
          <BarrasRevisao hoje={r.hoje} atrasada={r.atrasada} muitoAtrasada={r["muito-atrasada"]} />
          <Botao className="mt-5 w-full" disabled={r.pendentes.length === 0} onClick={responder}>
            Responder pendentes
          </Botao>
        </Cartao>

        <Cartao>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl tracking-wide text-dals-800">Nível de domínio</h2>
              <p className="text-xs text-neutral-500">Questões por acertos seguidos</p>
            </div>
            <div className="rounded-xl border border-neutral-200 px-4 py-2 text-center">
              <div className="text-xs text-neutral-500">No baralho</div>
              <div className="font-display text-2xl font-semibold text-dals-800">{r.total}</div>
            </div>
          </div>
          <div className="flex h-40 items-end gap-3 border-b border-neutral-200 pb-1">
            {r.maestria.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-xs font-bold text-neutral-600">{v}</span>
                <div
                  className={`w-full rounded-t-md ${i === 0 ? "bg-erro/70" : i >= 4 ? "bg-dals-600" : "bg-ok/60"}`}
                  style={{ height: `${(v / maiorBarra) * 110}px` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex gap-3 text-center text-xs text-neutral-500">
            {["0", "1", "2", "3", "4", "5+"].map((l) => (
              <span key={l} className="flex-1">
                {l}
              </span>
            ))}
          </div>
        </Cartao>
      </div>

      <Cartao className="mt-6">
        <h2 className="mb-2 font-display text-lg tracking-wide text-dals-800">Como funciona</h2>
        <ul className="space-y-1 text-sm text-neutral-700">
          <li>❌ <b>Errou:</b> a questão volta hoje mesmo.</li>
          <li>😟 <b>Acertou chutando:</b> volta em 1 dia · 😐 <b>Acho que sei:</b> 2 dias · 😄 <b>Tenho certeza:</b> 4 dias.</li>
          <li>🔁 A cada novo acerto seguido, o intervalo dobra (4 → 8 → 16 dias…).</li>
          <li>🟡 Atrasada: passou 1 dia do prazo · 🔴 Muito atrasada: mais de 7 dias.</li>
        </ul>
        <p className="mt-3 text-xs text-neutral-500">
          Protótipo: seu progresso fica salvo só neste navegador.{" "}
          <button type="button" onClick={zerar} className="font-semibold text-erro hover:underline">
            Apagar meu progresso
          </button>
        </p>
      </Cartao>
    </div>
  );
}
