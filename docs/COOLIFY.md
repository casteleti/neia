# Publicação no Coolify

## Arquitetura

Use `compose.production.yaml` como configuração do recurso Docker Compose no Coolify. O serviço `app` executa o Fastify em produção na porta interna `3001`; ele serve a interface React compilada, `/api`, `/admin` e os endpoints de health check pelo mesmo domínio. Configure no Coolify o domínio `https://neia.daksa.com.br` para o serviço `app` na porta `3001` e habilite TLS automático. O serviço `db` não publica portas e mantém os dados no volume `neia-postgres-data`.

O Dockerfile de produção é separado do `Dockerfile` de desenvolvimento. Ele compila a interface e a API, e inicia o servidor compilado sem `pnpm dev`, sem seed demonstrativo e sem migração automática.

## Variáveis no Coolify

Cadastre no recurso Compose, sem colocar os valores em arquivos versionados:

- `POSTGRES_DB=neia`
- `POSTGRES_USER=neia_app`
- `POSTGRES_PASSWORD`: segredo aleatório forte, apenas alfanumérico para compor a URL sem ambiguidades.
- `DATABASE_URL=postgresql://neia_app:<mesma-senha>@db:5432/neia?schema=public`
- `SESSION_SECRET`: segredo aleatório com pelo menos 32 caracteres.
- `ADMIN_COOKIE_SECRET`: outro segredo aleatório, diferente do `SESSION_SECRET`, com pelo menos 32 caracteres.
- `AI_PROVIDER=demo`
- `DATA_RETENTION_DAYS=30`

Deixe `ANTHROPIC_API_KEY` vazio enquanto a aplicação estiver em modo demo. Se a Anthropic for ativada em outro momento, armazene a chave como secret no Coolify e defina `AI_PROVIDER=anthropic`.

Não use os valores de desenvolvimento do `compose.yaml`. O `DATABASE_URL` deve apontar ao host interno `db`; não exponha a porta PostgreSQL ao host público.

## Primeira inicialização

1. Confirme que o DNS de `neia.daksa.com.br` aponta para o servidor Coolify responsável pelo proxy e que as portas HTTP/HTTPS estão acessíveis.
2. Crie o recurso Compose a partir da branch `main`, usando `compose.production.yaml` como arquivo Compose.
3. Configure as variáveis acima e a rota de domínio para `app:3001`; mantenha `db` sem domínio.
4. Faça o primeiro deploy mantendo o domínio sem acesso público até concluir a inicialização. O endpoint `/health/ready` só confirma conectividade com o banco; ele não verifica se as migrations foram aplicadas.
5. Pelo terminal do serviço `app` no Coolify, execute uma única vez `./node_modules/.bin/prisma migrate deploy --schema apps/api/prisma/schema.prisma` e confirme que terminou com sucesso. Não execute `db:seed` em produção.
6. Crie o primeiro administrador pelo terminal do serviço `app` com `./node_modules/.bin/tsx apps/api/prisma/create-admin.ts admin@<domínio-da-equipe>`. A senha é exibida uma única vez; guarde-a em um cofre seguro e não a copie para logs ou chats.
7. Configure backups agendados do PostgreSQL no Coolify para um destino persistente e confirme que existe um procedimento de restauração. Não considere o volume local como backup.
8. Valide `https://neia.daksa.com.br/health/ready`, a interface, login administrativo e logs. Libere acesso público somente depois dessas verificações.

Não use reset de banco, limpeza de dados ou remoção do volume durante o deploy. Para atualizações futuras, revise as migrations antes de aplicá-las; o processo de início da aplicação não as executa automaticamente.
