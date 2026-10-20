ALTER TABLE "Integration"
  ADD COLUMN "installationAliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

DO $$
DECLARE
  item RECORD;
  canonical_id TEXT;
BEGIN
  FOR item IN
    SELECT "id", "installationId"
    FROM "Integration"
    WHERE "installationId" IN (
      'dev-institucional-public-installation',
      'dev-livraria-public-installation',
      'dev-eventos-public-installation',
      'dev-geral-public-installation'
    )
  LOOP
    canonical_id := replace(item."installationId", 'dev-', 'dev-neia-');
    IF NOT EXISTS (
      SELECT 1 FROM "Integration"
      WHERE "installationId" = canonical_id AND "id" <> item."id"
    ) THEN
      UPDATE "Integration"
      SET "installationAliases" = array_append("installationAliases", item."installationId"),
          "installationId" = canonical_id
      WHERE "id" = item."id";
    END IF;
  END LOOP;
END $$;

UPDATE "Integration" SET "label" = 'Néia' WHERE "label" = 'Népi';
