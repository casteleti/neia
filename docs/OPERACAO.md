# Operação local e entrega

## Preparar ambiente

1. Instale Node.js 22+, habilite Corepack e rode `pnpm install`.
2. Copie `.env.example` para `apps/api/.env`. Troque os segredos locais antes de expor qualquer serviço. `SESSION_SECRET` e `ADMIN_COOKIE_SECRET` devem ser valores aleatórios diferentes, com pelo menos 32 caracteres.
3. Inicie o banco com `docker compose up -d db`.
4. Aplique o schema (`pnpm db:migrate`) e crie integrações locais (`pnpm db:seed`). O seed não roda em `NODE_ENV=production`.
5. Rode `pnpm dev`. A web usa `localhost:5173`, API `localhost:3001` e host de widget `localhost:4174`.
6. Para acesso ao painel local, rode `pnpm db:admin:create -- admin@exemplo.org.br`. A senha gerada aparece uma vez; armazene-a em cofre.

## Comandos de manutenção

- `pnpm db:cleanup`: remove sessões expiradas, conversas vencidas e logs de auditoria com mais de 365 dias.
- `pnpm db:studio`: abre Prisma Studio para inspeção local do banco.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build`: verificações de código e pacote.
- `GET /health/live`: processo ativo. `GET /health/ready`: processo e banco disponíveis.

A limpeza de retenção roda na inicialização da API e a cada seis horas. A retenção configurável aceita de 1 a 365 dias e usa 30 dias quando o valor está ausente ou inválido. Backups e restauração do volume PostgreSQL ainda precisam ser configurados no ambiente de hospedagem da FUNEP.

## Docker Compose

`docker compose up --build` inicia banco e aplicação de desenvolvimento; a imagem aplica migrações e seed demonstrativo antes de iniciar web e API. As portas são limitadas a `127.0.0.1`. As credenciais do Compose são apenas locais e não devem ser reutilizadas em produção.

## Preparação de produção

Antes de publicar, a equipe de infraestrutura precisa escolher domínio e DNS, provisionar TLS, segredos gerenciados, backup restaurável e monitoramento. Configure `APP_BASE_URL`, `API_BASE_URL`, `ALLOWED_ORIGINS` e os contextos no painel com origens HTTPS exatas. Revise `frame-ancestors`, CORS e CSP para cada domínio efetivo. Habilite `TRUST_PROXY=true` somente atrás de proxy reverso conhecido.

Para desenvolvimento local, veja [configuração da API Anthropic](CONFIGURAR-ANTHROPIC.md). Em produção, use o secret manager e revise o orçamento e o controle de acesso da conta. Fontes adicionais, política de conteúdo e revisão de respostas seguem pendentes. Não há deploy automatizado configurado.


## Recuperação

1. Consulte `/health/live` e `/health/ready` e os logs da API pelo `requestId`.
2. Se a API estiver pronta, verifique origens habilitadas, instalação pública e validade da sessão.
3. Em falha do provider, a mensagem fica marcada para retry com chave de idempotência; o retry não deve duplicar resposta.
4. Em indisponibilidade PostgreSQL, recupere o serviço a partir do backup validado e confira `/health/ready` antes de liberar o chat.
5. Para interromper exposição de um site, desabilite a integração ou remova sua origem autorizada no painel.
