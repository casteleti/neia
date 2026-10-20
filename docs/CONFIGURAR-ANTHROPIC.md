# Configurar a API da Anthropic

O backend já usa o SDK oficial TypeScript da Anthropic, envia mensagens pelo Messages API e transmite as respostas ao chat. A chamada ocorre apenas no servidor; a chave não deve ser enviada ao navegador.

## Configuração local

1. Crie uma chave no painel **API Keys** do [Claude Console](https://console.anthropic.com/settings/keys). A conta precisa estar habilitada para uso da API.
2. Edite `apps/api/.env`, que é o arquivo local carregado pela API, e configure:

   ```dotenv
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sua-chave-da-api
   ANTHROPIC_MODEL=claude-haiku-5-5
   ```

3. Reinicie `pnpm dev` para a API carregar a configuração.
4. Abra o chat e envie uma mensagem. Em caso de erro de autenticação ou saldo, confira a chave e o estado da conta no Console.

`apps/api/.env` é local e não deve ser commitado. Não cole a chave em mensagens, tickets ou arquivos do frontend. Em produção, use o secret manager da infraestrutura e configure `AI_PROVIDER`, `ANTHROPIC_API_KEY` e `ANTHROPIC_MODEL` no processo da API.

O modelo configurado por padrão é `claude-haiku-5-5`, opção de menor latência e custo da linha atual conforme a [visão geral oficial de modelos](https://platform.claude.com/docs/en/models/overview). O ID pode ser trocado por outro modelo disponível à conta.

## Limites funcionais

Fontes institucionais da FUNEP ainda não estão conectadas; a Néia deve declarar essa limitação quando a pergunta depender desses dados atuais.

O segredo da API e o consumo correspondente pertencem à conta Anthropic que criou a chave. Revise permissões e limites de gasto dessa conta antes de disponibilizar o chat a outros usuários.
