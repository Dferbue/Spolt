/*
  Warnings:

  - A unique constraint covering the columns `[codigo_usuario]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "codigo_usuario" VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_codigo_usuario_key" ON "usuarios"("codigo_usuario");
