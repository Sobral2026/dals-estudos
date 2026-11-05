import Link from "next/link";
import { useEffect, useRef } from "react";

export function Cartao({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`rounded-2xl border border-black/5 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

export function TituloPagina({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl font-semibold tracking-wide text-dals-800">{titulo}</h1>
      {subtitulo && <p className="mt-1 text-sm text-neutral-600">{subtitulo}</p>}
    </div>
  );
}

const ESTILO_BOTAO = {
  primario: "bg-dals-700 text-white hover:bg-dals-800 disabled:bg-neutral-300",
  secundario: "border border-dals-700 text-dals-700 hover:bg-dals-50 disabled:opacity-50",
  fantasma: "text-dals-700 hover:bg-dals-50",
};

type VarianteBotao = keyof typeof ESTILO_BOTAO;

export function Botao({
  variante = "primario",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: VarianteBotao }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition disabled:cursor-not-allowed ${ESTILO_BOTAO[variante]} ${className}`}
    />
  );
}

export function BotaoLink({
  href,
  variante = "primario",
  className = "",
  children,
}: {
  href: string;
  variante?: VarianteBotao;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition ${ESTILO_BOTAO[variante]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function AnelProgresso({ valor, tamanho = 64, cor = "var(--color-dals-600)" }: { valor: number; tamanho?: number; cor?: string }) {
  const raio = (tamanho - 8) / 2;
  const circ = 2 * Math.PI * raio;
  return (
    <svg width={tamanho} height={tamanho} className="-rotate-90" aria-hidden>
      <circle cx={tamanho / 2} cy={tamanho / 2} r={raio} fill="none" stroke="#e5e7eb" strokeWidth={6} />
      <circle
        cx={tamanho / 2}
        cy={tamanho / 2}
        r={raio}
        fill="none"
        stroke={cor}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - Math.min(valor, 100) / 100)}
      />
    </svg>
  );
}

export function BarraProgresso({ valor, cor = "bg-dals-600" }: { valor: number; cor?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
      <div className={`h-full rounded-full ${cor}`} style={{ width: `${Math.min(valor, 100)}%` }} />
    </div>
  );
}

export function Estatistica({
  rotulo,
  valor,
  detalhe,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  detalhe: string;
  destaque?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 text-center ${destaque ? "border-dals-600 bg-dals-50" : "border-neutral-200"}`}>
      <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">{rotulo}</div>
      <div className="mt-1 font-display text-3xl font-semibold text-dals-800">{valor}</div>
      <div className="text-xs text-neutral-500">{detalhe}</div>
    </div>
  );
}

export function BarrasRevisao({ hoje, atrasada, muitoAtrasada }: { hoje: number; atrasada: number; muitoAtrasada: number }) {
  const linhas = [
    { rotulo: "Para hoje", valor: hoje, cor: "bg-ok" },
    { rotulo: "Atrasadas", valor: atrasada, cor: "bg-alerta" },
    { rotulo: "Muito atrasadas", valor: muitoAtrasada, cor: "bg-erro" },
  ];
  return (
    <div className="space-y-2">
      {linhas.map((l) => (
        <div key={l.rotulo} className="flex items-center gap-3">
          <div className={`flex h-10 w-14 items-center justify-center rounded-md font-display text-lg font-semibold text-white ${l.cor}`}>
            {l.valor}
          </div>
          <span className="text-sm text-neutral-700">{l.rotulo}</span>
        </div>
      ))}
    </div>
  );
}

export function Checkbox({
  marcado,
  indeterminado = false,
  aoMudar,
  rotulo,
  extra,
}: {
  marcado: boolean;
  indeterminado?: boolean;
  aoMudar: (v: boolean) => void;
  rotulo: string;
  extra?: React.ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminado;
  }, [indeterminado]);
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-dals-50">
      <input
        ref={ref}
        type="checkbox"
        checked={marcado}
        onChange={(e) => aoMudar(e.target.checked)}
        className="h-4 w-4 accent-dals-700"
      />
      <span className="flex-1 text-sm">{rotulo}</span>
      {extra}
    </label>
  );
}

export function AvisoExemplo({ children }: { children: React.ReactNode }) {
  return (
    <div role="note" className="mb-6 rounded-xl border border-alerta/60 bg-alerta-suave px-4 py-3 text-sm text-neutral-800">
      {children}
    </div>
  );
}

export function SeloStatus({ texto, tom }: { texto: string; tom: "ok" | "alerta" | "erro" | "info" | "neutro" }) {
  const cores = {
    ok: "bg-ok-suave text-ok",
    alerta: "bg-alerta-suave text-[#8a6100]",
    erro: "bg-erro-suave text-erro",
    info: "bg-info-suave text-info",
    neutro: "bg-neutral-100 text-neutral-600",
  };
  return <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${cores[tom]}`}>{texto}</span>;
}

export function Carregando() {
  return <div className="py-20 text-center text-sm text-neutral-500">Carregando…</div>;
}
