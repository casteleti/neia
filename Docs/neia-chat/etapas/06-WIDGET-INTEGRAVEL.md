# Etapa 06 — Script e iframe

## Pré-requisitos
Etapas anteriores concluídas e registradas. Ler as especificações mestre pertinentes. Inspecionar código existente antes de alterações.

## Implementação obrigatória
Implementar build IIFE do widget e API pública init/destroy; parse dataset, criar launcher com asset original, overlay desktop, full-screen mobile; bridge postMessage com validação strict; minimizar/fechar e foco; demo host externo CSS adversarial.

## Procedimento autônomo
1. Registrar estado inicial e critérios relevantes em `docs/PROGRESS.md`.
2. Implementar em incrementos pequenos, com tipagem e testes.
3. Executar lint, typecheck, testes pertinentes e build; corrigir falhas.
4. Registrar arquivos alterados, comandos executados, evidências e decisões.
5. Prosseguir automaticamente para a próxima etapa quando os critérios forem alcançados. Se algo depender de acesso externo ausente, marcar pendência sem bloquear tarefas independentes.

## Critério de saída
Snippet integra em página de teste; iframe isolado; nenhum estilo contamina host; abertura/fechamento repetidos sem listeners duplicados.

## Cuidados
Não usar dados reais presumidos, não expor secrets, não fazer deploy/push sem autorização, não eliminar código preexistente sem análise.
