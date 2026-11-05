"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Botao, Cartao, SeloStatus } from "@/components/ui";
import { PlayerYoutube } from "@/components/VideoYoutube";
import { nomeDisciplina } from "@/data/disciplinas";
import { QUESTOES } from "@/data/questoes";
import { nomeAssunto } from "@/data/taxonomia";
import { TOM_STATUS } from "@/lib/biblioteca";
import { podeAcessarPainel, rotuloPapel, ROTULO_STATUS } from "@/lib/permissoes";
import { criarSimulado, useEstado } from "@/lib/store";
import { urlYoutube } from "@/lib/videos";

export default function AssistirVideo() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { videos = [], sessao } = useEstado();
  const v = videos.find((x) => x.id === id);
  // Vídeo não publicado: só quem sugeriu e a equipe editorial veem.
  const podeVer = v && (v.status === "publicado" || v.sugeridoPor === sessao?.nome || podeAcessarPainel(sessao?.papel));

  if (!v || !podeVer) {
    return (
      <p className="text-sm">
        Vídeo não encontrado ou ainda não publicado.{" "}
        <Link href="/videos" className="font-bold text-dals-700 hover:underline">
          Voltar aos vídeos
        </Link>
      </p>
    );
  }

  const questoesDoTema = QUESTOES.filter(
    (q) => (v.assunto && (q.assunto === v.assunto || q.subassunto === v.assunto)) || (!v.assunto && q.disciplina === v.disciplina),
  );

  function praticar() {
    const simuladoId = criarSimulado(`Questões: ${v!.titulo}`, "tutor", questoesDoTema.map((q) => q.id));
    router.push(`/simulado/${simuladoId}`);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/videos" className="hover:underline">
          Vídeos
        </Link>{" "}
        / <span className="font-semibold text-neutral-800">{v.titulo}</span>
      </nav>

      {v.status !== "publicado" && (
        <div className="mb-3">
          <SeloStatus texto={ROTULO_STATUS[v.status]} tom={TOM_STATUS[v.status]} />
        </div>
      )}

      <PlayerYoutube youtubeId={v.youtubeId} titulo={v.titulo} />

      <Cartao className="mt-4">
        <h1 className="font-display text-2xl tracking-wide text-dals-800">{v.titulo}</h1>
        <p className="text-sm text-neutral-600">
          Canal: <b>{v.canal}</b>
          {v.disciplina && ` · ${v.periodo}º período · ${nomeDisciplina(v.disciplina)}`}
          {v.assunto && ` › ${nomeAssunto(v.assunto)}`}
        </p>
        {v.descricao && <p className="mt-3 whitespace-pre-line">{v.descricao}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {questoesDoTema.length > 0 && <Botao onClick={praticar}>Praticar {questoesDoTema.length} questão(ões) do tema</Botao>}
          <a href={urlYoutube(v.youtubeId)} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-dals-700 hover:underline">
            Abrir no YouTube ↗
          </a>
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          Sugerido por {v.sugeridoPor}. O vídeo pertence ao canal de origem e é exibido por incorporação do YouTube; o DALS não hospeda nem
          altera o conteúdo.
        </p>
      </Cartao>

      {(v.sugeridoPor === sessao?.nome || podeAcessarPainel(sessao?.papel)) && (
        <Cartao className="mt-6">
          <h2 className="mb-3 font-display text-lg tracking-wide text-dals-800">Histórico editorial</h2>
          <ol className="space-y-2 text-sm">
            {v.eventos.map((e, i) => (
              <li key={i} className="border-l-2 border-dals-200 pl-3">
                <b>{ROTULO_STATUS[e.para]}</b> · {e.ator} ({rotuloPapel(e.papel)}) · {new Date(e.em).toLocaleString("pt-BR")}
                {e.comentario && <div className="text-neutral-600">“{e.comentario}”</div>}
              </li>
            ))}
          </ol>
        </Cartao>
      )}
    </div>
  );
}
