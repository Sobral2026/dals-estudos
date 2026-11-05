"use client";

import Image from "next/image";
import Link from "next/link";
import { useEstado, useMontado } from "@/lib/store";

/** Ambiente público (Jornal DALS): acesso sem login. */
export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  const { sessao } = useEstado();
  const montado = useMontado();
  const logado = montado && !!sessao;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/dals-emblema.png" alt="Emblema do DALS" width={40} height={40} priority />
            <div className="leading-tight">
              <div className="font-display text-xl font-semibold tracking-wide text-dals-800">Jornal DALS</div>
              <div className="hidden text-[11px] font-semibold uppercase tracking-wider text-dals-600 sm:block">
                Diretório Acadêmico Luiz Sobral · Medicina FMC
              </div>
            </div>
          </Link>
          <nav className="ml-auto flex items-center gap-1 text-sm font-semibold sm:gap-3">
            <Link href="/jornal" className="rounded-md px-2 py-1.5 text-dals-800 hover:bg-dals-50">
              Notícias
            </Link>
            <Link
              href={logado ? "/inicio" : "/entrar"}
              className="rounded-lg bg-dals-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-dals-800 sm:text-sm"
            >
              {logado ? "Meus estudos" : "DALS Estudos"}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-dals-800 text-dals-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© Diretório Acadêmico Luiz Sobral — Medicina FMC</span>
          <span className="text-xs text-dals-200">Protótipo · conteúdo de exemplo</span>
        </div>
      </footer>
    </div>
  );
}
