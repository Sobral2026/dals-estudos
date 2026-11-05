"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Botao } from "@/components/ui";
import { PAPEIS } from "@/lib/permissoes";
import { entrarDemo } from "@/lib/store";
import type { Papel } from "@/lib/types";

function FormularioEntrada() {
  const router = useRouter();
  const volta = useSearchParams().get("volta");
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState<Papel>("estudante");
  const [periodo, setPeriodo] = useState(1);

  function entrar(e: React.FormEvent) {
    e.preventDefault();
    entrarDemo({ nome: nome.trim() || "Estudante", papel, periodo });
    // Só aceita retorno para rotas internas.
    router.push(volta?.startsWith("/") && !volta.startsWith("//") ? volta : "/inicio");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-wide text-dals-800">Entrar no DALS Estudos</h1>
      <p className="mt-1 text-sm text-neutral-600">Área gratuita e exclusiva para estudantes da FMC.</p>

      <div className="mt-5 rounded-xl border border-alerta bg-alerta-suave p-4 text-sm text-neutral-800">
        <b>Modo demonstração.</b> Esta tela não tem senha e não verifica o vínculo com a FMC. Ela simula os papéis de acesso. No site
        definitivo, o cadastro terá autenticação segura e verificação de vínculo acadêmico.
      </div>

      <form onSubmit={entrar} className="mt-6 space-y-5">
        <label className="block text-sm font-semibold">
          Seu nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Como quer ser identificado"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-dals-600"
          />
        </label>

        <label className="block text-sm font-semibold">
          Período
          <select
            value={periodo}
            onChange={(e) => setPeriodo(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-dals-600"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>
                {p}º período
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="text-sm font-semibold">Entrar como (demonstração de permissões)</legend>
          <div className="mt-2 space-y-2">
            {PAPEIS.map((p) => (
              <label
                key={p.id}
                className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${papel === p.id ? "border-dals-600 bg-dals-50" : "border-neutral-200"}`}
              >
                <input type="radio" name="papel" checked={papel === p.id} onChange={() => setPapel(p.id)} className="mt-1 accent-dals-700" />
                <span>
                  <span className="block text-sm font-bold">{p.rotulo}</span>
                  <span className="block text-xs text-neutral-600">{p.descricao}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <Botao type="submit" className="w-full">
          Entrar
        </Botao>
      </form>
    </div>
  );
}

export default function Entrar() {
  return (
    <Suspense>
      <FormularioEntrada />
    </Suspense>
  );
}
