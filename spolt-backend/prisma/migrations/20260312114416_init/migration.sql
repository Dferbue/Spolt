-- CreateEnum
CREATE TYPE "EstadoAmistad" AS ENUM ('pendiente', 'aceptada', 'rechazada', 'bloqueada');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('partido', 'torneo');

-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('abierto', 'cerrado', 'cancelado', 'finalizado');

-- CreateEnum
CREATE TYPE "EstadoParticipacion" AS ENUM ('pendiente', 'confirmado', 'rechazado', 'retirado');

-- CreateEnum
CREATE TYPE "TipoConversacion" AS ENUM ('individual', 'grupo');

-- CreateEnum
CREATE TYPE "TipoMensaje" AS ENUM ('texto', 'imagen', 'archivo', 'ubicacion');

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre_usuario" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "contrasena_hash" VARCHAR(255) NOT NULL,
    "nombre_completo" VARCHAR(100),
    "biografia" TEXT,
    "imagen_perfil" VARCHAR(255),
    "fecha_nacimiento" DATE,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_acceso" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "publicaciones" (
    "id_publicacion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "descripcion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numero_likes" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id_publicacion")
);

-- CreateTable
CREATE TABLE "imagenes_publicacion" (
    "id_imagen" SERIAL NOT NULL,
    "id_publicacion" INTEGER NOT NULL,
    "url_imagen" VARCHAR(255) NOT NULL,
    "orden" SMALLINT,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagenes_publicacion_pkey" PRIMARY KEY ("id_imagen")
);

-- CreateTable
CREATE TABLE "amistades" (
    "id_amistad" SERIAL NOT NULL,
    "id_usuario_solicitante" INTEGER NOT NULL,
    "id_usuario_receptor" INTEGER NOT NULL,
    "estado" "EstadoAmistad" NOT NULL DEFAULT 'pendiente',
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_respuesta" TIMESTAMP(3),

    CONSTRAINT "amistades_pkey" PRIMARY KEY ("id_amistad")
);

-- CreateTable
CREATE TABLE "deportes" (
    "id_deporte" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "imagen_icono" VARCHAR(255),

    CONSTRAINT "deportes_pkey" PRIMARY KEY ("id_deporte")
);

-- CreateTable
CREATE TABLE "eventos_deportivos" (
    "id_evento" SERIAL NOT NULL,
    "id_creador" INTEGER NOT NULL,
    "id_deporte" INTEGER NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "tipo_evento" "TipoEvento" NOT NULL,
    "fecha_evento" DATE NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME,
    "ubicacion" VARCHAR(255),
    "latitud" DECIMAL(10,8),
    "longitud" DECIMAL(11,8),
    "numero_max_participantes" INTEGER NOT NULL,
    "numero_participantes_actuales" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoEvento" NOT NULL DEFAULT 'abierto',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_deportivos_pkey" PRIMARY KEY ("id_evento")
);

-- CreateTable
CREATE TABLE "participantes_evento" (
    "id_participacion" SERIAL NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "estado" "EstadoParticipacion" NOT NULL DEFAULT 'pendiente',
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_respuesta" TIMESTAMP(3),

    CONSTRAINT "participantes_evento_pkey" PRIMARY KEY ("id_participacion")
);

-- CreateTable
CREATE TABLE "conversaciones" (
    "id_conversacion" SERIAL NOT NULL,
    "tipo" "TipoConversacion" NOT NULL DEFAULT 'individual',
    "nombre_grupo" VARCHAR(100),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actividad" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversaciones_pkey" PRIMARY KEY ("id_conversacion")
);

-- CreateTable
CREATE TABLE "participantes_conversacion" (
    "id_participante" SERIAL NOT NULL,
    "id_conversacion" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "fecha_union" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_mensaje_leido" INTEGER,
    "notificaciones_activas" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "participantes_conversacion_pkey" PRIMARY KEY ("id_participante")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id_mensaje" SERIAL NOT NULL,
    "id_conversacion" INTEGER NOT NULL,
    "id_usuario_emisor" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo_mensaje" "TipoMensaje" NOT NULL DEFAULT 'texto',
    "url_archivo" VARCHAR(255),
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_edicion" TIMESTAMP(3),

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id_mensaje")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nombre_usuario_key" ON "usuarios"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_nombre_usuario_idx" ON "usuarios"("nombre_usuario");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "publicaciones_id_usuario_fecha_creacion_idx" ON "publicaciones"("id_usuario", "fecha_creacion");

-- CreateIndex
CREATE INDEX "imagenes_publicacion_id_publicacion_idx" ON "imagenes_publicacion"("id_publicacion");

-- CreateIndex
CREATE INDEX "amistades_id_usuario_solicitante_idx" ON "amistades"("id_usuario_solicitante");

-- CreateIndex
CREATE INDEX "amistades_id_usuario_receptor_idx" ON "amistades"("id_usuario_receptor");

-- CreateIndex
CREATE INDEX "amistades_estado_idx" ON "amistades"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "amistades_id_usuario_solicitante_id_usuario_receptor_key" ON "amistades"("id_usuario_solicitante", "id_usuario_receptor");

-- CreateIndex
CREATE UNIQUE INDEX "deportes_nombre_key" ON "deportes"("nombre");

-- CreateIndex
CREATE INDEX "deportes_nombre_idx" ON "deportes"("nombre");

-- CreateIndex
CREATE INDEX "eventos_deportivos_fecha_evento_idx" ON "eventos_deportivos"("fecha_evento");

-- CreateIndex
CREATE INDEX "eventos_deportivos_id_creador_idx" ON "eventos_deportivos"("id_creador");

-- CreateIndex
CREATE INDEX "eventos_deportivos_id_deporte_idx" ON "eventos_deportivos"("id_deporte");

-- CreateIndex
CREATE INDEX "eventos_deportivos_estado_idx" ON "eventos_deportivos"("estado");

-- CreateIndex
CREATE INDEX "participantes_evento_id_evento_idx" ON "participantes_evento"("id_evento");

-- CreateIndex
CREATE INDEX "participantes_evento_id_usuario_idx" ON "participantes_evento"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "participantes_evento_id_evento_id_usuario_key" ON "participantes_evento"("id_evento", "id_usuario");

-- CreateIndex
CREATE INDEX "conversaciones_ultima_actividad_idx" ON "conversaciones"("ultima_actividad");

-- CreateIndex
CREATE INDEX "participantes_conversacion_id_conversacion_idx" ON "participantes_conversacion"("id_conversacion");

-- CreateIndex
CREATE INDEX "participantes_conversacion_id_usuario_idx" ON "participantes_conversacion"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "participantes_conversacion_id_conversacion_id_usuario_key" ON "participantes_conversacion"("id_conversacion", "id_usuario");

-- CreateIndex
CREATE INDEX "mensajes_id_conversacion_fecha_envio_idx" ON "mensajes"("id_conversacion", "fecha_envio");

-- CreateIndex
CREATE INDEX "mensajes_id_usuario_emisor_idx" ON "mensajes"("id_usuario_emisor");

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes_publicacion" ADD CONSTRAINT "imagenes_publicacion_id_publicacion_fkey" FOREIGN KEY ("id_publicacion") REFERENCES "publicaciones"("id_publicacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amistades" ADD CONSTRAINT "amistades_id_usuario_solicitante_fkey" FOREIGN KEY ("id_usuario_solicitante") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amistades" ADD CONSTRAINT "amistades_id_usuario_receptor_fkey" FOREIGN KEY ("id_usuario_receptor") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_deportivos" ADD CONSTRAINT "eventos_deportivos_id_creador_fkey" FOREIGN KEY ("id_creador") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_deportivos" ADD CONSTRAINT "eventos_deportivos_id_deporte_fkey" FOREIGN KEY ("id_deporte") REFERENCES "deportes"("id_deporte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_evento" ADD CONSTRAINT "participantes_evento_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "eventos_deportivos"("id_evento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_evento" ADD CONSTRAINT "participantes_evento_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_conversacion" ADD CONSTRAINT "participantes_conversacion_id_conversacion_fkey" FOREIGN KEY ("id_conversacion") REFERENCES "conversaciones"("id_conversacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_conversacion" ADD CONSTRAINT "participantes_conversacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_id_conversacion_fkey" FOREIGN KEY ("id_conversacion") REFERENCES "conversaciones"("id_conversacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_id_usuario_emisor_fkey" FOREIGN KEY ("id_usuario_emisor") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
