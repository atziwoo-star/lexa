-- AlterEnum
ALTER TYPE "EstadoGrabacion" ADD VALUE 'ELIMINADA';

-- AlterTable
ALTER TABLE "classes_sessions" ADD COLUMN     "grabacion_compartida_at" TIMESTAMP(3),
ADD COLUMN     "grabacion_drive_file_id" TEXT,
ADD COLUMN     "meet_conference_id" TEXT;

