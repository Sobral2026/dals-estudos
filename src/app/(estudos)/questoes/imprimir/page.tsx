"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Botao } from "@/components/ui";
import { nomeDisciplina, periodoDaDisciplina } from "@/data/disciplinas";
import { nomeAssunto, nomeCompetencia } from "@/data/taxonomia";
import { FORMATOS_PDF, separarParaPdf, type FormatoPdf } from "@/lib/exportacao";
import { registrarExportacao, useEstado } from "@/lib/store";

function Impressao() {
  const params = useSearchParams();
  const { sessao } = useEstado();
  const [formato, setFormato] = useState<FormatoPdf>((params.get("formato") as FormatoPdf) ?? "questoes");
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean);
  const { incluidas, omitidas } = separarParaPdf(ids);
  const hoje = new Date().toLocaleDateString("pt-BR");

  function imprimir() {
    registrarExportacao(formato, incluidas.map((q) => q.id));
    window.print();
  }

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white">
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-4 py-3 print:hidden">
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center gap-3">
          <Link href="/questoes" className="text-sm font-semibold text-dals-700 hover:underline">
            ← Voltar
          </Link>
          <div className="flex flex-wrap gap-2">
            {FORMATOS_PDF.map((f) => (
              <button
                key={f.id}
                type="button"
                title={f.descricao}
                onClick={() => setFormato(f.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${formato === f.id ? "border-dals-700 bg-dals-700 text-white" : "border-neutral-300"}`}
              >
                {f.rotulo}
              </button>
            ))}
          </div>
          <Botao className="ml-auto" disabled={incluidas.length === 0} onClick={imprimir}>
            Salvar em PDF
          </Botao>
        </div>
        <p className="mx-auto mt-2 max-w-[210mm] text-xs text-neutral-500">
          Na janela de impressão, escolha “Salvar como PDF”.
          {omitidas.length > 0 &&
            ` ${omitidas.length} questão(ões) omitida(s) por não terem autorização de reprodução: ${omitidas.join(", ")}.`}
        </p>
      </div>

      <article className="mx-auto my-6 max-w-[210mm] bg-white p-[14mm] text-[11pt] leading-snug shadow print:my-0 print:p-0 print:shadow-none">
        <header className="mb-6 flex items-center gap-4 border-b-4 border-dals-800 pb-3">
          <Image src="/dals-emblema.png" alt="DALS" width={56} height={56} />
          <div className="flex-1">
            <div className="font-display text-2xl tracking-wide text-dals-800">DALS Estudos — Lista de questões</div>
            <div className="text-xs text-neutral-600">
              {incluidas.length} questões · {FORMATOS_PDF.find((f) => f.id === formato)?.rotulo} · gerado em {hoje}
              {sessao && ` por ${sessao.nome}`}
            </div>
          </div>
        </header>

        {incluidas.length === 0 && <p>Nenhuma questão autorizada para exportação nesta seleção.</p>}

        <ol className="space-y-6">
          {incluidas.map((q, i) => (
            <li key={q.id} className="break-inside-avoid">
              <div className="mb-1 text-[9pt] font-bold uppercase tracking-wide text-dals-700">
                Questão {i + 1} · {periodoDaDisciplina(q.disciplina)}º período · {nomeDisciplina(q.disciplina)} · {nomeAssunto(q.assunto)}
              </div>
              <p>{q.enunciado}</p>
              <ol className="mt-2 space-y-1">
                {q.alternativas.map((a) => (
                  <li key={a.letra} className="flex gap-2">
                    <span className="font-bold">{a.letra})</span>
                    <span>{a.texto}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-2 border-t border-dashed border-neutral-300 pt-1 text-[8pt] text-neutral-500">
                Código {q.id} · versão {q.versao} ({q.atualizadaEm}) · Autoria: {q.autoria} · Fonte: {q.fonte} · ENAMED:{" "}
                {nomeCompetencia(q.enamed.competencia)} · {q.licenca}
                {q.referencia && ` · Referência: ${q.referencia}`}
              </p>
            </li>
          ))}
        </ol>

        {formato !== "questoes" && incluidas.length > 0 && (
          <section className="mt-10 break-before-page">
            <h2 className="mb-3 border-b-2 border-dals-800 pb-1 font-display text-xl tracking-wide text-dals-800">
              {formato === "gabarito" ? "Gabarito" : "Gabarito comentado"}
            </h2>
            {formato === "gabarito" ? (
              <div className="grid grid-cols-5 gap-2 text-center">
                {incluidas.map((q, i) => (
                  <div key={q.id} className="rounded border border-neutral-300 py-1">
                    <b>{i + 1}</b> — {q.correta}
                  </div>
                ))}
              </div>
            ) : (
              <ol className="space-y-5">
                {incluidas.map((q, i) => (
                  <li key={q.id} className="break-inside-avoid">
                    <div className="font-bold">
                      Questão {i + 1} — resposta {q.correta}
                    </div>
                    <p className="mt-1">{q.explicacao}</p>
                    <ul className="mt-1 space-y-0.5 text-[10pt]">
                      {q.alternativas.map((a) => (
                        <li key={a.letra}>
                          <b>{a.letra}</b> {a.letra === q.correta ? "(correta)" : ""}: {a.comentario}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        <footer className="mt-10 border-t border-neutral-300 pt-2 text-[8pt] text-neutral-500">
          Diretório Acadêmico Luiz Sobral — Medicina FMC · Uso acadêmico pessoal. Apenas questões com reprodução autorizada são incluídas.
        </footer>
      </article>
    </div>
  );
}

export default function ImprimirQuestoes() {
  return (
    <Suspense>
      <Impressao />
    </Suspense>
  );
}
