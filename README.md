# Revise

A focused backend for smarter study workflows, combining notes, folders, sessions, and spaced repetition in one place.

Revise started with programming practice in mind, but its structure is designed for broader learning use cases: interview prep, college subjects, certifications, and self-study in general.

## Why Revise

Most students organize study content across disconnected tools. Revise brings core study operations together:

- Organize topics and materials in folders
- Track study items with status and metadata
- Write notes linked to specific items
- Plan study sessions with time limits
- Use SM-2 spaced repetition to schedule smarter reviews

## Core Features

- Secure authentication (JWT + refresh flow)
- CRUD for study items (currently centered on questions)
- Folder system with nested structure
- Notes attached to items or standalone
- Topic tagging and user topic interests
- Review sessions with automatic background finalization (BullMQ)
- Global error handling and structured logging

## Tech Stack

- Node.js + TypeScript
- Fastify
- PostgreSQL + Drizzle ORM
- Redis + BullMQ
- Zod
- Swagger / OpenAPI
- Docker Compose

## Quick Start

```bash
git clone <your-repo-url>
cd revise
npm install
docker-compose up -d
npm run db:migrate
npm run dev
```

API docs will be available at `/docs` when the server is running.

## Project Structure

```text
src/
  controllers/
  db/
  errors/
  lib/
  middleware/
  queues/
  routes/
  services/
  types/
  workers/
  server.ts
```

## Roadmap

- Expand domain model from coding questions to general study entities
- Improve analytics for review performance and retention
- Add richer planning tools for long-term study goals

## License

MIT
