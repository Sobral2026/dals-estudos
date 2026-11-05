"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { resumoRevisao } from "@/lib/estatisticas";
import { podeAcessarPainel, rotuloPapel } from "@/lib/permissoes";
import { sair, useEstado, useMontado } from "@/lib/store";

const NAV = [
  { href: "/inicio", rotulo: "Início", icone: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" },
  { href: "/questoes", rotulo: "Banco de questões", icone: "M4 5h16M4 12h16M4 19h10" },
  { href: "/biblioteca", rotulo: "Biblioteca", icone: "M5 4h4v16H5zM10 4h4v16h-4zM15.5 4.5l3.5 1-4 15-3.5-1z" },
  { href: "/videos", rotulo: "Vídeos", icone: "M3 6h13v12H3zM16 10l5-3v10l-5-3" },
  { href: "/revisao", rotulo: "Revisão", icone: "M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" },
  { href: "/desempenho", rotulo: "Desempenho", icone: "M5 20V10m7 10V4m7 16v-7" },
  { href: "/trilhas", rotulo: "Trilhas", icone: "M6 4v16M6 6h12l-3 4 3 4H6" },
];

const NAV_PAINEL = { href: "/painel", rotulo: "Painel editorial", icone: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" };

function Icone({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/** Telas que ocupam a tela inteira, sem menu (resolução e impressão). */
function telaCheia(pathname: string) {
  return /^\/simulado\/[^/]+$/.test(pathname) || pathname.startsWith("/questoes/imprimir");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const estado = useEstado();
  const montado = useMontado();
  const pendentes = montado ? resumoRevisao(estado, new Date()).pendentes.length : 0;
  const sessao = estado.sessao;

  if (telaCheia(pathname)) return <>{children}</>;

  const itens = podeAcessarPainel(sessao?.papel) ? [...NAV, NAV_PAINEL] : NAV;

  function encerrar() {
    sair();
    router.push("/");
  }

  const menu = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {itens.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setAberto(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
            pathname.startsWith(item.href)
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
      <Link
        href="/"
        className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-dals-100/80 hover:bg-white/10 hover:text-white"
      >
        <Icone d="M4 5h12v14H6a2 2 0 0 1-2-2zM16 9h4v8a2 2 0 0 1-2 2M8 9h4M8 13h4" />
        <span>Jornal DALS</span>
      </Link>
    </nav>
  );

  const marca = (
    <Link href="/inicio" className="flex items-center gap-3 px-5 py-5" onClick={() => setAberto(false)}>
      <Image src="/dals-emblema.png" alt="Emblema do DALS" width={44} height={44} priority />
      <div className="leading-tight">
        <div className="font-display text-xl font-semibold tracking-wide text-white">DALS</div>
        <div className="text-xs font-semibold uppercase tracking-wider text-dals-200">Estudos</div>
      </div>
    </Link>
  );

  const rodape = (
    <div className="border-t border-white/10 px-5 py-4">
      {sessao && (
        <div className="mb-2">
          <div className="truncate text-sm font-semibold text-white">{sessao.nome}</div>
          <div className="text-xs text-dals-200">
            {rotuloPapel(sessao.papel)} · {sessao.periodo}º período
          </div>
          <button type="button" onClick={encerrar} className="mt-1 text-xs font-semibold text-dals-200 underline hover:text-white">
            Sair
          </button>
        </div>
      )}
      <div className="text-[11px] leading-snug text-dals-200/70">
        Diretório Acadêmico Luiz Sobral · Medicina FMC · protótipo
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col overflow-y-auto bg-dals-800 lg:flex">
        {marca}
        {menu}
        {rodape}
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-dals-800 px-4 py-2 lg:hidden">
        <Link href="/inicio" className="flex items-center gap-2">
          <Image src="/dals-emblema.png" alt="Emblema do DALS" width={32} height={32} />
          <span className="font-display text-lg tracking-wide text-white">DALS Estudos</span>
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
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col overflow-y-auto bg-dals-800">
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
