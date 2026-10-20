# Etapa 08 — Hardening

## Pré-requisitos
Etapas anteriores concluídas e registradas. Ler as especificações mestre pertinentes. Inspecionar código existente antes de alterações.

## Implementação obrigatória
Revisar CSP, CORS, origin, auth, frame restrictions, rate limit, sanitização, LGPD copy e retenção; CSRF admin, no secret logging, erros sanitizados; criar threat model e testes.

## Procedimento autônomo
1. Registrar estado inicial e critérios relevantes em `docs/PROGRESS.md`.
2. Implementar em incrementos pequenos, com tipagem e testes.
3. Executar lint, typecheck, testes pertinentes e build; corrigir falhas.
4. Registrar arquivos alterados, comandos executados, evidências e decisões.
5. Prosseguir automaticamente para a próxima etapa quando os critérios forem alcançados. Se algo depender de acesso externo ausente, marcar pendência sem bloquear tarefas independentes.

## Critério de saída
Checks automatizados de XSS, IDOR, origins não registrados, rate limit e headers; zero secrets no bundle.

## Cuidados
Não usar dados reais presumidos, não expor secrets, não fazer deploy/push sem autorização, não eliminar código preexistente sem análise.
