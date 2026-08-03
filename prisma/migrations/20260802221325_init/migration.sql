-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ALUMNO', 'PROFESOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Idioma" AS ENUM ('INGLES', 'ESPANOL', 'COREANO');

-- CreateEnum
CREATE TYPE "EstadoBooking" AS ENUM ('CONFIRMADA', 'CANCELADA', 'COMPLETADA', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'COMPLETADO', 'FALLIDO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "EstadoClase" AS ENUM ('PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoGrabacion" AS ENUM ('NO_DISPONIBLE', 'PROCESANDO', 'DISPONIBLE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'ALUMNO',
    "idiomas" "Idioma"[],
    "nivel" TEXT,
    "zona_horaria" TEXT NOT NULL,
    "moneda_preferida" TEXT NOT NULL DEFAULT 'USD',
    "profesor_preferido_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "idiomas" "Idioma"[],
    "bio" TEXT,
    "zona_horaria" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_slots" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "idioma" "Idioma" NOT NULL,
    "inicio_utc" TIMESTAMP(3) NOT NULL,
    "fin_utc" TIMESTAMP(3) NOT NULL,
    "capacidad_max" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "horas_consumidas" DECIMAL(5,2) NOT NULL DEFAULT 1,
    "estado" "EstadoBooking" NOT NULL DEFAULT 'CONFIRMADA',
    "fecha_limite_cancelacion" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hour_packages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "horas_compradas" DECIMAL(6,2) NOT NULL,
    "horas_consumidas" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "fecha_compra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "moneda" TEXT NOT NULL,
    "monto_usd" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hour_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hour_package_id" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "moneda" TEXT NOT NULL,
    "monto_usd" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "referencia_stripe" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes_sessions" (
    "id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "sala_jitsi_id" TEXT NOT NULL,
    "estado" "EstadoClase" NOT NULL DEFAULT 'PROGRAMADA',
    "grabacion_url" TEXT,
    "grabacion_estado" "EstadoGrabacion" NOT NULL DEFAULT 'NO_DISPONIBLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_user_id_key" ON "teachers"("user_id");

-- CreateIndex
CREATE INDEX "availability_slots_teacher_id_inicio_utc_idx" ON "availability_slots"("teacher_id", "inicio_utc");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_slot_id_user_id_key" ON "bookings"("slot_id", "user_id");

-- CreateIndex
CREATE INDEX "hour_packages_user_id_idx" ON "hour_packages"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_hour_package_id_key" ON "payments"("hour_package_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_referencia_stripe_key" ON "payments"("referencia_stripe");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "classes_sessions_slot_id_key" ON "classes_sessions"("slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "classes_sessions_sala_jitsi_id_key" ON "classes_sessions"("sala_jitsi_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profesor_preferido_id_fkey" FOREIGN KEY ("profesor_preferido_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "availability_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hour_packages" ADD CONSTRAINT "hour_packages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_hour_package_id_fkey" FOREIGN KEY ("hour_package_id") REFERENCES "hour_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes_sessions" ADD CONSTRAINT "classes_sessions_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "availability_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
