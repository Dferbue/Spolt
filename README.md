# 🏅 Spolt — Red Social Deportiva

Spolt es una aplicación web de tipo red social orientada al deporte. Permite a los usuarios registrarse, crear y unirse a eventos deportivos, gestionar amistades y comunicarse a través de conversaciones. Además, la plataforma cuenta con un panel de administración, integración de datos meteorológicos para los eventos y un sistema de firma de contratos para organizadores.

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
  - [1. Clonar el repositorio](#1-clonar-el-repositorio)
  - [2. Levantar los servicios con Docker](#2-levantar-los-servicios-con-docker-postgresql-minio-redis)
  - [3. Configurar el Backend](#3-configurar-el-backend)
  - [4. Configurar el Frontend](#4-configurar-el-frontend)
- [Variables de Entorno](#-variables-de-entorno)
- [Base de Datos](#-base-de-datos)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Despliegue en Producción](#-despliegue-en-producción)
- [Scripts Disponibles](#-scripts-disponibles)

---

## 🌟 Características Principales

- **Gestión de Eventos Deportivos**: Crea, únete y gestiona eventos con información meteorológica integrada.
- **Red Social y Comunicación**: Sistema de amistades, perfiles de usuario y mensajería en tiempo real.
- **Panel de Administración**: Herramientas avanzadas para la moderación de la plataforma (jerarquía de roles Admin/CEO).
- **Firma de Contratos**: Flujo de firma digital interactivo para organizadores y propietarios, respaldado por MinIO.
- **Diseño Neo-Brutalista**: Interfaz responsiva, moderna y con gran contraste visual.
- **Arquitectura Robusta y Escalable**: Backend en NestJS, almacenamiento S3 y despliegue orquestado con Nginx y Docker.

---

## 🛠 Tecnologías

| Capa       | Tecnología                          | Versión   |
|------------|-------------------------------------|-----------|
| **Frontend** | Angular                           | 21.x      |
| **Backend**  | NestJS                            | 11.x      |
| **ORM**      | Prisma                            | 6.x       |
| **Base de datos** | PostgreSQL                   | 18 Alpine |
| **Almacenamiento** | MinIO (S3 compatible)       | latest    |
| **Cache/Colas** | Redis                          | 7.2.4     |
| **Autenticación** | JWT (access + refresh tokens) | —       |
| **Despliegue/Proxy** | Docker, Nginx             | latest    |
| **Lenguaje** | TypeScript                        | 5.x       |

---

## 📦 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

| Software   | Versión mínima | Enlace de descarga |
|------------|----------------|--------------------|
| **Node.js**    | v18+           | [https://nodejs.org/](https://nodejs.org/) |
| **npm**        | v9+            | (Viene con Node.js) |
| **Docker**     | v20+           | [https://www.docker.com/get-started](https://www.docker.com/get-started) |
| **Docker Compose** | v2+        | (Viene con Docker Desktop) |
| **Git**        | v2+            | [https://git-scm.com/](https://git-scm.com/) |

> **Nota para Windows:** Se recomienda usar **WSL 2** (Windows Subsystem for Linux) para ejecutar el proyecto. Docker Desktop debe estar configurado para usar WSL 2 como backend.

---

## 📁 Estructura del Proyecto

```text
Spolt/
├── spolt-backend/          # API REST (NestJS + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma   # Esquema de la base de datos
│   │   └── migrations/     # Migraciones de la BD
│   ├── src/
│   │   ├── main.ts         # Punto de entrada del servidor
│   │   ├── modules/
│   │   │   ├── admin/      # Rutas y métricas de administración
│   │   │   ├── auth/       # Autenticación (login, JWT, recuperación)
│   │   │   ├── email/      # Servicio de envío de correos
│   │   │   ├── events/     # Gestión de eventos deportivos
│   │   │   ├── frindships/ # Sistema de amistades
│   │   │   ├── sport-level/# Nivel, XP y gamificación
│   │   │   ├── sports/     # Catálogo de deportes
│   │   │   ├── storage/    # Integración con MinIO (contratos)
│   │   │   ├── users/      # Gestión de usuarios y perfiles
│   │   │   └── weather/    # Pronósticos de clima
│   │   └── prisma/         # Servicio Prisma
│   ├── docker-compose.yml  # Infra de dev (PostgreSQL, MinIO, Redis)
│   └── package.json
│
├── spolt-frontend/         # SPA (Angular)
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/       # Login, registro, Guards, interceptores
│   │   │   ├── layout/     # Componentes base (Header, Sidebar)
│   │   │   └── pages/      # admin, amigos, eventos, inicio, legal, perfil, welcome
│   │   └── environments/   # Variables por entorno (dev, prod)
│   ├── proxy.conf.json     # Proxy de desarrollo hacia backend
│   └── package.json
│
├── docker-compose.yml      # Orquestación global en Producción (Nginx, BD, etc)
├── nginx.conf              # Configuración de proxy inverso
└── README.md               # Documentación
```

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Spolt
```

### 2. Levantar los servicios con Docker (PostgreSQL, MinIO, Redis)

Los servicios de infraestructura (base de datos, almacenamiento de archivos y cache) se gestionan con Docker Compose.

```bash
cd spolt-backend
docker compose up -d
```

Esto levantará:

| Servicio       | Puerto | Descripción                     |
|----------------|--------|---------------------------------|
| **PostgreSQL** | `5432` | Base de datos principal         |
| **MinIO API**  | `9000` | Almacenamiento de archivos (S3) |
| **MinIO Console** | `9001` | Consola web de MinIO         |
| **Redis**      | `6379` | Cache y sistema de colas        |

Para verificar que los contenedores están corriendo:

```bash
docker ps
```

Deberías ver los contenedores `spolt-postgres`, `spolt-minio` y `spolt-redis` con estado `Up`.

### 3. Configurar el Backend

#### 3.1 Instalar dependencias

```bash
cd spolt-backend
npm install
```

#### 3.2 Configurar variables de entorno

El archivo `.env` ya viene incluido en el repositorio con la configuración por defecto para desarrollo. Si necesitas modificarlo, consulta la sección [Variables de Entorno](#-variables-de-entorno).

#### 3.3 Generar el cliente Prisma y ejecutar migraciones

```bash
# Genera el cliente de Prisma (necesario antes de ejecutar la app)
npx prisma generate

# Ejecuta las migraciones para crear las tablas en la BD
npx prisma migrate deploy
```

> **Nota:** Si es la primera vez y quieres aplicar las migraciones en un entorno de desarrollo, también puedes usar:
> ```bash
> npx prisma migrate dev
> ```

#### 3.4 (Opcional) Visualizar la base de datos con Prisma Studio

```bash
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:5555` donde puedes ver y editar los datos de la BD.

#### 3.5 Iniciar el servidor backend

```bash
npm run start:dev
```

El servidor arrancará en: **http://localhost:3001/api/v1**

### 4. Configurar el Frontend

#### 4.1 Instalar dependencias

Abre una **nueva terminal** y ejecuta:

```bash
cd spolt-frontend
npm install
```

#### 4.2 Iniciar el servidor de desarrollo Angular

```bash
npm start
```

La aplicación se abrirá en: **http://localhost:4200**

> El frontend usa un **proxy** (`proxy.conf.json`) que redirige automáticamente todas las peticiones a `/api/v1/*` hacia `http://localhost:3001`, por lo que no hay problemas de CORS en desarrollo.

---

## 🔐 Variables de Entorno

El backend requiere un archivo `.env` en la carpeta `spolt-backend/` para configurar los servicios y accesos. Debes configurar las siguientes secciones clave en tu entorno:

- **Base de datos**: Credenciales y URL de conexión para PostgreSQL (`DB_USER`, `DB_PASSWORD`, `DATABASE_URL`).
- **MinIO**: Credenciales y bucket para el almacenamiento de archivos y contratos (`MINIO_ENDPOINT`, `MINIO_ROOT_USER`, etc.).
- **Redis**: Host y puerto para el sistema de cache y colas (`REDIS_HOST`, `REDIS_PORT`).
- **Aplicación**: Puerto, entorno y prefijo de API (`PORT`, `NODE_ENV`, `API_PREFIX`).
- **Autenticación (JWT)**: Secretos para los tokens de acceso y refresco (`JWT_SECRET`, `JWT_REFRESH_SECRET`).

> ⚠️ **Importante:** Por razones de seguridad, nunca compartas tus claves secretas o contraseñas en repositorios públicos. Asegúrate de utilizar credenciales fuertes y seguras, especialmente en entornos de producción.

---

## 🗄 Base de Datos

### Esquema

La base de datos PostgreSQL contiene las siguientes tablas:

| Tabla                        | Descripción                                      |
|------------------------------|--------------------------------------------------|
| `usuarios`                   | Registros de usuarios, control de roles (Admin/CEO), firmas legales y tokens. |
| `amistades`                  | Relaciones de amistad entre usuarios y estados (pendiente, aceptada, bloqueada). |
| `deportes`                   | Catálogo de deportes disponibles en la plataforma. |
| `niveles_deportivos`         | Progresión de nivel, experiencia y partidos jugados de cada usuario por deporte. |
| `eventos_deportivos`         | Eventos (partidos, torneos) con ubicación geográfica y estado (abierto, finalizado). |
| `participantes_evento`       | Relación de los usuarios inscritos en cada evento deportivo. |

### Exportar la base de datos

Para exportar los datos de la base de datos (por ejemplo, para compartirla con otro miembro del equipo):

```bash
# Exportar un dump completo de la BD
docker exec spolt-postgres pg_dump -U postgres property_db > spolt_dump.sql
```

### Importar la base de datos

Si recibes un archivo `.sql` con un dump de la BD:

```bash
# 1. Asegúrate de que los contenedores Docker están corriendo
docker compose up -d

# 2. Importa el dump en PostgreSQL
docker exec -i spolt-postgres psql -U postgres -d property_db < spolt_dump.sql
```

> Si la base de datos no existe aún, créala primero:
> ```bash
> docker exec spolt-postgres psql -U postgres -c "CREATE DATABASE property_db;"
> ```

### Alternativa: Crear la BD desde las migraciones (sin dump)

Si no tienes un dump `.sql`, las migraciones de Prisma crearán todas las tablas automáticamente:

```bash
cd spolt-backend
npx prisma migrate deploy
```

---

## 📡 Endpoints de la API

Base URL: `http://localhost:3001/api/v1`

Los endpoints marcados con 🔒 requieren autenticación (enviar el header `Authorization: Bearer <token>`).

### Auth (`/auth`)

| Método | Ruta              | Descripción                     | Auth |
|--------|-------------------|---------------------------------|------|
| POST   | `/auth/register`  | Registrar un nuevo usuario      | ❌   |
| POST   | `/auth/confirm-register` | Confirmar registro via token | ❌ |
| POST   | `/auth/login`     | Iniciar sesión (devuelve tokens)| ❌   |
| POST   | `/auth/logout`    | Cerrar sesión                   | 🔒   |
| POST   | `/auth/refresh`   | Refrescar el access token       | 🔒   |
| GET    | `/auth/profile`   | Obtener perfil autenticado      | 🔒   |
| POST   | `/auth/forgot-password` | Solicitar reseteo de contraseña | ❌ |
| POST   | `/auth/reset-password` | Confirmar nueva contraseña | ❌   |
| POST   | `/auth/request-email-change`| Solicitar cambio de email | 🔒 |
| POST   | `/auth/confirm-email-change`| Confirmar cambio de email | ❌ |

### Users (`/users`)

| Método | Ruta             | Descripción                              | Auth |
|--------|------------------|------------------------------------------|------|
| POST   | `/users`         | Crear un usuario                         | ❌   |
| GET    | `/users`         | Listar todos los usuarios                | ❌   |
| GET    | `/users/perfil`  | Obtener datos del perfil propio          | 🔒   |
| GET    | `/users/:id`     | Obtener un usuario por ID                | 🔒   |
| PATCH  | `/users/ping`    | Actualizar última conexión               | 🔒   |
| PATCH  | `/users/update`  | Actualizar datos propios (perfil)        | 🔒   |
| PATCH  | `/users/:id`     | Actualizar usuario por ID                | 🔒   |
| DELETE | `/users/:id`     | Eliminar un usuario                      | 🔒   |

### Events (`/events`)

| Método | Ruta                       | Descripción                          | Auth |
|--------|----------------------------|--------------------------------------|------|
| POST   | `/events`                  | Crear un evento deportivo            | 🔒   |
| GET    | `/events`                  | Listar todos los eventos             | ❌   |
| GET    | `/events/count-active`     | Contar eventos activos               | ❌   |
| GET    | `/events/friends`          | Eventos de tus amigos                | 🔒   |
| GET    | `/events/my-events`        | Tus propios eventos creados          | 🔒   |
| GET    | `/events/participante`     | Eventos en los que participas        | 🔒   |
| POST   | `/events/:id/join`         | Unirse a un evento                   | 🔒   |
| DELETE | `/events/:id/leave`        | Salir de un evento                   | 🔒   |
| PATCH  | `/events/:id`              | Actualizar un evento                 | 🔒   |
| PATCH  | `/events/:id/finalizar`    | Marcar un evento como finalizado     | 🔒   |
| DELETE | `/events/:id`              | Eliminar un evento                   | 🔒   |

### Friendships (`/frindships`)

| Método | Ruta                        | Descripción                          | Auth |
|--------|-----------------------------|--------------------------------------|------|
| POST   | `/frindships/:username`     | Enviar solicitud de amistad          | 🔒   |
| PATCH  | `/frindships/accept/:id`    | Aceptar solicitud de amistad         | 🔒   |
| GET    | `/frindships`               | Listar todas tus amistades           | 🔒   |
| GET    | `/frindships/recived`       | Ver solicitudes recibidas            | 🔒   |
| GET    | `/frindships/send`          | Ver solicitudes enviadas             | 🔒   |
| GET    | `/frindships/admin/:id`     | Ver amistades de un usuario (Admin)  | 🔒   |
| DELETE | `/frindships/:id`           | Eliminar una amistad                 | 🔒   |

### Sports (`/sports`)

| Método | Ruta              | Descripción                     | Auth |
|--------|-------------------|---------------------------------|------|
| GET    | `/sports`         | Obtener todos los deportes      | ❌   |
| POST   | `/sports`         | Crear un deporte nuevo          | 🔒   |
| PATCH  | `/sports/:id`     | Actualizar deporte              | 🔒   |
| DELETE | `/sports/:id`     | Eliminar deporte                | 🔒   |

### Sport Levels (`/sport-level`)

| Método | Ruta              | Descripción                     | Auth |
|--------|-------------------|---------------------------------|------|
| GET    | `/sport-level/me` | Obtener progreso en deportes    | 🔒   |

### Weather (`/weather`)

| Método | Ruta              | Descripción                     | Auth |
|--------|-------------------|---------------------------------|------|
| GET    | `/weather/forecast`| Obtener pronóstico de clima    | 🔒   |

### Storage (`/storage`)

| Método | Ruta              | Descripción                     | Auth |
|--------|-------------------|---------------------------------|------|
| GET    | `/storage/:objectName`| Obtener archivo de MinIO    | 🔒   |
| POST   | `/storage/upload` | Subir archivo a MinIO           | 🔒   |

### Admin (`/admin`)

| Método | Ruta              | Descripción                     | Auth |
|--------|-------------------|---------------------------------|------|
| GET    | `/admin/stats`    | Estadísticas globales           | 🔒   |

---

## 🌍 Despliegue en Producción

El proyecto está preparado para desplegarse en producción mediante una orquestación multi-contenedor (Multi-stage Docker).
Se utiliza **Nginx** como servidor web y proxy inverso para servir los estáticos del frontend de Angular y redirigir las peticiones de la API de manera segura hacia el backend de NestJS. 

Toda la infraestructura en producción (PostgreSQL, MinIO, Redis, Backend y Nginx) debe estar debidamente configurada para garantizar la correcta interconectividad entre contenedores y la persistencia de datos (por ejemplo, firmas de contratos de propietarios almacenadas en MinIO).

---

## 📜 Scripts Disponibles

### Backend (`spolt-backend/`)

```bash
npm run start:dev     # Inicia el servidor en modo desarrollo (con hot reload)
npm run start         # Inicia el servidor en modo producción
npm run build         # Compila el proyecto
npm run lint          # Ejecuta el linter (ESLint)
npm run test          # Ejecuta los tests unitarios
npm run test:e2e      # Ejecuta los tests end-to-end
```

### Frontend (`spolt-frontend/`)

```bash
npm start             # Inicia el servidor de desarrollo Angular (port 4200)
npm run build         # Compila para producción
npm run test          # Ejecuta los tests unitarios
npm run watch         # Compila en modo watch
```

### Prisma (desde `spolt-backend/`)

```bash
npx prisma generate       # Genera el cliente Prisma
npx prisma migrate dev    # Crea y aplica migraciones (desarrollo)
npx prisma migrate deploy # Aplica migraciones (producción)
npx prisma studio         # Abre el editor visual de la BD
npx prisma db push        # Sincroniza el esquema sin crear migración
```

---

## 🔄 Resumen Rápido de Arranque

### 💻 Modo Desarrollo (Local)

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd Spolt

# 2. Levantar los contenedores Docker locales (BD, Redis, MinIO)
cd spolt-backend
docker compose up -d

# 3. Instalar dependencias e inicializar la BD
npm install
npx prisma generate
npx prisma migrate deploy

# 4. Arrancar el backend
npm run start:dev

# 5. En otra terminal, arrancar el frontend
cd spolt-frontend
npm install
npm start

# 6. Abrir el navegador en http://localhost:4200
```

### 🌍 Modo Producción (con Nginx)

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd Spolt

# 2. Levantar toda la infraestructura y compilar la aplicación 
# (Frontend, Backend, Nginx, PostgreSQL, MinIO, Redis)
docker compose up -d --build

# 3. Abrir el navegador (la aplicación estará expuesta por Nginx)
# http://localhost (o el dominio configurado)
```

---

## 👥 Autores

-David Fernandez Bueno

---
