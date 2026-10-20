CREATE TYPE "MessageRole" AS ENUM ('user', 'assistant');

CREATE TABLE "Integration" (
  "id" UUID NOT NULL, "slug" VARCHAR(80) NOT NULL,
  "installationId" VARCHAR(120) NOT NULL, "label" VARCHAR(120) NOT NULL,
  "context" VARCHAR(40) NOT NULL, "allowedOrigins" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "enabled" BOOLEAN NOT NULL DEFAULT true, "themeJson" JSONB NOT NULL, "suggestionsJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "VisitorSession" (
  "id" UUID NOT NULL, "integrationId" UUID NOT NULL, "credentialHash" VARCHAR(64) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VisitorSession_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Conversation" (
  "id" UUID NOT NULL, "sessionId" UUID NOT NULL, "integrationId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3), CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Message" (
  "id" UUID NOT NULL, "conversationId" UUID NOT NULL, "role" "MessageRole" NOT NULL,
  "content" VARCHAR(8000) NOT NULL, "status" VARCHAR(20) NOT NULL DEFAULT 'complete',
  "idempotencyKey" VARCHAR(100), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AdminUser" (
  "id" UUID NOT NULL, "email" VARCHAR(254) NOT NULL, "passwordHash" VARCHAR(100) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "lastLoginAt" TIMESTAMP(3),
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditLog" (
  "id" UUID NOT NULL, "actorId" UUID, "action" VARCHAR(80) NOT NULL,
  "targetType" VARCHAR(80) NOT NULL, "targetId" VARCHAR(120), "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Integration_slug_key" ON "Integration"("slug");
CREATE UNIQUE INDEX "Integration_installationId_key" ON "Integration"("installationId");
CREATE INDEX "VisitorSession_integrationId_expiresAt_idx" ON "VisitorSession"("integrationId", "expiresAt");
CREATE UNIQUE INDEX "VisitorSession_credentialHash_key" ON "VisitorSession"("credentialHash");
CREATE INDEX "Conversation_sessionId_updatedAt_idx" ON "Conversation"("sessionId", "updatedAt");
CREATE INDEX "Conversation_integrationId_idx" ON "Conversation"("integrationId");
CREATE UNIQUE INDEX "Message_conversationId_idempotencyKey_key" ON "Message"("conversationId", "idempotencyKey");
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
ALTER TABLE "VisitorSession" ADD CONSTRAINT "VisitorSession_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "VisitorSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
