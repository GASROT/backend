CREATE TABLE "ExperimentEvent" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperimentEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ExperimentEvent_experimentId_variant_eventType_idx"
    ON "ExperimentEvent"("experimentId", "variant", "eventType");

CREATE INDEX "ExperimentEvent_subjectId_experimentId_idx"
    ON "ExperimentEvent"("subjectId", "experimentId");

CREATE UNIQUE INDEX "ExperimentEvent_experimentId_variant_eventType_subjectId_key"
    ON "ExperimentEvent"("experimentId", "variant", "eventType", "subjectId");
