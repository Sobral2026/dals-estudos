"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Carregando } from "@/components/ui";
import { useEstado, useMontado } from "@/lib/store";

/**
 * Área reservada: exige sessão.
 * PROTÓTIPO: a verificação é feita no navegador, com sessão de demonstração.
 * No site definitivo, a proteção será no servidor (middleware + banco com RLS).
 */
export default function LayoutEstudos({ children }: { children: React.ReactNode }) {
  const montado = useMontado();
  const { sessao } = useEstado();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (montado && !sessao) router.replace(`/entrar?volta=${encodeURIComponent(pathname)}`);
  }, [montado, sessao, router, pathname]);

  if (!montado || !sessao) return <Carregando />;
  return <AppShell>{children}</AppShell>;
}
