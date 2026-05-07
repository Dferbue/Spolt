# Repository Guidelines

## Project Structure & Module Organization

Spolt is split into two TypeScript applications. `spolt-frontend/` contains the Angular 21 SPA; main code lives in `src/app/`, with `auth/`, `layout`, `pages`, and `shared` grouping features and reusable UI/services. Static files are in `public/`, and environment settings are in `src/environments/`.

`spolt-backend/` contains the NestJS 11 API. Feature code is under `src/modules/` (`auth`, `users`, `events`, `sports`, `weather`, etc.), Prisma integration is in `src/prisma/`, and schema/migrations are in `prisma/`. Backend e2e tests live in `test/`. Root-level `spolt_dump.sql` is a database reference artifact.

## Build, Test, and Development Commands

Install dependencies per app:

```bash
cd spolt-backend && npm install
cd spolt-frontend && npm install
```

```bash
cd spolt-backend && docker compose up -d   # PostgreSQL, MinIO, Redis
cd spolt-backend && npm run start:dev      # Nest API with watch mode
cd spolt-backend && npm run build          # compile backend
cd spolt-backend && npm run test           # Jest unit tests
cd spolt-backend && npm run test:e2e       # e2e tests
```

```bash
cd spolt-frontend && npm start             # Angular dev server
cd spolt-frontend && npm run build         # production build
cd spolt-frontend && npm test              # Angular test runner
```

Run `npx prisma generate` after schema changes and `npx prisma migrate dev` for local migration creation.

## Coding Style & Naming Conventions

Use TypeScript throughout. Keep Angular components as paired `.ts`, `.html`, and `.css` files in kebab-case directories, following names such as `create-event/` and `list-friends/`. Nest modules should keep controller, service, module, DTO, and entity files in their feature folder.

Backend formatting uses Prettier and ESLint: `npm run format` and `npm run lint`. Frontend Prettier uses single quotes and `printWidth: 100`.

## Testing Guidelines

Backend unit tests use Jest with `*.spec.ts` naming. Place e2e tests under `spolt-backend/test/`. Frontend tests run through `npm test`; place specs near the component/service they verify.

## Commit & Pull Request Guidelines

Recent commits are short Spanish feature summaries, for example `organizacion frontend` and `rama-finalizacion-admin`. Keep commits concise and focused on one change.

Pull requests should include a summary, tests run, migration notes when `prisma/` changes, and screenshots for visible frontend changes. Link related issues and call out required `.env`, Docker, or Prisma setup.

## Security & Configuration Tips

Do not commit real secrets. Keep local credentials in `.env` files and document new variables. Validate DTO inputs on the backend and keep auth-sensitive logic inside guards, strategies, and services.
