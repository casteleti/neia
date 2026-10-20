import 'dotenv/config';
import fastifyStatic from '@fastify/static';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { prisma } from './db.js';
import { authorizeIntegration, createVisitorSession, requestOrigin, requireVisitor } from './session.js';
import { createProvider } from './provider.js';
import { cleanExpiredRecords } from './retention.js';

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) throw new Error('SESSION_SECRET é obrigatório em produção.');
const sessionSecret = process.env.SESSION_SECRET ?? 'local-development-session-secret-change-me';
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:4173').split(',').map((origin) => origin.trim()).filter(Boolean);
const adminOrigins = (process.env.ADMIN_ALLOWED_ORIGINS ?? 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean);
export const app = Fastify({ logger: { level: process.env.NODE_ENV === 'production' ? 'info' : 'warn', redact: ['req.headers.authorization', 'req.headers.cookie'] }, bodyLimit: 16_384, trustProxy: process.env.TRUST_PROXY === 'true', requestIdHeader: 'x-request-id', genReqId: () => randomUUID() });
await app.register(cookie, { secret: process.env.ADMIN_COOKIE_SECRET ?? sessionSecret });
const applicationOrigin = new URL(process.env.APP_BASE_URL ?? 'http://localhost:5173').origin;
await app.register(cors, { origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin) || adminOrigins.includes(origin) || origin === applicationOrigin) { callback(null, true); return; }
  void prisma.integration.findFirst({ where: { enabled: true, allowedOrigins: { has: origin } }, select: { id: true } }).then((integration) => callback(null, Boolean(integration))).catch(() => callback(null, false));
}, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Request-Id', 'X-Neia-Host-Origin', 'X-NePi-Host-Origin'] });
app.addHook('onSend', async (_request, reply, payload) => {
  reply.header('x-content-type-options', 'nosniff');
  reply.header('referrer-policy', 'strict-origin-when-cross-origin');
  const requestPath = _request.url.split('?')[0] ?? _request.url;
  if (requestPath.startsWith('/api/') || requestPath.startsWith('/health/')) reply.header('x-frame-options', 'DENY');
  if (!reply.getHeader('content-security-policy')) {
    const apiOrigin = new URL(process.env.API_BASE_URL ?? process.env.APP_BASE_URL ?? 'http://localhost:5173').origin;
    const ancestors = requestPath.startsWith('/admin') ? "'none'" : "'self'";
    reply.header('content-security-policy', `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ${apiOrigin}; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors ${ancestors}`);
  }
  if (process.env.NODE_ENV === 'production') reply.header('strict-transport-security', 'max-age=31536000; includeSubDomains');
  return payload;
});

const attempts = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (attempts.size > 10_000) for (const [expiredKey, value] of attempts) if (value.resetAt <= now) attempts.delete(expiredKey);
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) { attempts.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
function tooMany(reply: FastifyReply) { return reply.code(429).send({ error: { code: 'RATE_LIMITED', message: 'Muitas tentativas. Aguarde um pouco e tente novamente.' } }); }
function csrfValid(request: FastifyRequest): boolean { return typeof request.headers.origin === 'string' && adminOrigins.includes(request.headers.origin); }
function eventStreamHeaders(request: FastifyRequest, noBuffer = false): Record<string, string> {
  const origin = requestOrigin(request);
  return { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive', 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin', ...(origin ? { 'access-control-allow-origin': origin, vary: 'Origin' } : {}), ...(noBuffer ? { 'x-accel-buffering': 'no' } : {}) };
}
async function adminUser(request: FastifyRequest, reply: FastifyReply) {
  const signed = request.cookies.admin;
  const cookieValue = signed ? request.unsignCookie(signed) : null;
  if (!cookieValue?.valid || !cookieValue.value) { await reply.code(401).send({ error: { code: 'ADMIN_AUTH_REQUIRED', message: 'Entre novamente para continuar.' } }); return null; }
  const user = await prisma.adminUser.findUnique({ where: { id: cookieValue.value }, select: { id: true, email: true } });
  if (!user) { await reply.code(401).send({ error: { code: 'ADMIN_AUTH_REQUIRED', message: 'Entre novamente para continuar.' } }); return null; }
  return user;
}
const integrationSchema = z.object({ installationId: z.string().min(8).max(120) });
const messageSchema = z.object({ content: z.string().trim().min(1).max(2000) });
const loginSchema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) });
const patchIntegrationSchema = z.object({ enabled: z.boolean().optional(), allowedOrigins: z.array(z.string().url()).max(30).optional(), label: z.string().trim().min(1).max(120).optional(), suggestions: z.array(z.string().trim().min(1).max(160)).max(8).optional() }).strict();
if (!['demo', 'anthropic'].includes(process.env.AI_PROVIDER ?? 'demo')) throw new Error('AI_PROVIDER deve ser demo ou anthropic.');
const provider = createProvider();

app.get('/health/live', async () => ({ status: 'ok' }));
app.get('/health/ready', async (_request, reply) => {
  try { await prisma.$queryRaw`SELECT 1`; return { status: 'ok', database: 'ready' }; }
  catch { return reply.code(503).send({ status: 'unavailable', database: 'unavailable' }); }
});
app.post('/api/v1/integrations/resolve', async (request, reply) => {
  const origin = requestOrigin(request);
  if (!origin) return reply.code(403).send({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origem não identificada.' } });
  if (!checkRateLimit(`resolve:${request.ip}:${origin}`, 120, 60_000)) return tooMany(reply);
  const parsed = integrationSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'Identificador de instalação inválido.' } });
  const integration = await authorizeIntegration(request, parsed.data.installationId);
  if (!integration) return reply.code(403).send({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Esta instalação não está autorizada para esta origem.' } });
  return { id: integration.id, slug: integration.slug, label: integration.label, context: integration.context, theme: integration.themeJson, suggestions: integration.suggestionsJson, capabilities: { demo: (process.env.AI_PROVIDER ?? 'demo') === 'demo' } };
});
app.post('/api/v1/sessions', async (request, reply) => {
  const origin = requestOrigin(request);
  if (!origin) return reply.code(403).send({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origem não identificada.' } });
  if (!checkRateLimit(`session:${request.ip}:${origin}`, 20, 60 * 60_000)) return tooMany(reply);
  const parsed = integrationSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'Identificador de instalação inválido.' } });
  const integration = await authorizeIntegration(request, parsed.data.installationId);
  if (!integration) return reply.code(403).send({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Esta instalação não está autorizada para esta origem.' } });
  const created = await createVisitorSession(integration.id);
  return reply.code(201).send({ token: created.token, expiresAt: created.session.expiresAt, integration: { id: integration.id, context: integration.context, suggestions: integration.suggestionsJson } });
});

app.get('/api/v1/sessions/me/conversations', async (request, reply) => {
  const session = await requireVisitor(request, reply); if (!session) return;
  const conversations = await prisma.conversation.findMany({ where: { sessionId: session.id, deletedAt: null }, orderBy: { updatedAt: 'desc' }, take: 50, select: { id: true, integrationId: true, createdAt: true, updatedAt: true } });
  return { conversations };
});
app.post('/api/v1/conversations', async (request, reply) => {
  const session = await requireVisitor(request, reply); if (!session) return;
  const conversation = await prisma.conversation.create({ data: { sessionId: session.id, integrationId: session.integrationId } });
  return reply.code(201).send({ conversation: { id: conversation.id, integrationId: conversation.integrationId, createdAt: conversation.createdAt, updatedAt: conversation.updatedAt } });
});
app.get<{ Params: { id: string } }>('/api/v1/conversations/:id/messages', async (request, reply) => {
  const session = await requireVisitor(request, reply); if (!session) return;
  if (!z.string().uuid().safeParse(request.params.id).success) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Conversa não encontrada.' } });
  const conversation = await prisma.conversation.findFirst({ where: { id: request.params.id, sessionId: session.id, deletedAt: null }, select: { id: true } });
  if (!conversation) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Conversa não encontrada.' } });
  const messages = await prisma.message.findMany({ where: { conversationId: conversation.id }, orderBy: { createdAt: 'asc' }, take: 200 });
  return { messages };
});
app.post<{ Params: { id: string } }>('/api/v1/conversations/:id/messages/stream', async (request, reply) => {
  const session = await requireVisitor(request, reply); if (!session) return;
  if (!z.string().uuid().safeParse(request.params.id).success) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Conversa não encontrada.' } });
  if (!checkRateLimit(`message:${session.id}`, 30, 60_000)) return tooMany(reply);
  const parsed = messageSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'A mensagem precisa ter entre 1 e 2.000 caracteres.' } });
  const conversation = await prisma.conversation.findFirst({ where: { id: request.params.id, sessionId: session.id, deletedAt: null } });
  if (!conversation) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Conversa não encontrada.' } });
  const keyHeader = request.headers['idempotency-key'];
  const idempotencyKey = typeof keyHeader === 'string' && /^[\w-]{8,100}$/.test(keyHeader) ? keyHeader : undefined;
  let userMessage;
  try { userMessage = await prisma.message.create({ data: { conversationId: conversation.id, role: 'user', content: parsed.data.content, status: 'pending', idempotencyKey } }); }
  catch (error) {
    if (!idempotencyKey || !(typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002')) throw error;
    userMessage = await prisma.message.findUnique({ where: { conversationId_idempotencyKey: { conversationId: conversation.id, idempotencyKey } } });
    if (!userMessage) throw error;
    const savedResponse = await prisma.message.findUnique({ where: { replyToId: userMessage.id } });
    if (savedResponse) {
      reply.hijack(); reply.raw.writeHead(200, eventStreamHeaders(request));
      reply.raw.write(`event: start\ndata: ${JSON.stringify({ requestId: request.id })}\n\n`);
      reply.raw.write(`event: delta\ndata: ${JSON.stringify({ content: savedResponse.content })}\n\n`);
      reply.raw.write('event: complete\ndata: {}\n\n'); reply.raw.end(); return;
    }
    if (userMessage.status !== 'error') return reply.code(409).send({ error: { code: 'MESSAGE_PENDING', message: 'A resposta desta mensagem ainda está sendo processada.' } });
    await prisma.message.update({ where: { id: userMessage.id }, data: { status: 'pending' } });
  }
  await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
  const history = await prisma.message.findMany({ where: { conversationId: conversation.id }, orderBy: { createdAt: 'desc' }, take: 20, select: { role: true, content: true } });
  const messages = history.reverse().map((message) => ({ role: message.role as 'user' | 'assistant', content: message.content }));
  const controller = new AbortController();
  let clientDisconnected = false;
  const timeout = setTimeout(() => controller.abort(), 45_000); timeout.unref();
  reply.hijack();
  reply.raw.writeHead(200, eventStreamHeaders(request, true));
  const writeEvent = (type: string, data: unknown) => reply.raw.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  const requestId = request.id;
  reply.raw.on('close', () => { if (!reply.raw.writableEnded) { clientDisconnected = true; controller.abort(); } });
  writeEvent('start', { requestId, userMessageId: userMessage.id });
  let response = '';
  const heartbeat = setInterval(() => writeEvent('heartbeat', {}), 15_000); heartbeat.unref();
  try {
    for await (const chunk of provider.stream(messages, controller.signal)) { response += chunk; writeEvent('delta', { content: chunk }); }
    if (controller.signal.aborted) { await prisma.message.update({ where: { id: userMessage.id }, data: { status: 'error' } }).catch(() => undefined); if (!clientDisconnected) { writeEvent('error', { error: { code: 'TIMEOUT', message: 'A resposta demorou mais que o esperado. Tente novamente.' } }); reply.raw.end(); } return; }
    if (!response) throw new Error('Provider returned an empty response');
    const assistantMessage = await prisma.message.create({ data: { conversationId: conversation.id, role: 'assistant', content: response, status: 'complete', replyToId: userMessage.id } });
    await prisma.message.update({ where: { id: userMessage.id }, data: { status: 'complete' } });
    await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
    writeEvent('complete', { messageId: assistantMessage.id }); reply.raw.end();
  } catch {
    if (!controller.signal.aborted) { await prisma.message.update({ where: { id: userMessage.id }, data: { status: 'error' } }).catch(() => undefined); writeEvent('error', { error: { code: 'UNAVAILABLE', message: 'A Néia não conseguiu responder agora. Tente novamente.' } }); reply.raw.end(); }
  } finally { clearTimeout(timeout); clearInterval(heartbeat); }
});
app.delete<{ Params: { id: string } }>('/api/v1/conversations/:id', async (request, reply) => {
  const session = await requireVisitor(request, reply); if (!session) return;
  if (!z.string().uuid().safeParse(request.params.id).success) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Conversa não encontrada.' } });
  const result = await prisma.conversation.updateMany({ where: { id: request.params.id, sessionId: session.id, deletedAt: null }, data: { deletedAt: new Date() } });
  if (!result.count) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Conversa não encontrada.' } });
  return reply.code(204).send();
});

app.post('/api/v1/admin/login', async (request, reply) => {
  if (!csrfValid(request)) return reply.code(403).send({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origem não permitida.' } });
  const ip = request.ip;
  if (!checkRateLimit(`admin:${ip}`, 8, 15 * 60_000)) return tooMany(reply);
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'Informe e-mail e senha válidos.' } });
  const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email.toLowerCase().trim() } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return reply.code(401).send({ error: { code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha incorretos.' } });
  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: 'admin.login', targetType: 'admin', targetId: user.id } });
  reply.setCookie('admin', user.id, { path: '/api/v1/admin', httpOnly: true, signed: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 60 * 60 });
  return { user: { id: user.id, email: user.email } };
});
app.post('/api/v1/admin/logout', async (request, reply) => {
  if (!csrfValid(request)) return reply.code(403).send({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origem não permitida.' } });
  reply.clearCookie('admin', { path: '/api/v1/admin' }); return reply.code(204).send();
});
app.get('/api/v1/admin/integrations', async (request, reply) => {
  const user = await adminUser(request, reply); if (!user) return;
  const integrations = await prisma.integration.findMany({ orderBy: { slug: 'asc' }, select: { id: true, slug: true, label: true, context: true, installationId: true, installationAliases: true, allowedOrigins: true, enabled: true, suggestionsJson: true } });
  return { integrations };
});
app.patch<{ Params: { id: string } }>('/api/v1/admin/integrations/:id', async (request, reply) => {
  if (!csrfValid(request)) return reply.code(403).send({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origem não permitida.' } });
  const user = await adminUser(request, reply); if (!user) return;
  const parsed = patchIntegrationSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'Configuração da integração inválida.' } });
  if (parsed.data.allowedOrigins?.some((origin) => new URL(origin).origin !== origin)) return reply.code(400).send({ error: { code: 'INVALID_ORIGIN', message: 'Informe origens completas, sem caminhos.' } });
  const { suggestions, ...updates } = parsed.data;
  const integration = await prisma.integration.update({ where: { id: request.params.id }, data: { ...updates, ...(suggestions ? { suggestionsJson: suggestions } : {}) }, select: { id: true, slug: true, label: true, context: true, allowedOrigins: true, enabled: true, suggestionsJson: true } }).catch(() => null);
  if (!integration) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Integração não encontrada.' } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: 'integration.update', targetType: 'integration', targetId: integration.id, metadata: { changedFields: Object.keys(parsed.data) } } });
  return { integration };
});

app.get<{ Querystring: { installationId?: string } }>('/embed', async (request, reply) => {
  const installationId = request.query.installationId;
  if (!installationId) return reply.code(400).send({ error: { code: 'INSTALLATION_REQUIRED', message: 'Identificador público da instalação ausente.' } });
  if (!existsSync(webRoot)) return reply.code(503).send({ error: { code: 'WEB_UNAVAILABLE', message: 'A interface web ainda não foi compilada.' } });
  const integration = await prisma.integration.findFirst({ where: { OR: [{ installationId }, { installationAliases: { has: installationId } }] }, select: { enabled: true, allowedOrigins: true } });
  if (!integration?.enabled) return reply.code(403).send({ error: { code: 'INSTALLATION_UNAVAILABLE', message: 'Esta instalação não está disponível.' } });
  const apiOrigin = new URL(process.env.API_BASE_URL ?? process.env.APP_BASE_URL ?? 'http://localhost:5173').origin;
  const ancestors = ["'self'", ...integration.allowedOrigins].join(' ');
  reply.header('content-security-policy', `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ${apiOrigin}; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors ${ancestors}`);
  return reply.type('text/html').sendFile('index.html');
});

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../web/dist');
if (existsSync(webRoot)) {
  await app.register(fastifyStatic, { root: webRoot, prefix: '/', list: false, index: ['index.html'], decorateReply: true });
  app.setNotFoundHandler((request, reply) => {
    const pathname = request.url.split('?')[0] ?? request.url;
    if (request.method === 'GET' && request.headers.accept?.includes('text/html') && !pathname.startsWith('/api/') && !pathname.startsWith('/health/') && !pathname.includes('.')) return reply.type('text/html').sendFile('index.html');
    return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' } });
  });
}

app.setErrorHandler((error, request, reply) => {
  request.log.error({ err: error instanceof Error ? { name: error.name, code: 'code' in error ? error.code : undefined } : { name: 'UnknownError' }, requestId: request.id }, 'Falha da API');
  if (reply.sent) return;
  return reply.code(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro inesperado.', requestId: request.id } });
});
const port = Number(process.env.API_PORT ?? 3001);
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cleanup = () => { void cleanExpiredRecords().catch((error: unknown) => app.log.warn({ err: error instanceof Error ? error.name : 'UnknownError' }, 'Falha na limpeza de retenção')); };
  cleanup(); const retentionTimer = setInterval(cleanup, 6 * 60 * 60 * 1000); retentionTimer.unref();
  app.addHook('onClose', async () => { clearInterval(retentionTimer); });
  await app.listen({ port, host: '0.0.0.0' });
}
