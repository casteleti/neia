ALTER TABLE "Message" ADD COLUMN "replyToId" UUID;
CREATE UNIQUE INDEX "Message_replyToId_key" ON "Message"("replyToId");
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
