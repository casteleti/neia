# Progresso de implementação

Atualizado em 2026-10-19: a tentativa de conectar a agenda pública de cursos/eventos foi revertida após não funcionar no uso do chat. A base de consulta institucional permanece pendente de uma abordagem funcional validada ponta a ponta.

## Migração de identidade — Néia

Concluída localmente em 2026-10-18. A interface, API, prompts, identificadores de workspace, bundle e documentação agora adotam Néia. IDs públicos, atributos e protocolo anteriores continuam aceitos em compatibilidade. A migration adiciona aliases e renomeia os IDs de demonstração sem alterar conversas, sessões ou mensagens. O banco local manteve as contagens: 4 integrações, 20 sessões, 22 conversas e 21 mensagens. O banco/usuário/volume Compose preserva o identificador histórico para não criar um volume vazio. A referência visual em `Docs/neia-chat/assets/neia-referencia-chat.png` mantém o texto incorporado original.

Atualizado em 2026-10-18. As especificações em `Docs/neia-chat` e as etapas 01–12 foram lidas. A implementação local cobre o escopo de chat standalone e widget; itens que exigem infraestrutura, decisões institucionais ou fontes externas estão listados ao final.

## Implementado

- Workspace pnpm com `apps/web` (React/Vite), `apps/api` (Fastify), `packages/shared` e `packages/widget`; PostgreSQL via Prisma com migrations versionadas.
- Interface responsiva inspirada no layout de referência, usando a identidade original da FUNEP sem editar o asset. Inclui consentimento, histórico, sugestões, envio em streaming, retry idempotente, nova conversa e exclusão confirmada.
- Widget IIFE com Shadow DOM, iframe, validação de origem/source em `postMessage`, CORS por allowlist e CSP `frame-ancestors` vinculada à instalação.
- Isolamento de sessões/conversas por integração, token aleatório com hash no banco, exclusão/retention cleanup, rate limits e validação de entrada.
- Provider demo com aviso explícito de ausência de fonte oficial; adapter Anthropic server-side com credencial apenas no servidor.
- Painel `/admin` com autenticação bcrypt, cookie assinado e edição de estado, allowlist, rótulo e sugestões das integrações.
- Compose local, Dockerfile, health endpoints, scripts de administração e guias de widget, operação e ameaças.

## Validações executadas

- `pnpm typecheck`: passou para os quatro pacotes/aplicações.
- `pnpm test`: 5 testes de provider, origem, isolamento e validação passaram.
- `pnpm build`: bundle do widget, web e API passaram.
- `docker compose config` e `docker compose build app`: passaram; OpenSSL foi incluído na imagem para o Prisma. PostgreSQL local ficou healthy e as migrations 0001/0002 e seed foram aplicados.
- E2E: na suíte completa, 3 testes passaram e 2 falharam. O teste de acessibilidade, autenticação inicial e widget em host com CSS conflitante passaram; o widget também passou isoladamente. Um teste falhou ao conferir a conversa após `page.reload()` e outro recebeu `Target crashed` ao capturar screenshot dos breakpoints. O endpoint de histórico respondeu corretamente com autorização de sessão. Repetir esses dois casos em ambiente Chromium limpo antes de usar o E2E como gate de CI.
- Durante a validação foi corrigido o CORS de respostas SSE hijacked e a leitura same-origin via proxy de desenvolvimento.

## Dependências para produção

- Domínio, DNS, TLS, infraestrutura de hospedagem, secret manager, backup/restore e monitoramento definidos pela FUNEP.
- Aprovação e configuração de política de privacidade/base legal e dos avisos finais.
- Outras origens reais, integrações e fontes institucionais ainda dependem de curadoria e aprovação.
- Migrar a chave Anthropic para um secret manager no ambiente de produção.
- Revisão de segurança operacional após as integrações reais.

Não foi feito deploy nem push. Este diretório não contém metadados Git.
