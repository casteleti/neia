# Segurança, privacidade e limites de confiança

## Fronteiras
Visitante e site hospedeiro são não confiáveis; código widget é público; installation ID **não é segredo**. No servidor, validar integração habilitada, Origin/Referer conforme origem concreta; política defensiva para ausência de cabeçalhos, sem confiar apenas nisso como autenticação. Sessões autenticadas por segredo de alta entropia, escopo por integração, TTL e hash no armazenamento quando aplicável. iframe não pode confiar em mensagens `postMessage` sem `event.origin` e `event.source` esperados.

## Checklist
- CORS por origem registrada, nunca `Access-Control-Allow-Origin: *` com credenciais.
- Credenciais admin hash Argon2id/bcrypt com salt; login rate-limited, proteção CSRF quando cookies, cookies Secure/HttpOnly.
- API key Anthropic só no processo de backend; não logar input sensível, output integral ou headers de autenticação.
- Validação Zod em todos os endpoints; limite de caracteres/mensagens e timeout; rate limiting e controle de gasto futuro.
- HTML de mensagem tratado como texto; se Markdown, renderização sanitizada com protocolos de URL restritos. Nada de `dangerouslySetInnerHTML` com entrada não confiável.
- Headers adequados: CSP por app e frame-ancestors de origens registradas (consciente das limitações por tenant); nosniff, referrer policy, HSTS apenas HTTPS.
- Política de retenção: variável configurável (padrão de proposta 30 dias para sessões demo, sujeito à revisão institucional), exclusão de conversa e rotina de limpeza.
- Logs pseudonimizados, sem exposição de e-mails ou conversas em analytics por padrão. Consentimento e aviso de privacidade previamente ao uso de persistência não essencial, conforme avaliação jurídica/LGPD.
- Impedir leitura intersessões: testar IDs manipulados, alteração do slug do contexto e instalação pública roubada.
- Sem prompt sensível ou dados de terceiros colocados no frontend. Proteção de saída e limites de tool use quando habilitar Claude.

## Política de risco
Não criar endpoint de administração sem autenticação; não usar senha hardcoded em seed para produção. Em dev, permitir bootstrap por CLI/env local com instrução para remover. Falha de configuração deve fechar acesso, não abrir permissivamente.
