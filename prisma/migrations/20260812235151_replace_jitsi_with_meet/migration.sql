-- DropIndex
DROP INDEX "classes_sessions_sala_jitsi_id_key";

-- AlterTable
ALTER TABLE "classes_sessions" DROP COLUMN "sala_jitsi_id",
ADD COLUMN     "meet_event_id" TEXT,
ADD COLUMN     "meet_url" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "classes_sessions_meet_event_id_key" ON "classes_sessions"("meet_event_id");

