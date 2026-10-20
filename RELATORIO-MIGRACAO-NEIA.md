# Relatório da migração Népi → Néia

Data: 19/10/2026  
Identidade oficial: **Néia — Inteligência Artificial da FUNEP**

## Resumo

A identidade pública foi atualizada para Néia e os identificadores novos adotam `neia` e `neia-chat`. A interface, API, prompts, widget, painel, metadados, exemplos e documentação refletem a nova marca. O símbolo original foi preservado byte a byte. Nenhum deploy, publicação ou push foi realizado.

## Arquivos e áreas alterados

- Workspace e dependências: `package.json`, `pnpm-lock.yaml` e os manifests em `apps/api`, `apps/web`, `packages/shared` e `packages/widget`; filtros e nome do bundle atualizados para `@neia/*` e `neia-widget.js`.
- API e dados: `apps/api/src/{db,provider,server,session}.ts`, `apps/api/src/server.test.ts`, `apps/api/prisma/schema.prisma`, `apps/api/prisma/seed.ts` e a nova migration `apps/api/prisma/migrations/20261018020000_neia_identity/migration.sql`.
- Web e widget: `apps/web/src/main.tsx`, `apps/web/index.html`, os hosts demonstrativos, testes E2E, `packages/widget/src/index.ts`, `packages/widget/vite.config.ts` e o script de geração do alias legado.
- Marca e documentação: `README.md`, `playwright.config.ts`, `docs/DECISIONS.md`, `docs/INTEGRACAO-WIDGET.md`, `docs/PROGRESS.md` e o conteúdo de `Docs/neia-chat/` (antiga pasta `Docs/nepi-codex/`).
- Assets: o símbolo original foi copiado para os caminhos `neia-*` sem alteração. Os bundles `neia-widget.js` e `nepi-widget.js` são gerados juntos; o segundo serve compatibilidade.

## Identificadores renomeados

- Nome do workspace: `nepi-chat` → `neia-chat`.
- Pacotes internos: `@nepi/*` → `@neia/*`.
- API global do widget: `NeiaWidget`; `NepiWidget` continua como alias.
- Bundle canônico: `/widget/neia-widget.js`; o caminho `/widget/nepi-widget.js` continua servido.
- Atributos canônicos do script: `data-neia-*`; o widget também lê `data-nepi-*`.
- Eventos canônicos do iframe: `neia:*`; eventos `nepi:*` continuam aceitos para instalações anteriores.
- Header canônico de origem: `X-Neia-Host-Origin`; `X-NePi-Host-Origin` continua aceito.
- Chaves novas de armazenamento: `neia-*`; as chaves `nepi-*` são lidas e gravadas temporariamente para preservar a sessão durante a transição.
- IDs das quatro integrações demonstrativas agora começam com `dev-neia-`; cada ID anterior foi gravado como alias.
- O título, a descrição e as mensagens públicas apresentam “Néia — Inteligência Artificial da FUNEP”. A mensagem de boas-vindas segue o texto solicitado.

## Compatibilidade e preservação de dados

A migration adiciona `Integration.installationAliases`, grava os IDs anteriores como aliases e padroniza os IDs locais quando não há colisão. O endpoint de resolução, `/embed` e o painel reconhecem os aliases. A API mantém o header antigo e a nova versão do bundle mantém o caminho antigo. Há uma página `demo-host-legacy.html` que exercita bundle, atributos e ID legados.

A migration foi aplicada ao banco PostgreSQL local existente e o seed atualizou os rótulos. Não houve recriação do banco, mudança de domínio, remoção ou regravação de sessões, conversas ou mensagens. As contagens imediatamente antes e depois da migration/seed foram iguais: **4 integrações, 20 sessões, 22 conversas, 21 mensagens e 0 administradores**. Os E2E executados depois criaram dados de teste no banco local; contagem ao encerrar a validação: **4 integrações, 37 sessões, 39 conversas, 39 mensagens e 0 administradores**. Nenhum dado foi removido. O banco, o usuário local de conexão e o volume Docker continuam com o nome histórico para reusar o volume já preenchido; nenhum valor secreto foi incluído neste relatório.

Não foi necessária migration destrutiva nem há migration pendente para esta mudança.

## Validações

- `pnpm typecheck`: passou nos quatro pacotes/aplicações.
- `pnpm lint`: passou nos quatro pacotes/aplicações.
- `pnpm test`: **5 testes passaram**, incluindo resolução pelo ID legado e leitura autorizada de mensagem persistida.
- `pnpm build`: passou para widget, web e API; gerou os dois caminhos do bundle.
- E2E Chromium, servidores locais limpos: **4 passaram e 2 falharam** na execução sem retry. Os fluxos de painel, acessibilidade, widget novo e widget legado passaram. A suíte também cobriu minimizar, reabrir, fechar e breakpoints; numa execução com retry, o teste de breakpoints passou após uma falha intermitente do navegador.
- A retomada visual do histórico após `page.reload()` não passou: o Chromium deixou a página sem o elemento esperado após a recarga. O teste de API confirma que a mensagem gravada é devolvida pelo endpoint de histórico. O host também apresentou `SIGSEGV` do Chromium em uma execução de breakpoints; o renderer headless está instável neste ambiente.
- O símbolo original tem o mesmo SHA-256 nos assets de referência e nos assets usados pelo app (`a8617e6191a4306c6992589411d19946f22ff4f5331de45ea3cb060e4572325f`). Nenhuma imagem ou animação foi redesenhada.

## Referências anteriores remanescentes

Todas as ocorrências restantes foram classificadas na segunda auditoria e são deliberadas:

- `nepi` em `.env.example`, `apps/api/.env`, `Dockerfile` e `compose.yaml` nomeia o banco/usuário/volume local existente. Renomear esses recursos faria o Compose criar outra base ou exigiria uma operação de infraestrutura; os valores foram preservados.
- `nepi-widget.js`, `data-nepi-*`, `NepiWidget`, eventos `nepi:*`, `X-NePi-Host-Origin` e chaves `nepi-*` são aliases temporários de compatibilidade documentados no README e no guia do widget.
- `apps/web/public/nepi-identidade-original.png` permanece como alias byte a byte para referências anteriores ao símbolo.
- A migration contém a grafia antiga apenas na condição que atualiza rótulos já armazenados.
- A captura `Docs/neia-chat/assets/neia-referencia-chat.png` ainda mostra o nome anterior incorporado na imagem. Ela é uma referência visual histórica, não parte da interface; foi mantida inalterada para revisão manual, conforme a orientação de não redesenhar imagens automaticamente.

Não foram encontradas referências antigas em mensagens públicas, títulos, prompts ativos, nomes canônicos de pacotes ou identificadores novos. Os valores do arquivo `.env` foram pesquisados sem imprimir conteúdo sensível.

## Riscos e pendências

- Repetir o E2E de recarga do histórico num Chromium estável antes de usar essa suíte como gate de CI. A API passou na leitura do conteúdo persistido, mas a retomada da tela após recarregar não foi confirmada pelo navegador neste ambiente.
- A equipe da FUNEP deve revisar manualmente a captura de referência que contém o nome antigo, caso queira atualizar a referência visual.
- Fazer a publicação do bundle novo nos sites da FUNEP exige processo de deploy autorizado; nenhuma publicação foi feita nesta tarefa.
- DNS, domínio e credenciais externos não foram alterados.

## Status final

**Migração de identidade implementada localmente e migration de dados aplicada com preservação do histórico.** Build, lint, typecheck e testes de API passaram. A validação automatizada de interface fica **parcial**, devido ao comportamento instável do Chromium e à checagem de retomada após reload pendente de confirmação em navegador estável. Não houve deploy nem push.
