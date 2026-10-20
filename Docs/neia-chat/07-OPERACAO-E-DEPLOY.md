# Operação, desenvolvimento e publicação

## Ambiente de desenvolvimento
1. `corepack enable` e `pnpm install`.
2. `cp .env.example .env` e configurar valores locais; gerar SESSION_SECRET via ferramenta segura.
3. `docker compose up -d db`.
4. `pnpm db:migrate` e `pnpm db:seed`.
5. `pnpm dev` e conferir URLs locais mostradas no console.
6. `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`.
Esses comandos são contratos desejados; implemente-os durante a fase 01.

## Scripts necessários
`dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `db:migrate`, `db:seed`, `db:studio` opcional, `widget:build`. Todos sem segredos embutidos.

## Containerização
`Dockerfile` multi-stage, Compose db/api/web para validação local; health checks; nonroot onde possível; volumes persistentes de DB; portas explícitas, sem expor PostgreSQL publicamente por padrão. `pnpm-lock.yaml` versionado.

## Deploy futuro (somente após autorização)
Preferir ambiente central da FUNEP e DNS aprovado (exemplo `neia.funep.org.br`, **não afirmar que existe**). SSL/TLS, backup/restauração DB, secrets via painel seguro, migrações não destrutivas, rollback versionado. Servir widget JS por domínio estável e com cache/versionamento. Verificar CSP/frame-ancestors/domínios permitidos para institucional, livraria, eventos.

## Modelo de snippet
```html
<script async src="https://DOMINIO-NEIA/widget/neia-widget.js"
  data-neia-installation="ID_PUBLICO_DA_INSTALACAO"
  data-neia-base="https://DOMINIO-NEIA"></script>
```
Snippet é **exemplo**, não URL pronta. Documentar alternativa de inicialização JS programática e remoção. Token público + origem validada no backend; sem credenciais Anthropic.

## Operação
Registrar versão e changelog; configuração inicial por admin protegido; healthchecks, request IDs, métricas de erros e latência, rotina de backup, retenção e exclusão, guia de incidentes e rollback. Deploy nunca automático sem autorização.
