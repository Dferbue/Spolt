# Plan de implementacion de Redis Cache

## Objetivo

Usar Redis como cache compartida para reducir lecturas repetidas en endpoints de consulta, sin cachear operaciones de escritura ni flujos sensibles al estado. Redis ya existe en `docker-compose.yml`; falta integrarlo en NestJS.

## Enfoque tecnico

Instalar la capa oficial de cache para NestJS 11:

```bash
cd spolt-backend
npm install @nestjs/cache-manager cache-manager @keyv/redis keyv
```

Crear un modulo `src/cache/cache.module.ts` con `CacheModule.registerAsync()`, `ConfigService` y `KeyvRedis`, leyendo:

```env
REDIS_URL=redis://localhost:6379
CACHE_TTL_EVENTS_MS=30000
CACHE_TTL_ADMIN_STATS_MS=30000
CACHE_TTL_WEATHER_MS=1800000
CACHE_TTL_STATIC_MS=3600000
```

Crear un servicio propio `AppCacheService` para evitar duplicar logica:

- `getOrSet<T>(key, ttlMs, loader)`
- `delete(key)`
- `getVersion(namespace)`
- `bumpVersion(namespace)`

Las claves deben incluir una version por dominio para invalidar sin borrar por patron:

```txt
spolt:v1:events:{version}:list:{hash(params)}
spolt:v1:sports:{version}:all
spolt:v1:admin:{version}:stats
spolt:v1:weather:forecast:{latBucket}:{lngBucket}
```

## Fase 1: infraestructura

Estado: implementada en `src/cache/app-cache.module.ts` y
`src/cache/app-cache.service.ts`.

1. Registrar `CacheModule` global en `AppModule`.
2. Crear `AppCacheModule` y `AppCacheService`.
3. Validar conexion al arrancar con log claro si Redis no esta disponible.
4. Mantener fallback: si Redis falla, ejecutar el `loader()` y devolver datos desde Prisma o AEMET.

## Fase 2: primeros endpoints a cachear

Estado: implementada en `EventsService.findAll()`, `SportsService.findAll()`,
`AdminService.getStats()` y `WeatherService.getSevenDayForecast()`.

Empezar por endpoints con bajo riesgo de datos privados:

- `EventsService.findAll()`: TTL 30-60 segundos. Incluir `page`, `limit`, `search`, `estado`, `id_deporte`, `mes`, `anio`, `sort`, `tipo_evento`, `lat`, `lng` y `radio_km` en la clave.
- `SportsService.findAll()`: TTL 1 hora. Invalidar al crear, editar o borrar deportes.
- `AdminService.getStats()`: TTL 15-30 segundos. Invalidar al crear/borrar usuarios, crear/finalizar eventos y modificar deportes.
- `WeatherService.getSevenDayForecast()`: TTL 30-60 minutos. Redondear coordenadas o cachear por municipio AEMET para evitar claves infinitas.

No cachear inicialmente:

- `findYoursEvents()`, `findEventsFriends()` y `eventosParticipante()` hasta medir necesidad, porque dependen del usuario.
- Login, registro, confirmacion de email y cambios de perfil.
- Operaciones `POST`, `PATCH` y `DELETE`.

## Fase 3: invalidacion

Estado: implementada para escrituras de eventos, deportes y usuarios.

Incrementar versiones despues de escrituras:

- Eventos: `create`, `update`, `remove`, `unirseEvento`, `salirEvento`,
  `finalizarEvento` y cierre automatico por cron invalidan `events`; los cambios
  que afectan estado/conteo tambien invalidan `admin`.
- Deportes: `create`, `update`, `remove` invalidan `sports`; `update/remove`
  invalidan tambien `events` porque las respuestas de eventos incluyen datos del
  deporte; `create/remove` invalidan `admin`.
- Usuarios/admin stats: `UsersService.create()` invalida `admin`; `remove()`
  invalida `admin` y `events` porque puede eliminar eventos creados o
  participaciones.

Esto evita usar `KEYS` en Redis y reduce el riesgo de borrar claves no relacionadas. Las claves viejas caducan por TTL.

## Fase 4: medicion

Antes y despues de activar cada cache:

1. Medir tiempo medio de `GET /events` con filtros frecuentes.
2. Revisar numero de consultas Prisma por request en `findAll()`.
3. Registrar `cache hit`, `cache miss` y errores Redis con `Logger`.
4. Mantener la cache solo si reduce latencia o carga de base de datos de forma visible.

## Criterio de finalizacion

La primera version se considera completa cuando:

- Redis se configura por `.env`.
- `GET /events`, `GET /sports`, stats admin y weather usan `getOrSet()`.
- Las escrituras invalidan versiones correctamente.
- `npm run build` y tests relevantes pasan.
- El backend sigue funcionando aunque Redis este caido.
