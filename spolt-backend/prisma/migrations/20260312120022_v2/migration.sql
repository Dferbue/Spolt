/*
  Warnings:

  - You are about to drop the `imagenes_publicacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `publicaciones` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "imagenes_publicacion" DROP CONSTRAINT "imagenes_publicacion_id_publicacion_fkey";

-- DropForeignKey
ALTER TABLE "publicaciones" DROP CONSTRAINT "publicaciones_id_usuario_fkey";

-- DropTable
DROP TABLE "imagenes_publicacion";

-- DropTable
DROP TABLE "publicaciones";
