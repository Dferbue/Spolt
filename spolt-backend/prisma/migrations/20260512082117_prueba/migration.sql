/*
  Warnings:

  - You are about to drop the `conversaciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mensajes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `participantes_conversacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "TipoEvento" ADD VALUE 'playday';

-- DropForeignKey
ALTER TABLE "mensajes" DROP CONSTRAINT "mensajes_id_conversacion_fkey";

-- DropForeignKey
ALTER TABLE "mensajes" DROP CONSTRAINT "mensajes_id_usuario_emisor_fkey";

-- DropForeignKey
ALTER TABLE "participantes_conversacion" DROP CONSTRAINT "participantes_conversacion_id_conversacion_fkey";

-- DropForeignKey
ALTER TABLE "participantes_conversacion" DROP CONSTRAINT "participantes_conversacion_id_usuario_fkey";

-- AlterTable
ALTER TABLE "deportes" ADD COLUMN     "color" VARCHAR(7);

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "email_token" VARCHAR(255),
ADD COLUMN     "email_verificado" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "conversaciones";

-- DropTable
DROP TABLE "mensajes";

-- DropTable
DROP TABLE "participantes_conversacion";

-- DropEnum
DROP TYPE "TipoConversacion";

-- DropEnum
DROP TYPE "TipoMensaje";

-- CreateTable
CREATE TABLE "niveles_deportivos" (
    "id_nivel_deportivo" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_deporte" INTEGER NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "experiencia_actual" INTEGER NOT NULL DEFAULT 0,
    "experiencia_total" INTEGER NOT NULL DEFAULT 0,
    "partidos_jugados" INTEGER NOT NULL DEFAULT 0,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "niveles_deportivos_pkey" PRIMARY KEY ("id_nivel_deportivo")
);

-- CreateIndex
CREATE INDEX "niveles_deportivos_id_usuario_idx" ON "niveles_deportivos"("id_usuario");

-- CreateIndex
CREATE INDEX "niveles_deportivos_id_deporte_idx" ON "niveles_deportivos"("id_deporte");

-- CreateIndex
CREATE UNIQUE INDEX "niveles_deportivos_id_usuario_id_deporte_key" ON "niveles_deportivos"("id_usuario", "id_deporte");

-- AddForeignKey
ALTER TABLE "niveles_deportivos" ADD CONSTRAINT "niveles_deportivos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "niveles_deportivos" ADD CONSTRAINT "niveles_deportivos_id_deporte_fkey" FOREIGN KEY ("id_deporte") REFERENCES "deportes"("id_deporte") ON DELETE CASCADE ON UPDATE CASCADE;
