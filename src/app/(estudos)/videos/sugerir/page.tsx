"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Botao, Cartao, TituloPagina } from "@/components/ui";
import { PlayerYoutube } from "@/components/VideoYoutube";
import { DISCIPLINAS, periodoDaDisciplina } from "@/data/disciplinas";
import { ASSUNTOS } from "@/data/taxonomia";
import { sugerirVideo, useEstado } from "@/lib/store";
import { extrairIdYoutube } from "@/lib/videos";

const campo = "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 font-normal outline-none focus:border-dals-600";

export default function SugerirVideo() {
  const router = useRouter();
  const { videos = [] } = useEstado();
  const [link, setLink] = useState("");
  const [titulo, setTitulo] = useState("");
  const [canal, setCanal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [assunto, setAssunto] = useState("");
  const [palavras, setPalavras] = useState("");
  const [publicoEIncorporavel, setPublico] = useState(false);
  const [semConteudoProibido, setSemProibido] = useState(false);

  const youtubeId = extrairIdYoutube(link);
  const jaExiste = youtubeId ? videos.find((v) => v.youtubeId === youtubeId && v.status !== "retirado") : undefined;
  const valido = youtubeId && !jaExiste && titulo.trim() && canal.trim() && disciplina && publicoEIncorporavel && semConteudoProibido;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!valido || !youtubeId) return;
    sugerirVideo({
      youtubeId,
      titulo: titulo.trim(),
      canal: canal.trim(),
      descricao: descricao.trim(),
      palavrasChave: palavras
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      disciplina,
      periodo: periodoDaDisciplina(disciplina),
      assunto: assunto || undefined,
      declaracao: { publicoEIncorporavel, semConteudoProibido, em: new Date().toISOString() },
    });
    router.push("/videos");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <TituloPagina titulo="Sugerir vídeo" subtitulo="Cole o link de um vídeo do YouTube sobre alguma matéria do curso." />
      <Cartao className="mb-6 bg-dals-50 text-sm text-dals-900">
        Sua sugestão passa por <b>triagem editorial → revisão acadêmica → aprovação → publicação</b> antes de aparecer para todos. Ela aparece em
        &ldquo;Minhas sugestões em análise&rdquo;, na página de Vídeos.
      </Cartao>

      <form onSubmit={enviar}>
        <Cartao className="space-y-4">
          <label className="block text-sm font-semibold">
            Link do YouTube *
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=… ou https://youtu.be/…"
              inputMode="url"
              className={campo}
            />
            {link && !youtubeId && <span className="text-xs text-erro">Link inválido. Use um link de vídeo do youtube.com ou youtu.be.</span>}
            {jaExiste && <span className="text-xs text-erro">Este vídeo já foi sugerido ({jaExiste.titulo}).</span>}
          </label>

          {youtubeId && !jaExiste && (
            <div>
              <p className="mb-2 text-xs font-semibold text-neutral-500">Pré-visualização: confira se é o vídeo certo.</p>
              <PlayerYoutube youtubeId={youtubeId} titulo="Pré-visualização" />
            </div>
          )}

          <label className="block text-sm font-semibold">
            Título *
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={140} className={campo} />
          </label>
          <label className="block text-sm font-semibold">
            Canal / autor *
            <input value={canal} onChange={(e) => setCanal(e.target.value)} maxLength={80} className={campo} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Disciplina *
              <select
                value={disciplina}
                onChange={(e) => {
                  setDisciplina(e.target.value);
                  setAssunto("");
                }}
                className={campo}
              >
                <option value="">Escolha</option>
                {DISCIPLINAS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.periodo}º período · {d.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Assunto
              <select value={assunto} onChange={(e) => setAssunto(e.target.value)} className={campo} disabled={!disciplina}>
                <option value="">Não especificado</option>
                {ASSUNTOS.filter((a) => a.disciplina === disciplina).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.pai ? `└ ${a.nome}` : a.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Por que este vídeo é bom? (opcional)
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} maxLength={600} className={campo} />
          </label>
          <label className="block text-sm font-semibold">
            Palavras-chave (separadas por vírgula)
            <input value={palavras} onChange={(e) => setPalavras(e.target.value)} className={campo} />
          </label>
        </Cartao>

        <Cartao className="mt-6">
          <h2 className="mb-3 font-display text-lg tracking-wide text-dals-800">Declaração *</h2>
          <label className="flex gap-3 text-sm">
            <input type="checkbox" checked={publicoEIncorporavel} onChange={(e) => setPublico(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-dals-700" />
            <span>O vídeo é público no YouTube e o canal permite a incorporação em outros sites.</span>
          </label>
          <label className="mt-3 flex gap-3 text-sm">
            <input type="checkbox" checked={semConteudoProibido} onChange={(e) => setSemProibido(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-dals-700" />
            <span>
              Não é gravação de aula ou de professor feita sem autorização, não é conteúdo pirateado e não expõe pacientes nem dados que os
              identifiquem.
            </span>
          </label>
          <Botao type="submit" className="mt-5 w-full" disabled={!valido}>
            Enviar sugestão
          </Botao>
        </Cartao>
      </form>
    </div>
  );
}
