# Contratos técnicos — API e dados

## Rotas mínimas propostas (versionadas `/api/v1`)
- `GET /health/live`, `GET /health/ready` (ready verifica DB).
- `POST /integrations/resolve` — recebe installationId público, compara Origin/Referer permitidos no servidor e devolve contexto público (tema, sugestões, capabilities), com restrições de CORS.
- `POST /sessions` — inicia sessão anônima vinculada a integração validada e emite credencial efêmera não adivinhável.
- `GET /sessions/me/conversations` — lista só as conversas da sessão autorizada.
- `POST /conversations` — cria conversa para sessão/contexto.
- `GET /conversations/:id/messages` — verifica propriedade, retorna paginação.
- `POST /conversations/:id/messages` — valida input; salva mensagem idempotente e dispara resposta via SSE ou endpoint separado; definir contrato consistente.
- `GET /conversations/:id/stream?...` — caso usar SSE separado, autenticação sem token sensível em URL, teste cross-origin.
- `DELETE /conversations/:id` — remove conversa e mensagens da sessão.
- `POST /admin/login`, `POST /admin/logout`, `GET/PATCH /admin/integrations` — admin com autenticação e proteção de CSRF adequadas.

## DTOs
`IntegrationPublic { id, slug, label, theme, suggestions: {id,label,icon,prompt}[], capabilities }`;
`Conversation { id, contextId, createdAt, updatedAt, title? }`;
`Message { id, conversationId, role:'user'|'assistant', content, status, createdAt }`;
`ChatError { code, message, requestId? }`;
`StreamEvent { type:'start'|'delta'|'complete'|'error'|'heartbeat', ... }`.
Schemas Zod compartilhados; limites de tamanho, paginação, enum e escaping, ids UUID. Idempotency key por envio e retry sem mensagem duplicada.

## Dados mínimos Prisma
- `Integration`: id, slug único, installationId público único, allowedOrigins[] ou tabela própria, enabled, themeJson, suggestionsJson, createdAt/updatedAt.
- `VisitorSession`: id, integrationId, credentialHash/secure binding, expiresAt, createdAt, updatedAt.
- `Conversation`: id, sessionId, integrationId, createdAt, updatedAt, deletedAt.
- `Message`: id, conversationId, role, content, status, idempotencyKey?, createdAt, usage metadata sem conteúdo secreto.
- `AdminUser`: id, email único, passwordHash ou provedor confiável, createdAt, lastLoginAt.
- `AuditLog`: id, actorId?, action, targetType, targetId, createdAt, metadata filtrada.
Indexes por chaves estrangeiras, expiração, unique idempotency scope, retenção; migração e seed idempotentes. Nunca colocar API keys em tabelas de configuração pública.

## Seeds demonstrativos
Integrations `institucional`, `livraria`, `eventos`, `geral`. A allowlist local usa `localhost` com portas de demo **somente em desenvolvimento**. Não inserir `*` em produção. Cada contexto com sugestões apropriadas; texto demo explica limitação se fonte não conectada.

## Qualidade do contrato
Retornar 400/401/403/404/409/429/500 com códigos estáveis; não vazar stack traces ao navegador. Limites por IP+sessão+integração. Logs com request ID, sem conteúdo integral de conversas nem credenciais.
