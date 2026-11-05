"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Botao, Cartao, TituloPagina } from "@/components/ui";
import { DISCIPLINAS, periodoDaDisciplina } from "@/data/disciplinas";
import { ASSUNTOS } from "@/data/taxonomia";
import { TIPOS_MATERIAL, validarAnexo } from "@/lib/biblioteca";
import { enviarMaterial } from "@/lib/store";
import type { TipoMaterial } from "@/lib/types";

const campo = "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 font-normal outline-none focus:border-dals-600";

const DECLARACOES = [
  { id: "autoria", texto: "Declaro que este material é de minha autoria (ou coautoria, com o consentimento dos demais autores)." },
  { id: "autorizaPublicacao", texto: "Autorizo o DALS a publicar este material na Biblioteca do DALS Estudos, com crédito de autoria." },
  {
    id: "semConteudoProibido",
    texto:
      "Declaro que o material NÃO contém livros ou trechos extensos de livros, slides de professores, provas internas da FMC nem qualquer informação que identifique pacientes.",
  },
] as const;

type ChaveDeclaracao = (typeof DECLARACOES)[number]["id"];

export default function EnviarMaterial() {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoMaterial>("resumo");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [assunto, setAssunto] = useState("");
  const [palavras, setPalavras] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [referencias, setReferencias] = useState("");
  const [permiteDownload, setPermiteDownload] = useState(true);
  const [anexo, setAnexo] = useState<{ nome: string; erro: string | null } | null>(null);
  const [declaracao, setDeclaracao] = useState<Record<ChaveDeclaracao, boolean>>({
    autoria: false,
    autorizaPublicacao: false,
    semConteudoProibido: false,
  });

  const declarou = Object.values(declaracao).every(Boolean);
  const valido = titulo.trim() && descricao.trim() && conteudo.trim() && disciplina && declarou && !anexo?.erro;

  function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    setAnexo(arquivo ? { nome: arquivo.name, erro: validarAnexo(arquivo) } : null);
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!valido) return;
    enviarMaterial({
      tipo,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      palavrasChave: palavras
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      periodo: periodoDaDisciplina(disciplina),
      disciplina,
      assunto: assunto || undefined,
      permiteDownload,
      conteudo,
      referencias,
      arquivoNome: anexo?.nome,
      declaracao: { ...declaracao, em: new Date().toISOString() },
    });
    router.push("/biblioteca/meus-envios?enviado=1");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <TituloPagina titulo="Enviar material" subtitulo="Resumos, mapas mentais, questões autorais e roteiros de revisão." />

      <Cartao className="mb-6 bg-dals-50">
        <p className="text-sm text-dals-900">
          <b>Nada é publicado automaticamente.</b> Seu envio passa por: <b>Triagem editorial → Revisão acadêmica → Aprovação → Publicação</b>. Se
          precisar de ajuste, ele volta para você com comentários. Acompanhe em{" "}
          <Link href="/biblioteca/meus-envios" className="font-bold underline">
            Meus envios
          </Link>
          .
        </p>
      </Cartao>

      <form onSubmit={enviar}>
        <Cartao className="space-y-4">
          <label className="block text-sm font-semibold">
            Tipo de material
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoMaterial)} className={campo}>
              {TIPOS_MATERIAL.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Título *
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={120} className={campo} />
          </label>
          <label className="block text-sm font-semibold">
            Descrição curta *
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={240} className={campo} />
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
            Palavras-chave (separadas por vírgula)
            <input value={palavras} onChange={(e) => setPalavras(e.target.value)} className={campo} />
          </label>
          <label className="block text-sm font-semibold">
            Conteúdo *
            <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} rows={10} className={campo} />
            <span className="text-xs font-normal text-neutral-500">Texto simples. Separe parágrafos com uma linha em branco.</span>
          </label>
          <label className="block text-sm font-semibold">
            Referências
            <textarea value={referencias} onChange={(e) => setReferencias(e.target.value)} rows={2} className={campo} />
          </label>
          <label className="block text-sm font-semibold">
            Anexo (opcional: PDF, PNG ou JPG, até 20 MB)
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={aoEscolherArquivo} className="mt-1 block text-sm font-normal" />
            {anexo?.erro && <span className="text-xs text-erro">{anexo.erro}</span>}
            <span className="block text-xs font-normal text-neutral-500">
              Protótipo: o arquivo é validado, mas só o nome fica registrado. No site definitivo, ele vai para armazenamento privado.
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={permiteDownload} onChange={(e) => setPermiteDownload(e.target.checked)} className="accent-dals-700" />
            Autorizo o download do material (desmarque para permitir só a leitura online)
          </label>
        </Cartao>

        <Cartao className="mt-6">
          <h2 className="mb-3 font-display text-lg tracking-wide text-dals-800">Declaração de autoria e autorização *</h2>
          <div className="space-y-3">
            {DECLARACOES.map((d) => (
              <label key={d.id} className="flex gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={declaracao[d.id]}
                  onChange={(e) => setDeclaracao((atual) => ({ ...atual, [d.id]: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-dals-700"
                />
                <span>{d.texto}</span>
              </label>
            ))}
          </div>
          <Botao type="submit" className="mt-5 w-full" disabled={!valido}>
            Enviar para triagem
          </Botao>
          {!declarou && <p className="mt-2 text-center text-xs text-neutral-500">Marque as três declarações para enviar.</p>}
        </Cartao>
      </form>
    </div>
  );
}
