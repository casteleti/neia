# Etapa 07 — Integrações e gestão

## Pré-requisitos
Etapas anteriores concluídas e registradas. Ler as especificações mestre pertinentes. Inspecionar código existente antes de alterações.

## Implementação obrigatória
Criar resolução backend de installationId e origens autorizadas; dados por institucional/livraria/eventos/geral; temas e sugestões; painel admin protegido com login seguro e CRUD mínimo de integrações, allowlists e sugestões; logs de alteração.

## Procedimento autônomo
1. Registrar estado inicial e critérios relevantes em `docs/PROGRESS.md`.
2. Implementar em incrementos pequenos, com tipagem e testes.
3. Executar lint, typecheck, testes pertinentes e build; corrigir falhas.
4. Registrar arquivos alterados, comandos executados, evidências e decisões.
5. Prosseguir automaticamente para a próxima etapa quando os critérios forem alcançados. Se algo depender de acesso externo ausente, marcar pendência sem bloquear tarefas independentes.

## Critério de saída
Tentativas não autorizadas falham; alterar tema/sugestão no admin muda comportamento no embed permitido; admin não é público.

## Cuidados
Não usar dados reais presumidos, não expor secrets, não fazer deploy/push sem autorização, não eliminar código preexistente sem análise.
