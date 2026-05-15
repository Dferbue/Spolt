-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "aceptado_terminos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fecha_aceptacion_terminos" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
