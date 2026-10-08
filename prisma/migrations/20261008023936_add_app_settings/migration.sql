-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "precio_por_hora_usd" DECIMAL(10,2) NOT NULL DEFAULT 20,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- Seed the single settings row so app code can rely on it always existing
-- (no upsert-on-read needed).
INSERT INTO "app_settings" ("id", "precio_por_hora_usd", "updated_at")
VALUES ('default', 20, now());
