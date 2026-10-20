import 'dotenv/config';
import { cleanExpiredRecords } from '../src/retention.js';
import { prisma } from '../src/db.js';
try { const result = await cleanExpiredRecords(); console.info(`Limpeza concluída; sessões removidas: ${result.sessions}; conversas removidas: ${result.conversations}.`); }
finally { await prisma.$disconnect(); }
