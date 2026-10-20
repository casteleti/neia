import { prisma } from './db.js';

const parsedDays = Number(process.env.DATA_RETENTION_DAYS ?? 30);
const retentionDays = Number.isInteger(parsedDays) && parsedDays >= 1 && parsedDays <= 365 ? parsedDays : 30;
export async function cleanExpiredRecords() {
  const now = new Date(); const cutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);
  const sessions = await prisma.visitorSession.deleteMany({ where: { expiresAt: { lt: now } } });
  const conversations = await prisma.conversation.deleteMany({ where: { OR: [{ createdAt: { lt: cutoff } }, { deletedAt: { lt: cutoff } }] } });
  await prisma.auditLog.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } } });
  return { sessions: sessions.count, conversations: conversations.count };
}
