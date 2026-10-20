# UI/UX e identidade — implementação fiel

## Assets originais
- `assets/neia-identidade-original.png`: símbolo abstrato verde translúcido **original**, não recriar nem aproximar com gradiente genérico. Copiar para assets públicos otimizando apenas compressão, sem modificar desenho.
- `assets/neia-referencia-chat.png`: **referência visual**, não usar como screenshot de fundo. Reconstruir componentes acessíveis e funcionais.

## Identidade
Design leve, premium e acolhedor. Superfícies branco-marfim (`#FFFFFF`, `#F8FAF7`), texto verde muito escuro (`#0D2924`), verde primário (`#167A43`), verde secundário (`#64B66A`), bordas esverdeadas suaves (`#E1EAE2`), sombras difusas discretas. Cores são parâmetros iniciais a verificar visualmente contra asset, não substituir os verdes originais dentro da imagem. Fontes: `Inter` (ou fonte sans profissional com fallback). Não inserir amarelo/azul indiscriminadamente: apenas detalhes específicos do contexto.

## Geometria desktop
- Janela ancorada a 20–28px da lateral/base (respeitar viewport), largura aproximada 400–460px; altura dinâmica `min(720px, calc(100dvh - 32px))`, nunca ultrapassar viewport.
- Cantos ~28px, backdrop ligeiramente translúcido, sombra macia. Header com esfera 48–58px, título Néia e legenda “Inteligência Artificial da FUNEP”, botão minimizar e fechar com tooltip.
- Boas-vindas: “Olá! Eu sou a Néia, a inteligência artificial da FUNEP. Estou aqui para ajudar você a encontrar informações sobre cursos, projetos, eventos, serviços e muito mais. Como posso ajudar?” (não fingir serviços disponíveis em tempo real). Quatro sugestões institucionais configuráveis: cursos, projetos, editais, contato. Em outros contextos, trocar sugestões por dados de configuração.
- Mensagens em bolhas com alinhamento, indicadores de autor, horários discretos, links seguros, estados de envio e possibilidade de retry. Composer fixado embaixo, textarea de 1–5 linhas, Ctrl/⌘+Enter opcionais, Enter envia e Shift+Enter quebra linha, botão enviar.

## Mobile
- 320px em diante; widget aberto usa `position: fixed; inset:0` com `100dvh`, `env(safe-area-inset-*)`, sem margens, raio 0 em telas estreitas. Teclado não deve esconder composer; rolagem dentro do chat, não página host.
- Launcher circular ~60px com esfera recortada de modo correto, foco acessível; fechar retorna foco ao launcher.
- Standalone full-screen: mesmo chat sem botão flutuante, cabeçalho e composer integrados.

## Microinterações
Fade/scale delicados 150–250ms, hover 120–180ms. “Néia viva” = pulso luminoso mínimo e variação de brilho discretíssima, sem deslocamento, rotação ou distorção da forma; respeitar motion reduction. Loading em pontos/linhas suaves, nunca animação espalhafatosa.

## Estados
Inicial; digitando; recebendo streaming; resposta completa; erro; offline; desconectado; indisponibilidade; vazio; reconexão; sessão expirada. Preservar texto digitado diante de falha, opção de reenviar.

## Acessibilidade
Dialog acessível no widget (foco preso enquanto modal full-screen quando apropriado), Escape fecha, `aria-label`, região de mensagens anunciada com moderação, botões 44px em mobile, sem ARIA enganosa.
