# Revise

Uma plataforma de gerenciamento de questões de programação com **repetição espaçada inteligente**, projetada para estudantes de engenharia de software e entusiastas de programação competitiva.

## O Problema

Estudantes de programação competitiva e preparação para entrevistas técnicas geralmente gerenciam suas questões manualmente usando planilhas ou Notion, sem automação para agendamento de revisões ou integração entre ferramentas.

## A Solução

O **Revise** centraliza o gerenciamento de questões de programação, combinando organização, notas e repetição espaçada inteligente em uma única plataforma focada e especializada.

## Funcionalidades

### Implementadas

- **Autenticação Segura**
  - Registro e login com JWT
  - Cookies httpOnly com Access Token (15min) + Refresh Token (7 dias)

- **Gerenciamento de Questões**
  - CRUD completo para questões de programação
  - Metadados: dificuldade, plataforma (LeetCode, Codeforces, etc.), status
  - Organização em pastas com suporte a subpastas (estilo Obsidian)

- **Algoritmo SM-2 de Repetição Espaçada**
  - Cálculo automático da próxima data de revisão baseado na performance
  - Sistema de notas (0-5) que ajusta intervalos dinamicamente
  - Rastreamento de: fator de facilidade, intervalo em dias, vezes revisado

- **Sistema de Tópicos**
  - Tópicos globais gerenciados por admin (Grafos, DP, Árvores, etc.)
  - Associação múltipla de tópicos às questões

- **Sistema de Notas**
  - Notas anexadas a questões específicas
  - Notas standalone dentro de pastas

- **Sessões de Revisão**
  - Sessões de estudo com duração planejada
  - Ciclo de vida: pending → in_progress → finished/cancelled
  - Processamento em background com BullMQ para finalização automática

### Roadmap

- **Sistema de Contests**
  - Timer rígido e visível
  - Pontuação baseada em dificuldade
  - Histórico de resultados

- **Integração com Judge Online (Judge0)**
  - Execução de código direto na aplicação
  - Suporte multi-linguagem
  - Feedback de tempo de execução e uso de memória
  - Integração com SM-2: submissões erradas ajustam intervalos automaticamente

- **Contests Multiplayer**
  - Competição simultânea entre usuários
  - Leaderboard em tempo real

## Tech Stack

| Categoria | Tecnologia |
|-----------|------------|
| Runtime | Node.js + TypeScript (ES Modules) |
| Framework | Fastify v5 |
| Banco de Dados | PostgreSQL |
| ORM | Drizzle ORM |
| Cache/Filas | Redis + BullMQ |
| Autenticação | JWT + bcrypt |
| Validação | Zod |
| Documentação | Swagger/OpenAPI |
| Infraestrutura | Docker Compose |

## Estrutura do Projeto

```
src/
├── config/           # Configurações
├── controllers/      # Handlers das rotas
├── db/
│   ├── schema.ts     # Definições do banco (Drizzle)
│   └── migrations/   # Migrações
├── lib/              # Conexões (Redis)
├── middleware/       # Autenticação JWT
├── queues/           # Filas BullMQ
├── routes/           # Definições de rotas
├── services/         # Lógica de negócio
├── types/            # Tipos TypeScript
├── utils/            # Utilitários (SM2Algorithm)
├── workers/          # Processadores de jobs
└── server.ts         # Entry point
```

## Começando

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/revise.git
cd revise

# Instale as dependências
npm install

# Inicie os serviços (PostgreSQL e Redis)
docker-compose up -d

# Execute as migrações
npm run db:migrate

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento com hot reload
npm run db:generate  # Gera migrações do Drizzle
npm run db:migrate   # Executa migrações
npm run db:studio    # Interface visual do banco
```

## API

A documentação completa da API está disponível via Swagger em `/docs` quando o servidor está rodando.

### Principais Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/register` | Registro de usuário |
| POST | `/auth/login` | Login |
| GET | `/questions` | Lista questões |
| POST | `/questions` | Cria questão |
| POST | `/questions/:id/review` | Registra revisão (SM-2) |
| GET | `/review-sessions` | Lista sessões |
| POST | `/review-sessions` | Cria sessão de estudo |

## Diferenciais

- **Repetição espaçada integrada** ao fluxo de estudo
- **Organização flexível** com pastas e subpastas
- **Foco total** em programação competitiva e preparação para entrevistas técnicas
- **Futuro multiplayer** para competições em tempo real

## Licença

Este projeto está sob a licença MIT.
