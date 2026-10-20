import { createHash, randomBytes } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from './db.js';

export function hashToken(token: string): string { return createHash('sha256').update(token).digest('hex'); }
function isExactOrigin(value: string): boolean { try { return new URL(value).origin === value; } catch { return false; } }
export function requestOrigin(request: FastifyRequest): string | undefined {
  const origin = request.headers.origin;
  return origin && isExactOrigin(origin) ? origin : undefined;
}
export async function authorizeIntegration(request: FastifyRequest, installationId: string) {
  const origin = requestOrigin(request);
  if (!origin) return null;
  return prisma.integration.findFirst({ where: { OR: [{ installationId }, { installationAliases: { has: installationId } }], enabled: true, allowedOrigins: { has: origin } } });
}
export async function requireVisitor(request: FastifyRequest, reply: FastifyReply) {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token || token.length < 40) {
    await reply.code(401).send({ error: { code: 'SESSION_REQUIRED', message: 'Inicie uma sessão para continuar.' } });
    return null;
  }
  const session = await prisma.visitorSession.findUnique({ where: { credentialHash: hashToken(token) }, include: { integration: true } });
  if (!session || session.expiresAt <= new Date() || !session.integration.enabled) {
    await reply.code(401).send({ error: { code: 'SESSION_EXPIRED', message: 'Sua sessão expirou. Inicie uma nova conversa.' } });
    return null;
  }
  let browserOrigin = requestOrigin(request);
  const appOrigin = new URL(process.env.APP_BASE_URL ?? 'http://localhost:5173').origin;
  if (!browserOrigin && `${request.protocol}://${request.headers.host}` === appOrigin) browserOrigin = appOrigin;
  const claimedHost = request.headers['x-neia-host-origin'] ?? request.headers['x-nepi-host-origin'];
  let trustedOrigin = browserOrigin;
  if (typeof claimedHost === 'string') {
    // A standalone chat may be opened directly on a LAN or Tailscale address.
    // Accept its origin claim only when it matches that browser origin; embedded
    // widget requests retain the app-origin to host-origin flow.
    const isStandaloneClaim = browserOrigin === claimedHost;
    const isEmbeddedClaim = browserOrigin === appOrigin;
    if ((!isStandaloneClaim && !isEmbeddedClaim) || !isExactOrigin(claimedHost)) {
      await reply.code(403).send({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Esta origem não está autorizada.' } });
      return null;
    }
    trustedOrigin = claimedHost;
  }
  if (!trustedOrigin || !session.integration.allowedOrigins.includes(trustedOrigin)) {
    await reply.code(403).send({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Esta origem não está autorizada.' } });
    return null;
  }
  return { ...session, token };
}
export async function createVisitorSession(integrationId: string) {
  const token = randomBytes(32).toString('base64url');
  const session = await prisma.visitorSession.create({ data: { integrationId, credentialHash: hashToken(token), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
  return { session, token };
}
