"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PlayerSimulado } from "@/components/PlayerSimulado";
import { Carregando } from "@/components/ui";
import { useEstado, useMontado } from "@/lib/store";

export default function PaginaSimulado() {
  const { id } = useParams<{ id: string }>();
  const estado = useEstado();
  const montado = useMontado();
  const simulado = estado.simulados[id];

  if (!montado) return <Carregando />;
  if (!simulado) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4">Simulado não encontrado neste navegador.</p>
        <Link href="/questoes" className="font-bold text-dals-700 hover:underline">
          Voltar ao banco de questões
        </Link>
      </div>
    );
  }
  return <PlayerSimulado simulado={simulado} />;
}
