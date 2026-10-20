import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { app } from './server.js';
import { prisma } from './db.js';
import { createVisitorSession } from './session.js';

const origin = 'http://test.example';
const slug = `test-${randomUUID()}`;
let integrationId = '';
const legacyInstallationId = `legacy-${randomUUID()}`;

before(async () => {
  const integration = await prisma.integration.create({ data: { slug, installationId: `test-install-${randomUUID()}`, installationAliases: [legacyInstallationId], label: 'Integração de teste', context: 'geral', allowedOrigins: [origin], themeJson: {}, suggestionsJson: [] } });
  integrationId = integration.id;
});
after(async () => { await prisma.integration.deleteMany({ where: { id: integrationId } }); await app.close(); await prisma.$disconnect(); });

test('resolve integration accepts its exact allowlisted origin only', async () => {
  const permitted = await app.inject({ method: 'POST', url: '/api/v1/integrations/resolve', headers: { origin }, payload: { installationId: `test-install-${slug.slice(5)}` } });
  // Resolve by the actual generated installation ID from the fixture lookup.
  const record = await prisma.integration.findUniqueOrThrow({ where: { id: integrationId } });
  const correct = await app.inject({ method: 'POST', url: '/api/v1/integrations/resolve', headers: { origin }, payload: { installationId: record.installationId } });
  const legacy = await app.inject({ method: 'POST', url: '/api/v1/integrations/resolve', headers: { origin }, payload: { installationId: legacyInstallationId } });
  const rejected = await app.inject({ method: 'POST', url: '/api/v1/integrations/resolve', headers: { origin: 'http://attacker.example' }, payload: { installationId: record.installationId } });
  assert.equal(permitted.statusCode, 403);
  assert.equal(correct.statusCode, 200);
  assert.equal(legacy.statusCode, 200);
  assert.equal(rejected.statusCode, 403);
});

test('conversation reads are restricted to their visitor session', async () => {
  const session = await createVisitorSession(integrationId);
  const otherSession = await createVisitorSession(integrationId);
  const conversation = await prisma.conversation.create({ data: { sessionId: session.session.id, integrationId } });
  await prisma.message.create({ data: { conversationId: conversation.id, role: 'assistant', content: 'Histórico preservado.' } });
  const own = await app.inject({ method: 'GET', url: `/api/v1/conversations/${conversation.id}/messages`, headers: { origin, 'x-neia-host-origin': origin, authorization: `Bearer ${session.token}` } });
  const crossSession = await app.inject({ method: 'GET', url: `/api/v1/conversations/${conversation.id}/messages`, headers: { origin, authorization: `Bearer ${otherSession.token}` } });
  const anonymous = await app.inject({ method: 'GET', url: `/api/v1/conversations/${conversation.id}/messages`, headers: { origin } });
  assert.equal(own.statusCode, 200);
  assert.deepEqual(own.json().messages.map((message: { content: string }) => message.content), ['Histórico preservado.']);
  assert.equal(crossSession.statusCode, 404);
  assert.equal(anonymous.statusCode, 401);
});

test('invalid chat payload is rejected before provider execution', async () => {
  const session = await createVisitorSession(integrationId);
  const conversation = await prisma.conversation.create({ data: { sessionId: session.session.id, integrationId } });
  const response = await app.inject({ method: 'POST', url: `/api/v1/conversations/${conversation.id}/messages/stream`, headers: { origin, authorization: `Bearer ${session.token}` }, payload: { content: '   ' } });
  assert.equal(response.statusCode, 400);
  assert.equal((await prisma.message.count({ where: { conversationId: conversation.id } })), 0);
});
