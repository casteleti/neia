import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const green = { primary: '#167A43', surface: '#FFFFFF' };
const contexts = [
  { slug: 'institucional', label: 'FUNEP', context: 'institucional', suggestions: ['Quais são os cursos disponíveis?', 'Como participar de um projeto?', 'Quais são os editais em aberto?', 'Como entrar em contato?'] },
  { slug: 'livraria', label: 'Livraria', context: 'livraria', suggestions: ['Como encontrar publicações da FUNEP?', 'Como falar com a livraria?'] },
  { slug: 'eventos', label: 'Eventos', context: 'eventos', suggestions: ['Como encontro informações sobre eventos?', 'Como tirar dúvidas sobre inscrições?'] },
  { slug: 'geral', label: 'Néia', context: 'geral', suggestions: ['Como a Néia pode me ajudar?', 'Como entrar em contato?'] },
];

try {
  if (process.env.NODE_ENV === 'production') throw new Error('O seed demonstrativo está desabilitado em produção.');
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:4173').split(',').map((value) => value.trim());
  for (const item of contexts) {
    await prisma.integration.upsert({
      where: { slug: item.slug }, update: { label: item.label, context: item.context, allowedOrigins, themeJson: green, suggestionsJson: item.suggestions },
      create: { slug: item.slug, label: item.label, context: item.context, allowedOrigins, themeJson: green, suggestionsJson: item.suggestions, installationId: `dev-neia-${item.slug}-public-installation` },
    });
  }
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD precisa ter pelo menos 12 caracteres.');
    const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await prisma.adminUser.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } });
    console.info('Administrador local inicializado:', email);
  }
  console.info('Integrações demonstrativas criadas/atualizadas.');
} finally {
  await prisma.$disconnect();
}
