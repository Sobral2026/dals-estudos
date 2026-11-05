# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Estudantes de Medicina da FMC, majoritariamente acessando pelo celular, que estudam para provas da faculdade e para o ENAMED. Também usam a plataforma, com papéis próprios: colaboradores (enviam material), revisores, editores e administradores (fluxo editorial e Jornal). O Jornal DALS é público e atende qualquer visitante.

## Product Purpose

DALS Estudos é uma plataforma de estudo gratuita, mantida pelo Diretório Acadêmico Luiz Sobral (DALS): banco de questões, simulados nos modos tutor e prova, revisão espaçada, desempenho, trilhas, biblioteca colaborativa, vídeos do YouTube e painel editorial. Ao lado dela, o Jornal DALS é o veículo público do diretório. Sucesso: o estudante encontra, pratica e revisa conteúdo confiável da própria grade, com o mínimo de atrito no celular.

## Positioning

Feita pelo diretório acadêmico dos próprios estudantes, gratuita e não comercial, com conteúdo classificado pela grade FMC (período › disciplina › assunto) e pela matriz ENAMED ao mesmo tempo. Professores da faculdade vão encaminhar questões com as respectivas respostas; todo conteúdo passa por fluxo editorial com autoria, fonte, licença e versão rastreáveis.

## Operating Context

- Área pública: `/`, `/jornal`, `/jornal/[slug]`, `/entrar`. Área reservada (exige sessão): início, questões, simulado, resultado, revisão, desempenho, trilhas, biblioteca, vídeos. Painel editorial para revisor, editor ou administrador.
- Fluxo editorial: Envio → Triagem → Revisão acadêmica → Aprovação → Publicação, com devolução, reenvio versionado e retirada justificada.
- Exportação de questões em PDF (só questões, gabarito separado ou comentado), apenas de itens que permitem download.

## Capabilities and Constraints

- Estado atual: **protótipo**, não o site definitivo. Next.js 15 + React 19 + Tailwind 4, componentes de cliente, estado em `localStorage`, sem backend. Login de demonstração sem senha (escolha de papel).
- Taxonomias (períodos/disciplinas FMC, áreas ENAMED) e a "média da turma" são **dados de exemplo** e devem continuar rotulados assim até haver dados oficiais.
- Em aberto: endosso institucional formal da FMC além do envio de questões pelos professores; autenticação real e verificação de vínculo.

## Brand Commitments

- Nome: DALS Estudos (plataforma) e Jornal DALS (público), do Diretório Acadêmico Luiz Sobral — Medicina FMC.
- Tom: acadêmico, cooperativo, confiável, não comercial.
- Identidade a preservar: paleta verde-escura (tokens `--color-dals-*` em `src/app/globals.css`, principal `#14382f`), branco e neutros, cores de status ok/alerta/erro/info; fontes Oswald (display) e Nunito Sans (texto); emblema `public/dals-emblema.png`; menu lateral e layout em cards.

## Evidence on Hand

- Emblema DALS: `public/dals-emblema.png`.
- Conteúdo de exemplo em `src/data/` (questões, disciplinas, taxonomia, trilhas, conteúdo inicial). Não há depoimentos, números de uso nem dados reais de turma: não inventar.
- Plano técnico: `docs/plano-dals-estudos-v2.md`.

## Product Principles

1. Confiança acima de volume: todo conteúdo mostra origem, autoria e estado editorial.
2. Celular primeiro: o estudo acontece em telas pequenas e momentos curtos.
3. Cooperativo, não comercial: nada de linguagem de venda, urgência artificial ou gamificação apelativa.
4. Honestidade com dados: exemplo é rotulado como exemplo.

## Accessibility & Inclusion

Meta: WCAG 2.2 AA (contraste, navegação por teclado, nomes acessíveis, alvos de toque adequados no celular).
