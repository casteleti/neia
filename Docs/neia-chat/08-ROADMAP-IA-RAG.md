# Claude, conhecimento e RAG — integração preparada, não simulada como real

## Distinção essencial
Claude Code é o agente de desenvolvimento. O chat em produção consumirá **Anthropic Claude API via backend**; são serviços e credenciais distintos. Verificar documentação oficial e modelos disponíveis no momento da implementação, sem fixar nome de modelo descontinuado.

## Interface de provider
`ChatProvider.generate({ messages, systemContext, signal, metadata }): AsyncIterable<ChatChunk>`; providers `DemoProvider` (sempre local e claramente demonstrativo) e `AnthropicProvider` (cliente SDK oficial server-side). Configurar seleção por variável de ambiente validada, não por parâmetro de usuário. Implementar streaming, abort, timeout, retries limitados, sanitização de erros, medição de tokens/custos quando fornecida pela API.

## Preparação do conhecimento
Camada futura `KnowledgeRetriever` com `retrieve({query, contextId, permissions}) -> CitationCandidate[]`; contrato de `KnowledgeSource`, versionamento, atualização, revogação e proveniência. Não criar embeddings ou alegar acurácia sem documentos oficiais e critérios de governança. Respostas futuras devem citar origem e data quando disponíveis, distinguir indisponível de desconhecido.


## Roadmap posterior
1. Curadoria e aprovação das fontes oficiais por área FUNEP.
2. Pipeline de ingestão/sync (web, PDF, sistemas internos), extração e chunks.
3. Embeddings, índice vetorial com isolamento por unidade/área; testes de recuperação e ACL.
4. RAG com citações, freshness/expiração, respostas de incerteza, avaliação humana e observabilidade.
5. Tools externas para livraria/eventos com autenticação, permissões e aprovação de ações sensíveis.
6. Revisão LGPD, custos, limites, observabilidade, fallback e atendimento humano.

## Aceite desta versão
Provider interface pronta; demo funcional; AnthropicProvider implementado e testado contra mock oficial/transport simulado; integração de verdade depende de `ANTHROPIC_API_KEY` fornecida e autorização para chamadas pagas. Sem falsas afirmações.
