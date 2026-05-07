# Plan de Implementacion Redis Avanzado

Este documento define una implementacion por fases para usar Redis en funcionalidades criticas del backend de Spolt: rate limiting de autenticacion, cola de emails, locks distribuidos para eventos y blacklist de access tokens y refresh tokens.

El objetivo es anadir capacidades nuevas sin mezclar responsabilidades con la cache actual. `AppCacheService` debe seguir siendo el servicio de cache de aplicacion; el nuevo cliente Redis directo se usara para operaciones atomicas, contadores, locks, colas y revocacion de tokens.

## Fase 0: Preparacion

**Objetivo:** dejar listas dependencias, configuracion y criterios de separacion antes de escribir logica de negocio.

**Archivos a tocar:**

- `package.json`
- `.env` y `.env.example` si existe
- `src/app.module.ts`
- Documentacion interna del backend si se anade una seccion de variables

**Tareas:**

- Anadir dependencias:
  - `redis`
  - `@nestjs/throttler`
  - `@nestjs/bullmq`
  - `bullmq`
- Definir variables de entorno:
  - `REDIS_URL`
  - `AUTH_RATE_LIMIT_TTL_SECONDS`
  - `AUTH_RATE_LIMIT_MAX_LOGIN`
  - `AUTH_RATE_LIMIT_MAX_REGISTER`
  - `AUTH_RATE_LIMIT_MAX_FORGOT_PASSWORD`
  - `AUTH_RATE_LIMIT_MAX_REFRESH`
  - `EVENT_LOCK_TTL_SECONDS`
  - `QUEUE_PREFIX`
- Confirmar que la cache existente sigue configurada mediante `src/cache/app-cache.module.ts` y `src/cache/app-cache.service.ts`.
- Definir una convencion de claves Redis, por ejemplo:
  - `rate:auth:<endpoint>:<ip-or-user>`
  - `lock:event:<id_evento>`
  - `token:blacklist:<jti>`
  - `queue:<QUEUE_PREFIX>:email`

**Comportamiento esperado:** el proyecto instala las nuevas dependencias y arranca con variables de entorno documentadas, sin cambiar aun el comportamiento de auth, eventos, emails ni cache.

**Prueba minima:** ejecutar `npm install` y `npm run build` en `spolt-backend/`.

## Fase 1: Cliente Redis Directo

**Objetivo:** crear un cliente Redis directo para operaciones atomicas y de infraestructura, separado de `AppCacheService`.

**Archivos a tocar:**

- `src/redis-core/redis-core.module.ts`
- `src/redis-core/redis-core.service.ts`
- `src/app.module.ts`

**Tareas:**

- Crear `RedisCoreModule` global o importable por modulos que lo necesiten.
- Crear `RedisCoreService` usando `redis` y `REDIS_URL`.
- Implementar ciclo de vida con conexion en `onModuleInit` y cierre en `onModuleDestroy`.
- Exponer metodos atomicos:
  - `get(key)`
  - `set(key, value, ttlSeconds?)`
  - `del(key)`
  - `incrWithTtl(key, ttlSeconds)`
  - `setNx(key, value, ttlSeconds)`
  - `releaseLock(key, value)`
- Implementar `releaseLock` con comparacion del valor del lock antes de borrar, preferiblemente con script Lua, para no liberar locks ajenos.
- Mantener `AppCacheService` como servicio unico de cache de aplicacion. No sustituirlo ni reutilizarlo para blacklist, rate limiting o locks.

**Comportamiento esperado:** cualquier modulo puede usar Redis para comandos directos sin depender de la cache. Si Redis no conecta, el fallo debe ser visible al arrancar porque Redis sera critico para auth rate limiting y blacklist.

**Prueba minima:** crear una prueba unitaria simple de `RedisCoreService` con mock del cliente o validar manualmente que el backend arranca y cierra la conexion sin errores.

## Fase 2: Rate Limiting de Auth

**Objetivo:** proteger endpoints sensibles de autenticacion con contadores distribuidos en Redis.

**Archivos a tocar:**

- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.module.ts`
- `src/modules/auth/guards/` o `src/modules/auth/rate-limit/`
- `src/redis-core/redis-core.service.ts`
- `src/app.module.ts` si se configura `ThrottlerModule`

**Endpoints a proteger:**

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/forgot-password`
- `POST /auth/refresh`

**Tareas:**

- Usar `@nestjs/throttler` o un guard propio apoyado en `RedisCoreService`.
- Crear claves por endpoint y por identificador estable:
  - IP para intentos anonimos.
  - Email normalizado cuando el body incluya email.
  - Usuario o refresh token fingerprint para `POST /auth/refresh`, evitando almacenar tokens completos.
- Usar `incrWithTtl` para incrementar y fijar TTL en la primera peticion de la ventana.
- Aplicar limites diferenciados por endpoint mediante variables `.env`.
- Devolver `429 Too Many Requests` con mensaje generico, sin revelar si un email existe o no.

**Comportamiento esperado:** varios procesos Nest comparten el mismo limite porque los contadores viven en Redis. Redis pasa a ser critico para estos endpoints; si no esta disponible, la decision debe ser fail-closed para auth sensible o estar documentada explicitamente si se elige otro comportamiento.

**Prueba minima:** levantar el backend y ejecutar peticiones repetidas contra cada endpoint hasta recibir `429`. Verificar que el contador se comparte aunque se reinicie el proceso Nest mientras Redis sigue activo.

## Fase 3: Cola de Emails

**Objetivo:** mover el envio de emails a BullMQ para que auth no dependa del tiempo de respuesta del proveedor SMTP.

**Archivos a tocar:**

- `src/modules/email/email.module.ts`
- `src/modules/email/email.service.ts`
- `src/modules/email/email-queue.service.ts`
- `src/modules/email/email.processor.ts`
- `src/app.module.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/users/users.service.ts` si el registro envia email desde users

**Tareas:**

- Configurar `BullModule` con `REDIS_URL` y `QUEUE_PREFIX`.
- Registrar la queue `email`.
- Crear `EmailQueueService` como productor de jobs.
- Crear `EmailProcessor` como consumidor.
- Encolar los emails de:
  - Registro o confirmacion de registro.
  - Bienvenida, si existe ese flujo.
  - Reset password.
  - Cambio de email.
- Mantener `EmailService` como capa que conoce Nodemailer/templates.
- Configurar reintentos y backoff exponencial, por ejemplo 3 intentos con backoff creciente.
- Definir payloads serializables y sin datos sensibles innecesarios.

**Comportamiento esperado:** los endpoints responden despues de persistir el estado necesario y encolar el job. El envio real ocurre en segundo plano; los errores de SMTP quedan registrados en el job y no rompen el request si el job ya fue aceptado.

**Prueba minima:** disparar registro, forgot password y cambio de email; comprobar que se crean jobs en la queue `email`, que el processor los consume y que los reintentos ocurren si se fuerza un fallo temporal en SMTP.

## Fase 4: Locks de Eventos

**Objetivo:** evitar condiciones de carrera en operaciones concurrentes sobre el mismo evento, manteniendo las transacciones Prisma existentes.

**Archivos a tocar:**

- `src/modules/events/events.service.ts`
- `src/modules/events/events.module.ts`
- `src/redis-core/redis-core.service.ts`

**Metodos a proteger:**

- `unirseEvento`
- `salirEvento`
- `finalizarEvento`

**Tareas:**

- Crear una clave de lock por evento: `lock:event:<id_evento>`.
- Generar un valor unico por intento de lock, por ejemplo UUID.
- Adquirir el lock con `setNx(key, value, EVENT_LOCK_TTL_SECONDS)`.
- Si no se consigue el lock, devolver `409 Conflict` o `429 Too Many Requests` con mensaje generico como `Operacion en curso para este evento`.
- Ejecutar la logica actual dentro del lock, conservando las transacciones Prisma.
- Liberar siempre el lock en `finally` con `releaseLock(key, value)`.
- Mantener las invalidaciones de cache (`cache.bumpVersion` o `invalidateEventCaches`) despues de cambios exitosos.

**Comportamiento esperado:** dos operaciones simultaneas sobre el mismo evento no pisan contadores ni estados. La base de datos sigue siendo la fuente de verdad y Prisma mantiene la consistencia transaccional; Redis solo serializa el acceso por evento.

**Prueba minima:** lanzar varias peticiones concurrentes de join/leave/finalize sobre el mismo `id_evento` y verificar que no hay contador negativo, exceso de cupo, doble participacion ni doble reparto de XP.

## Fase 5: Blacklist de Access y Refresh Tokens

**Objetivo:** revocar tokens de forma distribuida para que logout invalide tanto access tokens como refresh tokens antes de su expiracion natural.

**Archivos a tocar:**

- `src/modules/auth/auth.service.ts`
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.module.ts`
- `src/modules/auth/strategies/jwt.strategy.ts`
- `src/modules/auth/strategies/refresh-token.strategy.ts`
- `src/modules/auth/token-revocation.service.ts`
- DTOs o tipos de payload JWT si se centralizan

**Tareas:**

- Anadir `jti` unico a cada access token y refresh token generado en `getTokens`.
- Incluir en el payload los campos necesarios para validar revocacion:
  - `sub`
  - `email`
  - `role`
  - `jti`
  - `tokenType` (`access` o `refresh`)
- Crear `TokenRevocationService` con metodos:
  - `revokeToken(jti, expiresAt)`
  - `isRevoked(jti)`
  - `revokePair(accessJti, accessExp, refreshJti, refreshExp)`
- Guardar blacklist en Redis con TTL igual al tiempo restante del token.
- En `POST /auth/logout`, revocar el access token actual y el refresh token asociado. Si el refresh token esta en cookie, extraerlo y validar su `jti` antes de revocarlo.
- Mantener la limpieza de `refresh_token_hash` en base de datos para cortar la rotacion actual.
- Validar blacklist en `JwtStrategy` para access tokens.
- Validar blacklist en `RefreshTokenStrategy` antes de permitir `POST /auth/refresh`.
- Rechazar tokens sin `jti` despues de desplegar la migracion, o aceptar temporalmente tokens legacy solo durante una ventana controlada.

**Comportamiento esperado:** despues de logout, ningun proceso Nest acepta el access token ni el refresh token revocados. Redis es critico para esta decision; si no esta disponible, auth debe rechazar validaciones o usar una politica fail-closed claramente definida.

**Prueba minima:** iniciar sesion, llamar a un endpoint protegido, hacer logout y volver a intentar con el mismo access token y el mismo refresh token. Ambos deben fallar aunque no hayan expirado.

## Fase 6: Verificacion

**Objetivo:** validar que Redis avanzado funciona de forma integrada y que los fallos quedan acotados.

**Archivos a tocar:**

- Tests unitarios o e2e bajo `src/**/*.spec.ts` y `test/`
- Scripts o documentacion de pruebas manuales si se anaden

**Tareas:**

- Ejecutar:

```bash
npm run build
```

- Probar manualmente rate limiting contra:
  - `POST /auth/login`
  - `POST /auth/register`
  - `POST /auth/forgot-password`
  - `POST /auth/refresh`
- Probar jobs de email con envio correcto y fallo temporal.
- Probar concurrencia en `unirseEvento`, `salirEvento` y `finalizarEvento`.
- Probar logout real con access token y refresh token revocados.
- Verificar logs utiles para:
  - Redis no disponible.
  - Rate limit alcanzado.
  - Job de email fallido tras reintentos.
  - Lock no adquirido.
  - Token revocado rechazado.

**Comportamiento esperado:** el backend compila, las rutas sensibles quedan protegidas, los emails se procesan por queue, las operaciones concurrentes de eventos son consistentes y logout invalida access + refresh tokens.

**Prueba minima:** documentar los comandos ejecutados, resultados de peticiones manuales y cualquier caso pendiente antes de dar por terminada la implementacion.

## Orden Recomendado

1. Completar Fase 0 y Fase 1 juntas para establecer la base Redis directa.
2. Implementar Fase 2 antes de exponer nuevos endpoints sensibles, porque rate limiting de auth es critico.
3. Implementar Fase 5 despues de tener `RedisCoreService`, ya que la blacklist tambien es critica para auth.
4. Implementar Fase 3 para desacoplar emails.
5. Implementar Fase 4 con pruebas de concurrencia especificas.
6. Cerrar con Fase 6 y evidencias de build/pruebas.

## Criterios de Aceptacion

- El plan puede ejecutarse fase a fase sin depender de cambios implicitos.
- Cada fase incluye objetivo, archivos a tocar, comportamiento esperado y prueba minima.
- `AppCacheService` queda reservado para cache de aplicacion; el cliente Redis directo cubre rate limiting, locks, colas y blacklist.
- Redis queda marcado como dependencia critica para auth rate limiting y blacklist de tokens.
- La blacklist cubre access tokens y refresh tokens.
- El documento no implementa codigo; solo guia la implementacion posterior.
