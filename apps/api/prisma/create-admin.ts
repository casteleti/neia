import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Uso: pnpm db:admin:create admin@exemplo.org.br');
const password = randomBytes(24).toString('base64url');
const prisma = new PrismaClient();
try {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.create({ data: { email, passwordHash } });
  console.info(`Administrador criado: ${user.email}`);
  console.info('Senha temporária (copie agora e guarde em local seguro):');
  console.info(password);
} finally { await prisma.$disconnect(); }
