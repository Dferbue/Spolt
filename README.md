# 🏅 Spolt — Red Social Deportiva

Spolt es una aplicación web de tipo red social orientada al deporte. Permite a los usuarios registrarse, crear y unirse a eventos deportivos, gestionar amistades y comunicarse a través de conversaciones.

## 📋 Tabla de Contenidos

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
- [Scripts Disponibles](#-scripts-disponibles)

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

```
Spolt/
├── spolt-backend/          # API REST (NestJS + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma   # Esquema de la base de datos
│   │   └── migrations/     # Migraciones de la BD
│   ├── src/
│   │   ├── main.ts         # Punto de entrada del servidor
│   │   ├── modules/
│   │   │   ├── auth/       # Autenticación (login, register, JWT)
│   │   │   ├── users/      # Gestión de usuarios y perfiles
│   │   │   ├── events/     # Eventos deportivos
│   │   │   ├── frindships/ # Sistema de amistades
│   │   │   ├── conversations/ # Conversaciones
│   │   │   ├── messages/   # Mensajes
│   │   │   └── sports/     # Deportes
│   │   └── prisma/         # Servicio Prisma (inyectable)
│   ├── docker-compose.yml  # PostgreSQL, MinIO, Redis
│   ├── .env                # Variables de entorno
│   └── package.json
│
├── spolt-frontend/         # SPA (Angular 21)
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/       # Login, Register, Guards, Interceptors
│   │   │   ├── layout/     # Header, Sidebar
│   │   │   └── pages/      # Inicio, Eventos, Amigos, Perfil, Welcome
│   │   └── environments/   # Configuración por entorno
│   ├── proxy.conf.json     # Proxy para redirigir /api al backend
│   └── package.json
│
└── README.md               # Este archivo
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

El backend utiliza un archivo `.env` en la carpeta `spolt-backend/`. A continuación se describen todas las variables:

```env
# ─── Base de datos ───────────────────────────────
DB_USER=postgres                    # Usuario de PostgreSQL
DB_PASSWORD=postgres                # Contraseña de PostgreSQL
DATABASE_URL=postgres://postgres:postgres@localhost:5432/property_db?schema=public

# ─── MinIO (almacenamiento de archivos) ──────────
MINIO_ENDPOINT=localhost
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET_NAME=contracts
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# ─── Redis ───────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379

# ─── Aplicación ──────────────────────────────────
PORT=3001                           # Puerto del servidor
NODE_ENV=development
API_PREFIX=api/v1/                  # Prefijo global de la API

# ─── Autenticación (JWT) ─────────────────────────
BCRYPT_SALT=10                      # Salt rounds para bcrypt
JWT_SECRET="my_super_secret_key"    # Clave secreta del access token
JWT_EXPIRATION=3600s                # Duración del access token (1 hora)
JWT_REFRESH_SECRET="my_super_secret_refresh_key"  # Clave del refresh token
JWT_REFRESH_EXPIRATION=7d           # Duración del refresh token (7 días)
```

> ⚠️ **Importante:** En un entorno de producción, las claves `JWT_SECRET` y `JWT_REFRESH_SECRET` deben cambiarse por valores seguros y largos.

---

## 🗄 Base de Datos

### Esquema

La base de datos PostgreSQL contiene las siguientes tablas:

| Tabla                        | Descripción                                      |
|------------------------------|--------------------------------------------------|
| `usuarios`                   | Usuarios registrados en la plataforma            |
| `amistades`                  | Relaciones de amistad entre usuarios             |
| `deportes`                   | Catálogo de deportes disponibles                 |
| `eventos_deportivos`         | Eventos deportivos creados por los usuarios      |
| `participantes_evento`       | Relación usuarios ↔ eventos (inscripciones)      |
| `conversaciones`             | Conversaciones individuales o de grupo           |
| `participantes_conversacion` | Usuarios que participan en cada conversación     |
| `mensajes`                   | Mensajes enviados en las conversaciones          |

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
| POST   | `/auth/login`     | Iniciar sesión (devuelve tokens)| ❌   |
| POST   | `/auth/logout`    | Cerrar sesión                   | 🔒   |
| POST   | `/auth/refresh`   | Refrescar el access token       | 🔒   |
| GET    | `/auth/profile`   | Obtener perfil del usuario autenticado | 🔒 |

### Users (`/users`)

| Método | Ruta             | Descripción                              | Auth |
|--------|------------------|------------------------------------------|------|
| POST   | `/users`         | Crear un usuario                         | ❌   |
| GET    | `/users`         | Listar todos los usuarios                | ❌   |
| GET    | `/users/perfil`  | Obtener datos del perfil (campos seleccionados) | 🔒 |
| GET    | `/users/:id`     | Obtener un usuario por ID                | 🔒   |
| PATCH  | `/users/:id`     | Actualizar datos del usuario             | 🔒   |
| DELETE | `/users/:id`     | Eliminar un usuario                      | ❌   |

### Events (`/events`)

| Método | Ruta                       | Descripción                          | Auth |
|--------|----------------------------|--------------------------------------|------|
| POST   | `/events`                  | Crear un evento deportivo            | 🔒   |
| GET    | `/events`                  | Listar todos los eventos             | ❌   |
| GET    | `/events/friends`          | Eventos de tus amigos                | 🔒   |
| GET    | `/events/my-events`        | Tus propios eventos creados          | 🔒   |
| GET    | `/events/participante`     | Eventos en los que participas        | 🔒   |
| POST   | `/events/:id/join`         | Unirse a un evento                   | 🔒   |
| DELETE | `/events/:id/leave`        | Salir de un evento                   | 🔒   |
| PATCH  | `/events/:id`              | Actualizar un evento                 | ❌   |
| DELETE | `/events/:id`              | Eliminar un evento                   | ❌   |

### Friendships (`/frindships`)

| Método | Ruta                        | Descripción                          | Auth |
|--------|-----------------------------|--------------------------------------|------|
| POST   | `/frindships/:id`           | Enviar solicitud de amistad          | 🔒   |
| PATCH  | `/frindships/accept/:id`    | Aceptar solicitud de amistad         | 🔒   |
| GET    | `/frindships`               | Listar todas tus amistades           | 🔒   |
| GET    | `/frindships/recived`       | Ver solicitudes recibidas            | 🔒   |
| GET    | `/frindships/send`          | Ver solicitudes enviadas             | 🔒   |
| DELETE | `/frindships/:id`           | Eliminar una amistad                 | 🔒   |

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

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd Spolt

# 2. Levantar los contenedores Docker
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

---

## 👥 Autores

-David Fernandez Bueno

---
