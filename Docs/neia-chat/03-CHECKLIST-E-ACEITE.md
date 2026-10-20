# Definição de concluído (DoD)

## Gates sequenciais
- [ ] 01 Fundação: workspace, scripts, env, Prisma e compose sobem.
- [ ] 02 Design system: imagem exata, tokens, componentes, teclado e estados.
- [ ] 03 Chat web: layout standalone e iframe, interações e responsividade.
- [ ] 04 API/DB: migrar, criar sessão, salvar/ler conversas isoladas.
- [ ] 05 Provider: demo determinístico com SSE; interface Claude protegida.
- [ ] 06 Widget: snippet externo, modal desktop/mobile e múltiplas instâncias impedidas.
- [ ] 07 Contextos/admin: origens autorizadas, sugestão por portal e admin protegido.
- [ ] 08 Segurança: modelo de ameaças, rate limit, validação, privacidade e CSP.
- [ ] 09 E2E: desktop/mobile/iframe, isolamento e falhas testados.
- [ ] 10 Polimento: loading, foco, acessibilidade, movimentos reduzidos, performance.
- [ ] 11 Packaging: Docker, build, script e demo de integração externa.
- [ ] 12 Auditoria final: execução limpa, checklist, README, pendências.

## Gates não negociáveis
- Nunca mostrar 'conectado à FUNEP' ou dados em tempo real sem integrações reais.
- Não anunciar Claude integrado live sem chave e prova efetiva; não testar API cobrada sem permissão de uso de crédito ou configuração deliberada.
- Nada de envio de informações entre sessões de visitantes; requests manipuladas não podem acessar outra conversa.
- Widget não pode modificar `body` do host permanentemente, nem quebrar estilos, rotas ou rolagem após fechamento.
- Cada ação visível deve funcionar ou ser omitida; não entregar ícones inertes.
- `prefers-reduced-motion`, contraste AA, foco visível, `aria-live`, Escape e gerenciamento de foco.
- Capturas ou vídeos de testes da UI nos breakpoints 320, 375, 768, 1024, 1440 px, se Playwright disponível.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e` no relatório (ou explicar qualquer bloqueio com evidência).
