# Integrar o widget Néia

## Configurar uma instalação

1. Entre em `/admin` e escolha a integração correspondente ao contexto (FUNEP, livraria, eventos ou geral).
2. Ative a instalação, informe o rótulo e configure cada origem hospedeira completa, incluindo protocolo e porta. A origem não aceita caminhos ou curingas.
3. Copie o `installationId` público exibido no painel.
4. Publique o bundle versionado em `/widget/neia-widget.js`, a aplicação web e a imagem original `neia-identidade-original.png` no domínio da Néia.
5. Inclua o snippet no site autorizado:

```html
<script async src="https://DOMINIO-NEIA/widget/neia-widget.js"
  data-neia-installation="ID_PUBLICO_DA_INSTALACAO"
  data-neia-base="https://DOMINIO-NEIA"
  data-neia-api="https://API-NEIA"></script>
```

Os domínios são marcadores, não endpoints de produção já existentes. `data-neia-api` pode ser omitido quando API e aplicação compartilham a mesma base.

## Desenvolvimento

O host adversarial local está em `http://localhost:4174/demo-host.html`. Ele carrega o bundle de `http://localhost:5173`, API `http://localhost:3001` e instalação `dev-neia-institucional-public-installation`. O seed inclui `localhost:4174` na allowlist local. `demo-host-legacy.html` demonstra bundle, atributos e ID anteriores.

O widget suporta `NeiaWidget.init({ baseUrl, apiUrl, installationId, context })`, que retorna métodos `open`, `close` e `destroy`; uma nova inicialização destrói a instância anterior. A integração resolve a instalação ao abrir, cria a sessão somente depois do consentimento, mantém o token no host e envia ao iframe por mensagem validada. Instalações antigas continuam funcionando por `/widget/nepi-widget.js`, atributos `data-nepi-*` e IDs públicos legados, que permanecem como aliases.

## Fronteiras de segurança

O launcher usa Shadow DOM. O iframe valida `event.origin`, `event.source` e identificador da instalação antes de aceitar configuração/token. A API valida a origem hospedeira contra a allowlist e o iframe recebe CSP `frame-ancestors` específica. O bundle não contém segredo de servidor. A configuração de domínios reais e TLS deve ser verificada antes da publicação.
