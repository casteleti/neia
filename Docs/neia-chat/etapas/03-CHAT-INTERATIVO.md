# Etapa 03 — Aplicativo de conversa

## Pré-requisitos
Etapas anteriores concluídas e registradas. Ler as especificações mestre pertinentes. Inspecionar código existente antes de alterações.

## Implementação obrigatória
Construir routes standalone e embed, tela inicial contextualizada, sugestões acionáveis, scroll, composer multilinha, histórico local temporário, loading, retry, cancelamento, controles fechar/minimizar (no iframe via bridge), sem botão inerte.

## Procedimento autônomo
1. Registrar estado inicial e critérios relevantes em `docs/PROGRESS.md`.
2. Implementar em incrementos pequenos, com tipagem e testes.
3. Executar lint, typecheck, testes pertinentes e build; corrigir falhas.
4. Registrar arquivos alterados, comandos executados, evidências e decisões.
5. Prosseguir automaticamente para a próxima etapa quando os critérios forem alcançados. Se algo depender de acesso externo ausente, marcar pendência sem bloquear tarefas independentes.

## Critério de saída
Fluxo conversa demonstrativa completo e navegável por teclado; mobile sem scroll horizontal.

## Cuidados
Não usar dados reais presumidos, não expor secrets, não fazer deploy/push sem autorização, não eliminar código preexistente sem análise.
