"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SugerirMelhoria } from "@/components/Colaboracao";
import { Botao, Cartao, SeloStatus } from "@/components/ui";
import { nomeDisciplina } from "@/data/disciplinas";
import { nomeAssunto } from "@/data/taxonomia";
import { rotuloTipo, TOM_STATUS, versaoAtual } from "@/lib/biblioteca";
import { paragrafos } from "@/lib/jornal";
import { podeAcessarPainel, rotuloPapel, ROTULO_STATUS } from "@/lib/permissoes";
import { useEstado } from "@/lib/store";

export default function MaterialDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { materiais = [], sessao } = useEstado();
  const m = materiais.find((x) => x.id === id);
  // Material não publicado: só o autor e a equipe editorial veem.
  const podeVer = m && (m.status === "publicado" || m.autor === sessao?.nome || podeAcessarPainel(sessao?.papel));

  if (!m || !podeVer) {
    return (
      <p className="text-sm">
        Material não encontrado ou ainda não publicado.{" "}
        <Link href="/biblioteca" className="font-bold text-dals-700 hover:underline">
          Voltar à Biblioteca
        </Link>
      </p>
    );
  }

  const versao = versaoAtual(m);
  const podeBaixar = m.status === "publicado" && m.permiteDownload;

  function baixar() {
    const texto = `${m!.titulo}\n${"=".repeat(m!.titulo.length)}\n\nAutor: ${m!.autor}\nVersão: ${versao.numero} (${new Date(versao.em).toLocaleDateString("pt-BR")})\nFonte: DALS Estudos — Biblioteca\n\n${versao.conteudo}\n\nReferências: ${versao.referencias}\n`;
    const url = URL.createObjectURL(new Blob([texto], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${m!.titulo.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}-v${versao.numero}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/biblioteca" className="hover:underline">
          Biblioteca
        </Link>{" "}
        / <span className="font-semibold text-neutral-800">{m.titulo}</span>
      </nav>

      <Cartao>
        <div className="flex flex-wrap items-center gap-2">
          <SeloStatus texto={rotuloTipo(m.tipo)} tom="info" />
          {m.status !== "publicado" && <SeloStatus texto={ROTULO_STATUS[m.status]} tom={TOM_STATUS[m.status]} />}
        </div>
        <h1 className="mt-2 font-display text-3xl tracking-wide text-dals-800">{m.titulo}</h1>
        <p className="mt-1 text-neutral-600">{m.descricao}</p>
        <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <div>
            <dt className="inline font-semibold">Autor: </dt>
            <dd className="inline">{m.autor}</dd>
          </div>
          {(m.colaboradores?.length ?? 0) > 0 && (
            <div>
              <dt className="inline font-semibold">Colaboradores: </dt>
              <dd className="inline">{m.colaboradores!.join(", ")}</dd>
            </div>
          )}
          <div>
            <dt className="inline font-semibold">Atualizado em: </dt>
            <dd className="inline">{new Date(m.atualizadoEm).toLocaleDateString("pt-BR")}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Versão: </dt>
            <dd className="inline">{versao.numero}</dd>
          </div>
          {m.disciplina && (
            <div>
              <dt className="inline font-semibold">Classificação: </dt>
              <dd className="inline">
                {m.periodo}º período · {nomeDisciplina(m.disciplina)}
                {m.assunto && ` › ${nomeAssunto(m.assunto)}`}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 space-y-3 border-t border-neutral-100 pt-5 leading-relaxed">
          {paragrafos(versao.conteudo).map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
        {versao.arquivoNome && (
          <p className="mt-4 text-xs text-neutral-500">Anexo informado no envio: {versao.arquivoNome} (o protótipo não armazena arquivos).</p>
        )}

        <div className="mt-6 rounded-xl bg-dals-50 p-4 text-sm">
          <b>Referências:</b> {versao.referencias || "não informadas"}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Botao onClick={baixar} disabled={!podeBaixar}>
            Baixar material
          </Botao>
          {!m.permiteDownload && <span className="text-xs text-neutral-500">O autor autorizou apenas a leitura online.</span>}
        </div>
      </Cartao>

      {m.status === "publicado" && <SugerirMelhoria material={m} />}

      <Cartao className="mt-6">
        <h2 className="mb-3 font-display text-lg tracking-wide text-dals-800">Histórico de versões</h2>
        <ol className="space-y-2 text-sm">
          {[...m.versoes].reverse().map((v) => (
            <li key={v.numero} className="border-l-2 border-dals-200 pl-3">
              <b>Versão {v.numero}</b> · {v.autor ?? m.autor} · {new Date(v.em).toLocaleDateString("pt-BR")}
              <div className="text-neutral-600">{v.notas}</div>
            </li>
          ))}
        </ol>
      </Cartao>

      {(m.autor === sessao?.nome || podeAcessarPainel(sessao?.papel)) && (
        <Cartao className="mt-6">
          <h2 className="mb-3 font-display text-lg tracking-wide text-dals-800">Histórico editorial</h2>
          <ol className="space-y-2 text-sm">
            {m.eventos.map((e, i) => (
              <li key={i} className="border-l-2 border-dals-200 pl-3">
                <b>{ROTULO_STATUS[e.para]}</b> · {e.ator} ({rotuloPapel(e.papel)}) · {new Date(e.em).toLocaleString("pt-BR")}
                {e.comentario && <div className="text-neutral-600">“{e.comentario}”</div>}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-neutral-500">{m.versoes.length} versão(ões) registrada(s).</p>
        </Cartao>
      )}
    </div>
  );
}
