# AGENTS.md — Convenções do agente Codex

- Idioma da documentação, UI e respostas: **pt-BR**. Código, tipos e nomes de arquivos em inglês, quando apropriado.
- Monorepo TypeScript estrito, pnpm workspaces; evitar `any` e casts desnecessários.
- Preferir código legível e testável, serviços e componentes pequenos. Evitar dependências supérfluas.
- Seguir `00-LEIA-PRIMEIRO.md` e fases em `etapas/` sequencialmente; atualizar `docs/PROGRESS.md` e `docs/DECISIONS.md`.
- Antes de mudanças, inspecionar arquivos, versões e Git; mudanças incrementais. `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` ao final de etapas aplicáveis.
- Não redesenhar a esfera Néia: utilizar exatamente a imagem entregue, otimizada para exibição sem alterar sua aparência. Nunca usar imagem gerada remotamente no lugar do asset.
- Sem falsas capacidades: não alegar consultas a dados reais em modo demo, nem dados de livraria/eventos se não houver fonte conectada.
- Segurança por padrão: isolamento por sessão e organização/origem, validação no backend, CSP ajustada, acesso admin separado, secrets apenas no servidor.
- Sem publicar em produção, dar push ou mexer em ambiente externo sem autorização do usuário.
- Quando uma fase estiver bloqueada externamente, documentar e avançar no que é possível; no encerramento separar feito, verificado e pendente.
