# Etapa 09 — Validação de jornadas

## Pré-requisitos
Etapas anteriores concluídas e registradas. Ler as especificações mestre pertinentes. Inspecionar código existente antes de alterações.

## Implementação obrigatória
Playwright em standalone, iframe e página host; snapshots nos tamanhos; fluxo visitante, sugestões, retry, offline, exclusão, conversas de duas sessões, origem rejeitada, login admin; axe a11y.

## Procedimento autônomo
1. Registrar estado inicial e critérios relevantes em `docs/PROGRESS.md`.
2. Implementar em incrementos pequenos, com tipagem e testes.
3. Executar lint, typecheck, testes pertinentes e build; corrigir falhas.
4. Registrar arquivos alterados, comandos executados, evidências e decisões.
5. Prosseguir automaticamente para a próxima etapa quando os critérios forem alcançados. Se algo depender de acesso externo ausente, marcar pendência sem bloquear tarefas independentes.

## Critério de saída
Suíte E2E reexecutável passa, relatório em docs/TEST-RESULTS.md; qualquer limitação anotada.

## Cuidados
Não usar dados reais presumidos, não expor secrets, não fazer deploy/push sem autorização, não eliminar código preexistente sem análise.
