/*
  Warnings:

  - A unique constraint covering the columns `[codigo_evento]` on the table `eventos_deportivos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "eventos_deportivos" ADD COLUMN     "codigo_evento" VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "eventos_deportivos_codigo_evento_key" ON "eventos_deportivos"("codigo_evento");
