# Decisões técnicas

## 2026-10-18 — Identidade Néia

- A marca pública é “Néia — Inteligência Artificial da FUNEP”; identificadores e pacotes novos usam `neia` e `neia-chat`.
- A migration `20261018020000_neia_identity` armazena IDs públicos antigos como aliases antes de padronizar os IDs locais. Sessões, conversas e mensagens não são regravadas.
- O widget aceita temporariamente o bundle, atributos, eventos, cabeçalho e chaves de armazenamento antigos. O alias de bundle mantém a integração incorporada que já está instalada.
- O nome do banco PostgreSQL, usuário, senha local de exemplo e volume Compose permanecem como estão para reusar o banco e o volume existentes. Esses nomes não são identidade pública nem credenciais de produção.
- O símbolo visual original foi copiado sem alteração. A captura de referência em `Docs/neia-chat/assets/neia-referencia-chat.png` ainda contém o nome anterior dentro da imagem e fica preservada para revisão visual.

## 2026-10-18 — Arquitetura e implementação local

- Seguir a arquitetura proposta: workspace pnpm com aplicações web React/Vite e API Fastify, além de pacote shared.
- Entregar chat standalone e widget sobre uma API compartilhada, persistência por Prisma/PostgreSQL, painel de configurações protegido e provider configurável demo/Anthropic.
- Utilizar `Docs/neia-chat/assets/neia-identidade-original.png` sem alterar a imagem; a referência em `img/` é referência de composição, não um fundo da aplicação.
- Manter respostas do provider demo explicitamente transparentes sobre fontes oficiais ainda não conectadas.
- A web de desenvolvimento chama a API pelo proxy do Vite; a API restringe CORS às origens locais configuradas em `ALLOWED_ORIGINS` e resolve origens reais pela allowlist da integração.
- O bundle de produção do widget é copiado por Vite para `apps/web/public/widget`, junto ao asset original byte a byte.
- O consentimento antecede qualquer criação de sessão; a conversa fica sujeita à retenção configurada (30 dias por padrão). O texto da interface ainda precisa de aprovação institucional/jurídica.
- Respostas SSE hijacked definem CORS explicitamente porque não passam pelos hooks de resposta do Fastify. Leitura de sessão por mesma origem pode vir sem cabeçalho `Origin`; nesse caso a API exige token bearer e origem hospedeira declarada e ainda valida a allowlist da integração.
- Docker Compose é ambiente de desenvolvimento local. Segredos de exemplo não são apropriados para produção.
