# Néia — Instruções-mestre para Codex

## Missão
Construir, implementar, testar e documentar **Néia Chat**, produto independente da FUNEP, em português brasileiro, com **duas apresentações do mesmo app**: página própria em tela cheia e widget embutível em múltiplos sites. Usar `assets/neia-identidade-original.png` como identidade exata e `assets/neia-referencia-chat.png` como referência conceitual de layout. **Não recriar o site institucional.**

## Regra de execução autônoma
1. Ler integralmente este arquivo, `01-PRODUTO-E-ESCOPO.md`, `02-ARQUITETURA-E-DECISOES.md`, `03-CHECKLIST-E-ACEITE.md` e `AGENTS.md`.
2. Executar **na ordem** `etapas/01-...md` até `etapas/12-...md`. Cada fase inclui tarefas, testes e condições de saída.
3. Investigar o repositório antes de instalar, sobrescrever ou remover; preservar código e configurações existentes. Se estiver vazio, iniciar monorepo conforme arquitetura.
4. Tomar decisões técnicas locais autonomamente e registrá-las em `docs/DECISIONS.md`; não pedir aprovação para operações locais reversíveis.
5. Ao fim de cada etapa, executar validações, registrar evidências em `docs/PROGRESS.md`, e continuar automaticamente. Corrigir falhas antes de prosseguir.
6. Não declarar 'concluído' com mocks apenas se o escopo da etapa exigir persistência, autenticação ou integração real.
7. Credenciais nunca entram no Git, UI ou logs. Nunca inventar tokens Anthropic nem conectar RAG inexistente.
8. Não executar push, deploy público, alteração de DNS, migração destrutiva de produção ou configurar faturamento externo sem autorização explícita prévia. A construção e os testes locais podem ocorrer sem aprovações intermediárias.
9. Se segredo/serviço externo não estiver disponível, implementar adaptador e testes locais, marcar bloqueio apenas da verificação externa, continuar todas as etapas independentes.
10. O resultado final deve incluir scripts reproduzíveis, logs de testes, lista de pendências externas e guia de operação.

## Critério macro de pronto
Frontend e API rodando localmente; chat funcional com provider demonstrativo claramente identificado, conversas persistidas, widget inserível em páginas de terceiros, contextos por origem confiáveis, painel administrativo mínimo protegido, testes automatizados e docs de operação. Adaptador Claude implementado e testável sem chave por meio de mocks; integração live só é aprovada após configuração de chave válida e verificação autorizada. RAG não é requisito deste ciclo, mas há contratos preparados.

## Ordem de leitura
`01-PRODUTO-E-ESCOPO.md` → `02-ARQUITETURA-E-DECISOES.md` → `03-CHECKLIST-E-ACEITE.md` → `04-EXPERIENCIA-E-DESIGN.md` → `05-CONTRATOS-API-E-DADOS.md` → `06-SEGURANCA-E-PRIVACIDADE.md` → `07-OPERACAO-E-DEPLOY.md` → `08-ROADMAP-IA-RAG.md` → `etapas/01`...`etapas/12`.
