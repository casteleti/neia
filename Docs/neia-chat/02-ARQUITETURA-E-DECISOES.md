# Arquitetura de referência

## Stack alvo
- pnpm workspace monorepo; TypeScript; Node.js LTS compatível com dependências no momento da implantação.
- `apps/web`: Vite + React, React Router, Tailwind, componentes Radix/shadcn quando úteis, Lucide; CSS variables, Motion só onde agrega.
- `apps/api`: Fastify + Zod para REST e SSE; camada service/repository/provider.
- `packages/shared`: DTOs, schemas, tokens e contratos usados em frontend/backend.
- `packages/widget`: script independente (IIFE/UMD) que monta launcher, iframe e mensagens via `postMessage` **com origin validado**.
- PostgreSQL via Prisma (migrations versionadas); desenvolvimento local via Docker Compose.
- Vitest (unit), Playwright (E2E), axe-core acessibilidade; lint e TypeScript.

## Estrutura esperada
```
apps/web/src/{app,components,features/chat,features/admin,styles}
apps/api/src/{routes,services,repositories,providers,middleware,config}
packages/shared/src
packages/widget/src
prisma/{schema.prisma,migrations}
docs/{DECISIONS.md,PROGRESS.md,TEST-RESULTS.md}
assets/
```
Ajustar apenas se justificado no registro de decisões.

## Fluxos
- Host autorizado → `neia-widget.js` (botão flutuante) → iframe hospedado em domínio da Néia → REST/SSE no backend.
- API → resolve integração autorizada pelo **token público de instalação + Origin/Referer validado contra allowlist** (não tratar token público como segredo) → aplica contexto → sessão e mensagens → provider (demo/Claude).
- Chamadas externas passam **sempre pelo servidor**. Nunca expor API key Anthropic ao cliente.
- Backend define ferramentas e fontes; navegador não escolhe `systemPrompt`, modelo nem política por parâmetros.

## Modelo de distribuição
Usar iframe como camada de isolamento para evitar CSS/JS de sites terceiros. Script pequeno e idempotente; não criar múltiplos launchers. `postMessage` apenas com destino e origens exatos. Suporte standalone no domínio central.

## Configuração
`APP_BASE_URL`, `API_BASE_URL`, `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_*` (fluxo seguro escolhido), `ANTHROPIC_API_KEY` opcional, `AI_PROVIDER=demo|anthropic`, `ALLOWED_ORIGINS` somente apoio e allowlist de integrações em DB. Fornecer `.env.example` com valores placeholders e nenhuma credencial.

## Decisões de engenharia
- SSE com eventos `start`, `delta`, `complete`, `error`, `heartbeat`; se streaming complicar testes, implemente primeiro REST e inclua SSE antes do fim.
- Cookies seguros HttpOnly SameSite (adequados a iframe terceiro conforme política/browser), com fallback controlado para token de sessão efêmero na memória; não pressupor cookies de terceiros disponíveis.
- Evitar expor IDs previsíveis; UUID/ULID aleatórios, autorização em todas as leituras/gravações.
- Persistência de chat com retenção configurável e exclusão por usuário via ação clara.
- Não depender de provedores de login social para validar localmente.
