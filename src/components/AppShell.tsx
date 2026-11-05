"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { resumoRevisao } from "@/lib/estatisticas";
import { useEstado, useMontado } from "@/lib/store";

const NAV = [
  { href: "/", rotulo: "Início", icone: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" },
  { href: "/questoes", rotulo: "Banco de questões", icone: "M4 5h16M4 12h16M4 19h10" },
  { href: "/revisao", rotulo: "Revisão", icone: "M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" },
  { href: "/desempenho", rotulo: "Desempenho", icone: "M5 20V10m7 10V4m7 16v-7" },
  { href: "/trilhas", rotulo: "Trilhas", icone: "M6 4v16M6 6h12l-3 4 3 4H6" },
];

function Icone({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

function ativo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const estado = useEstado();
  const montado = useMontado();
  const pendentes = montado ? resumoRevisao(estado, new Date()).pendentes.length : 0;

  // A resolução de questões ocupa a tela inteira, sem menu (foco total).
  if (/^\/simulado\/[^/]+$/.test(pathname)) return <>{children}</>;

  const menu = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setAberto(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
            ativo(pathname, item.href)
              ? "bg-white/15 text-white"
              : "text-dals-100/80 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icone d={item.icone} />
          <span className="flex-1">{item.rotulo}</span>
          {item.href === "/revisao" && pendentes > 0 && (
            <span className="rounded-full bg-alerta px-2 py-0.5 text-xs font-bold text-dals-950">{pendentes}</span>
          )}
        </Link>
      ))}
    </nav>
  );

  const marca = (
    <Link href="/" className="flex items-center gap-3 px-5 py-5" onClick={() => setAberto(false)}>
      <Image src="/dals-emblema.png" alt="Emblema do DALS" width={44} height={44} priority />
      <div className="leading-tight">
        <div className="font-display text-xl font-semibold tracking-wide text-white">DALS</div>
        <div className="text-xs font-semibold uppercase tracking-wider text-dals-200">Questões</div>
      </div>
    </Link>
  );

  const rodape = (
    <div className="px-5 py-4 text-[11px] leading-snug text-dals-200/70">
      Diretório Acadêmico Luiz Sobral
      <br />
      Medicina FMC · protótipo
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-dals-800 lg:flex">
        {marca}
        {menu}
        {rodape}
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-dals-800 px-4 py-2 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/dals-emblema.png" alt="Emblema do DALS" width={32} height={32} />
          <span className="font-display text-lg tracking-wide text-white">DALS Questões</span>
        </Link>
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="rounded-md p-2 text-white hover:bg-white/10"
          aria-label="Abrir menu"
        >
          <Icone d="M4 6h16M4 12h16M4 18h16" />
        </button>
      </header>

      {aberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAberto(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-dals-800">
            {marca}
            {menu}
            {rodape}
          </aside>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
