# Etapa 05 — Motor de respostas

## Pré-requisitos
Etapas anteriores concluídas e registradas. Ler as especificações mestre pertinentes. Inspecionar código existente antes de alterações.

## Implementação obrigatória
Criar interface ChatProvider, provider demo seguro que informa limites, adapter Anthropic server-side via SDK e injeção para testes, SSE idempotente, timeout/abort, tratamento de erros, seleção via configuração e limites.

## Procedimento autônomo
1. Registrar estado inicial e critérios relevantes em `docs/PROGRESS.md`.
2. Implementar em incrementos pequenos, com tipagem e testes.
3. Executar lint, typecheck, testes pertinentes e build; corrigir falhas.
4. Registrar arquivos alterados, comandos executados, evidências e decisões.
5. Prosseguir automaticamente para a próxima etapa quando os critérios forem alcançados. Se algo depender de acesso externo ausente, marcar pendência sem bloquear tarefas independentes.

## Critério de saída
Stream incremental visível; retries não duplicam conteúdo; tests demo e fake Anthropic passam; sem segredo no client.

## Cuidados
Não usar dados reais presumidos, não expor secrets, não fazer deploy/push sem autorização, não eliminar código preexistente sem análise.
