CREATE TYPE "DataOrigin" AS ENUM ('LIVE', 'MANUAL', 'IMPORTED', 'DEMO');

ALTER TABLE "MetricSnapshot"
  ADD COLUMN "dataOrigin" "DataOrigin" NOT NULL DEFAULT 'LIVE',
  ADD COLUMN "sourceSystem" TEXT,
  ADD COLUMN "sourceExternalId" TEXT,
  ADD COLUMN "sourcedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "sourceMetadata" JSONB;

ALTER TABLE "ConversionEvent"
  ADD COLUMN "dataOrigin" "DataOrigin" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "sourceSystem" TEXT,
  ADD COLUMN "sourcedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "actorUserId" TEXT;

ALTER TABLE "Lead"
  ADD COLUMN "dataOrigin" "DataOrigin" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "sourceSystem" TEXT,
  ADD COLUMN "sourceExternalId" TEXT,
  ADD COLUMN "sourcedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "actorUserId" TEXT;

ALTER TABLE "Sale"
  ADD COLUMN "dataOrigin" "DataOrigin" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "sourceSystem" TEXT,
  ADD COLUMN "sourceExternalId" TEXT,
  ADD COLUMN "sourcedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "actorUserId" TEXT;

ALTER TABLE "WhatsAppMessage"
  ADD COLUMN "dataOrigin" "DataOrigin" NOT NULL DEFAULT 'LIVE',
  ADD COLUMN "sourceSystem" TEXT DEFAULT 'WHATSAPP',
  ADD COLUMN "sourcedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "MetricSnapshot_dataOrigin_idx" ON "MetricSnapshot"("dataOrigin");
CREATE INDEX "MetricSnapshot_sourceSystem_sourceExternalId_idx" ON "MetricSnapshot"("sourceSystem", "sourceExternalId");
CREATE INDEX "ConversionEvent_companyId_dataOrigin_idx" ON "ConversionEvent"("companyId", "dataOrigin");
CREATE INDEX "Lead_companyId_dataOrigin_idx" ON "Lead"("companyId", "dataOrigin");
CREATE INDEX "Lead_sourceSystem_sourceExternalId_idx" ON "Lead"("sourceSystem", "sourceExternalId");
CREATE INDEX "Sale_companyId_dataOrigin_idx" ON "Sale"("companyId", "dataOrigin");
CREATE INDEX "Sale_sourceSystem_sourceExternalId_idx" ON "Sale"("sourceSystem", "sourceExternalId");
CREATE INDEX "WhatsAppMessage_dataOrigin_idx" ON "WhatsAppMessage"("dataOrigin");
