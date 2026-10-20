CREATE TABLE "AgendaEvent" (
  "id" UUID NOT NULL,
  "sourceUrl" VARCHAR(2048) NOT NULL,
  "title" VARCHAR(500) NOT NULL,
  "summary" TEXT NOT NULL,
  "sourceContent" TEXT NOT NULL,
  "period" VARCHAR(300),
  "startDate" DATE,
  "endDate" DATE,
  "modality" VARCHAR(120),
  "location" VARCHAR(500),
  "workload" VARCHAR(120),
  "targetAudience" TEXT NOT NULL,
  "registrationUrl" VARCHAR(2048),
  "contentHash" VARCHAR(64) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AgendaEvent_sourceUrl_key" ON "AgendaEvent"("sourceUrl");
CREATE INDEX "AgendaEvent_active_startDate_idx" ON "AgendaEvent"("active", "startDate");
