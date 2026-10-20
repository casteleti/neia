# PRD — Néia Chat

## Objetivo
Aplicação própria e reutilizável que oferece atendimento digital com identidade única FUNEP; instalar em institucional, livraria, eventos e futuros serviços por snippet. A primeira entrega é produto funcional com conteúdo demonstrativo honesto, pronto para acoplar IA e bases oficiais após etapa de curadoria.

## Usuários e contextos
- Visitante anônimo: abre widget, escolhe sugestão, envia mensagens, acompanha resposta, inicia nova conversa, minimiza/fecha, retoma sessão conforme consentimento e política.
- Visitante em dispositivo móvel: widget vira experiência de chat full-screen, com teclado e safe-area corretos.
- Visitante na página própria: usa chat em viewport inteiro, link compartilhável, navegação acessível.
- Administrador autenticado: gerencia configurações públicas, origens permitidas e sugestões; não consulta conversas privadas por padrão.

## Experiências e jornadas obrigatórias
1. Landing `/`: interface de chat standalone, com estado inicial, mensagens e ações.
2. `/embed?context=institucional`: interface minimalista em iframe; query context é **pedido não confiável**, validado via integração/origem no backend.
3. Widget injetado no site terceiro por script: botão com esfera, badge discreto opcional, janela flutuante desktop, tela inteira mobile; esc/close/minimize, foco e rolagem.
4. Conversa usando API com provider demo; respostas demonstrativas não devem inventar informação institucional ou apresentar-se como dados reais.
5. Contextos: institucional (verde), livraria (verde com detalhe amarelo), eventos (verde com detalhe azul), genérico (verde); todos sob marca Néia.
6. Falhas: erro de rede, rate limit, indisponibilidade e timeout com botão de tentar novamente e aviso claro.

## Dentro do escopo desta entrega
Frontend, backend, DB relacional, conversas, sessões anônimas com identificador aleatório e proteção contra sequestro, estados de streaming, provider demo, arquitetura Anthropic, widget distribuível, painel admin mínimo, configuração de contextos, auditoria, testes, documentação, Docker local, acessibilidade, responsividade, observabilidade mínima.

## Fora do escopo nesta entrega
Ingestão de documentos reais, embeddings, busca vetorial, RAG em produção, integrações de ERP, checkout, envio de mensagens por WhatsApp, painel de analytics avançado, SSO, personalização com dados pessoais, atendimento humano operacional, microfone ou transcrição. Apenas pontos de extensão e UI futura, sem controles falsamente funcionais.

## Métricas de qualidade
Zero scroll horizontal em 320px; teclado acessível; sem segredos no bundle; widget sem conflito de CSS na página hospedeira; teste de dois domínios/contextos; isolamento de sessão; feedback de erro; reprodutibilidade a partir do README.
