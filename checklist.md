# Revise — Project Checklist

## ✅ Auth (concluído)
- [x] Registro de usuário
- [x] Login com JWT
- [x] Middleware de autenticação

---

## 📦 Topics
- [x] `GET /topics` — listar todos os tópicos globais
- [x] `GET /topics/:id` — buscar tópico por ID

---

## ❓ Questions
- [x] `POST /questions` — criar questão
- [x] `GET /questions` — listar questões do usuário autenticado
- [x] `GET /questions/:id` — buscar questão por ID
- [x] `PATCH /questions/:id` — atualizar questão
- [x] `DELETE /questions/:id` — deletar questão
- [x] `POST /questions/:id/topics` — associar tópico à questão
- [x] `DELETE /questions/:id/topics/:topicId` — remover tópico da questão
- [x] Lógica do algoritmo SM-2 ao criar/atualizar revisão (`ease_factor`, `interval_days`, `next_review`)

---

## 📝 Notes
- [x] `POST /questions/:id/notes` — criar nota para uma questão
- [x] `GET /questions/:id/notes` — listar notas de uma questão
- [x] `GET /notes/:id` — buscar nota por ID
- [x] `PATCH /notes/:id` — atualizar nota
- [x] `DELETE /notes/:id` — deletar nota

---

## 🗂️ User Topics (tópicos de interesse)
- [x] `POST /users/topics` — adicionar tópico de interesse
- [x] `GET /users/topics` — listar tópicos de interesse do usuário
- [x] `DELETE /users/topics/:topicId` — remover tópico de interesse

---

## 📅 Review Sessions
- [x] `POST /review-sessions` — criar sessão de revisão
- [x] `GET /review-sessions` — listar sessões do usuário
- [x] `GET /review-sessions/:id` — buscar sessão por ID
- [ ] `PATCH /review-sessions/:id` — atualizar sessão (ex: registrar `ended_at`)
- [x] `DELETE /review-sessions/:id` — deletar sessão
- [x] `POST /review-sessions/:id/questions` — adicionar questão à sessão
- [x] `DELETE /review-sessions/:id/questions/:questionId` — remover questão da sessão
- [x] `GET /review-sessions/:id/questions` — listar questões de uma sessão

---

## 👤 User
- [x] `GET /users/me` — perfil do usuário autenticado
- [x] `PATCH /users/me` — atualizar perfil
- [x] `DELETE /users/me` — deletar conta

---
elos de linguagem (LLMs) 
## 🔧 Infraestrutura & Qualidade
- [ ] Validação de inputs com Zod em todas as rotas
- [ ] Tratamento de erros global no Fastify
- [ ] Testes unitários nos services
- [ ] Testes de integração nas rotas principais
- [ ] Variáveis de ambiente validadas no startup
- [ ] Docker Compose funcional para ambiente de desenvolvimento
