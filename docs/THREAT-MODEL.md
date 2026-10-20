# Modelo de ameaças e controles

## Dados e limites

O navegador visitante envia texto de conversa, um token aleatório de sessão e a origem do site hospedeiro quando usa o widget. O banco armazena hash do token, mensagens, conversas e timestamps. A chave Anthropic, se configurada, existe apenas no servidor. O `installationId` é público e não concede acesso sem origem aprovada e sessão válida.

A primeira fonte de conhecimento é conteúdo público da agenda FUNEP. O sincronizador só aceita páginas do domínio `www.funep.org.br` no caminho `/evento/`; o conteúdo recuperado é dado externo e deve ser tratado como referência, nunca como instrução de sistema. Não são consultados portais de eventos que exigem autenticação nem dados privados de inscritos.

## Atores e riscos tratados

- **Visitante tentando acessar outra conversa:** toda leitura, escrita e exclusão confere `sessionId` e integração; o token bruto não é armazenado.
- **Site externo incorporando o widget sem autorização:** origens são comparadas exatamente, CORS não usa wildcard, e a resposta `/embed` define `frame-ancestors` com a allowlist daquela integração.
- **Página hospedeira com CSS hostil ou mensagens forjadas:** o widget fica em Shadow DOM/iframe; bridge valida `event.source`, `event.origin` e instalação.
- **Reenvio após falha de rede:** chave idempotente por mensagem evita duplicar a resposta persistida.
- **Abuso de login, sessão ou mensagens:** limites por IP/sessão, payloads Zod, segredo de cookie assinado, bcrypt, cookie HttpOnly/SameSite Strict, verificação Origin/CSRF em ações admin e logs de auditoria.
- **Exposição de dados sensíveis em logs:** Authorization e Cookie são redigidos; erros ao visitante são genéricos e têm `requestId` para correlação.
- **Retenção excessiva:** limpeza periódica remove sessões expiradas, conversas ao fim do prazo e auditoria após 365 dias.

## Limites e controles operacionais

As conversas contêm texto do usuário e devem ser tratadas como dados pessoais potencialmente sensíveis. A UI solicita consentimento, comunica retenção de 30 dias e recomenda não enviar dados sensíveis. A base local não inclui revisão jurídica, banner/política institucional aprovada, criptografia de volume gerenciada ou backup. Esses controles dependem da infraestrutura e governança da FUNEP.

O painel permite configurar origens, estado e sugestões, mas ainda não oferece gestão de usuários, recuperação de senha ou rotação de credenciais. Embeddings, moderação especializada e avaliação de prompt injection permanecem fora do escopo implementado.

## Revisões antes de produção

- Definir responsável, finalidade, base legal, canal de privacidade e política aprovada de retenção.
- Confirmar allowlist de cada instalação, CSP, TLS, cookies, proxy e configuração de headers no domínio real.
- Integrar secret manager, rotação, backup com teste de restauração e monitoramento de erros/latência.
- Revisar política do provider e transferência de dados antes de ativar Anthropic.
- Fazer revisão de segurança independente depois de conectar fontes oficiais e antes de publicar.
