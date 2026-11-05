# DALS Estudos — protótipo

Protótipo do **Jornal DALS** (público) e do **DALS Estudos** (área reservada) do
Diretório Acadêmico Luiz Sobral — Medicina FMC. **Não é o site definitivo.**
O plano técnico completo está em `docs/plano-dals-estudos-v2.md`.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # testes unitários (Vitest)
npm run lint
npm run build    # não rode com o "dev" ligado: os dois disputam a pasta .next
```

## Ambientes e rotas

| Ambiente | Rotas | Acesso |
|---|---|---|
| Público — Jornal DALS | `/`, `/jornal`, `/jornal/[slug]`, `/entrar` | Sem login |
| Reservado — DALS Estudos | `/inicio`, `/questoes`, `/questoes/imprimir`, `/simulado/[id]`, `/simulado/[id]/resultado`, `/biblioteca`, `/biblioteca/enviar`, `/biblioteca/meus-envios`, `/biblioteca/[id]`, `/revisao`, `/desempenho`, `/trilhas` | Exige sessão |
| Painel editorial | `/painel` | Revisor, editor ou administrador |

**Login de demonstração:** `/entrar` não tem senha nem verifica vínculo com a FMC. Você escolhe um papel
(estudante, colaborador, revisor, editor, administrador) para testar as permissões. A proteção é feita no
navegador. No site definitivo, ela vai para o servidor e para o banco de dados.

## O que o protótipo demonstra

- **Dupla classificação:**
  - Período FMC › disciplina › assunto › subassunto.
  - ENAMED: área › competência › habilidade › tema clínico.
  - Dificuldade.
  - A mesma questão aparece nos dois modelos, sem duplicação.
  - ⚠️ Todas as listas são **exemplo** (`TAXONOMIA_VALIDADA = false`). Não são a grade oficial da FMC nem a matriz do INEP.
- **Exportação PDF** (`/questoes/imprimir`): só questões, gabarito separado ou gabarito comentado. Só entram questões com
  `permiteDownload`. Cada questão traz código, versão, autoria, fonte, licença e referência.
- **Biblioteca:** busca, filtros e download só de material autorizado. "Enviar material" exige declaração de autoria e autorização.
- **Fluxo editorial:** Envio → Triagem → Revisão acadêmica → Aprovação → Publicação, com devolução (e reenvio
  versionado) e retirada sempre justificadas. As regras estão em `src/lib/permissoes.ts`.
- **Painel:** fluxo editorial, questões, reportes de erro, Jornal (rascunho/publicar/arquivar), papéis e auditoria.
- **Revisão espaçada e desempenho:** lógica original preservada; desempenho também por competência ENAMED, com recomendações.

## Armazenamento (protótipo)

- **Conteúdo fixo** em `src/data/`: questões, disciplinas, taxonomia, trilhas e conteúdo inicial de exemplo.
- **Estado** no `localStorage`, chave `dals-questoes:v1` (schema v2), via `src/lib/store.ts`:
  progresso, revisão, simulados, sessão demo, biblioteca, jornal e auditoria.
  - A migração do v1 **só acrescenta campos**; o progresso existente é preservado (há teste em `store.test.ts`).
  - "Apagar meu progresso" (em `/revisao`) apaga só o estudo; biblioteca, jornal e auditoria são mantidos.
- **Média da turma:** dado **de exemplo** e rotulado assim na interface. Em produção, só valores reais e agregados.

## Limitações conhecidas

- O gabarito das questões é enviado ao navegador (no protótipo, o modo prova pode ser burlado). A correção no servidor depende do banco.
- Anexos da biblioteca são validados (PDF/PNG/JPG, até 20 MB), mas só o nome é guardado.
- Cadastro e edição de questões pelo painel ainda não existem: as questões ficam em `src/data/questoes.ts`.
