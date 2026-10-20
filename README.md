# Néia — Inteligência Artificial da FUNEP

Aplicação de chat responsiva para a Néia, com interface standalone, widget isolado em iframe, API Fastify e persistência PostgreSQL.

## Requisitos

- Node.js 22 ou superior
- pnpm 11 (ativado por `corepack enable`)
- Docker Compose para PostgreSQL local
- Chromium instalado pelo Playwright para os testes de navegador

## Desenvolvimento local

```sh
corepack enable
pnpm install
cp .env.example apps/api/.env
docker compose up -d db
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Abra `http://localhost:5173`. A API fica em `http://localhost:3001`; o host adversarial para conferir o widget está em `http://localhost:4174/demo-host.html`.

O seed cria quatro integrações demonstrativas com origens locais. Para criar o primeiro administrador, execute `pnpm db:admin:create -- admin@exemplo.org.br`; o comando gera uma senha aleatória e a exibe uma vez no terminal. Guarde-a em um cofre seguro. O painel local fica em `/admin`.

## Comandos

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm db:cleanup
```

O E2E sobe a aplicação e o host de demonstração quando as portas estão livres. Em CI, serviços existentes só são reutilizados com `NEIA_REUSE_SERVERS=true`. Para máquina nova, instale o navegador com `pnpm exec playwright install chromium`.

## Widget

O bundle standalone é `apps/web/public/widget/neia-widget.js`. Uma integração configurada pelo painel fornece um `installationId` público e as origens autorizadas. Exemplo:

```html
<script async src="https://DOMINIO-NEIA/widget/neia-widget.js"
  data-neia-installation="ID_PUBLICO_DA_INSTALACAO"
  data-neia-base="https://DOMINIO-NEIA"
  data-neia-api="https://API-NEIA"></script>
```

O domínio é um marcador de exemplo; não há domínio de produção configurado. O widget usa Shadow DOM para isolar estilos do site hospedeiro, e o chat roda em iframe com validação de origem e `frame-ancestors` por integração. Consulte [integração do widget](docs/INTEGRACAO-WIDGET.md).

Instalações existentes seguem compatíveis: `/widget/nepi-widget.js`, atributos `data-nepi-*`, a API global `NepiWidget`, eventos `nepi:*`, cabeçalho `X-NePi-Host-Origin` e IDs públicos antigos são aceitos como aliases. O bundle atual também é servido no caminho antigo e mantém esses contratos durante a transição.

## Privacidade e IA

O chat usa Anthropic quando ativado no servidor. A conversa só é persistida após consentimento. O aviso informa retenção de até 30 dias e recomenda não compartilhar dados pessoais sensíveis. Tokens de visitante são armazenados como hash; as sessões e conversas são isoladas por integração. Consulte [configuração da Anthropic](docs/CONFIGURAR-ANTHROPIC.md).

## Operação e estado

- [Guia de desenvolvimento e operação](docs/OPERACAO.md)
- [Modelo de ameaças e controles](docs/THREAT-MODEL.md)
- [Decisões técnicas](docs/DECISIONS.md)
- [Progresso e evidências](docs/PROGRESS.md)
- [Especificações do produto](Docs/neia-chat)

O deploy e a configuração DNS/TLS dependem da infraestrutura da FUNEP. Para configurar a API Anthropic em ambiente local, siga [o guia de configuração](docs/CONFIGURAR-ANTHROPIC.md).
