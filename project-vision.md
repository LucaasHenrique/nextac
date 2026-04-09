# Revise — Project Vision

## O que é

Revise é uma aplicação web voltada para estudantes de engenharia de software e programação competitiva. O objetivo é centralizar o gerenciamento de questões de programação, combinando organização, anotações e revisão espaçada inteligente num único lugar.

O problema que resolve: hoje os estudantes gerenciam questões manualmente em planilhas ou Notion, sem automação de revisão e sem integração entre as ferramentas. O Revise une tudo isso num produto focado.

---

## Stack

- **Backend:** Node.js + Fastify + TypeScript
- **ORM:** Drizzle ORM
- **Banco de dados:** PostgreSQL (Docker)
- **Frontend:** React

---

## Entidades principais

- **User** — perfil do estudante com universidade, curso e área de interesse
- **Topic** — tópicos globais de programação (ex: Graph, DP, Trees) gerenciados pelo admin
- **Folder** — organização de questões e notas em pastas com suporte a subpastas
- **Question** — questão de programação com metadados de revisão (SM-2), status, dificuldade e plataforma de origem
- **Note** — nota associada a uma questão ou solta dentro de uma folder
- **ReviewSession** — sessão de estudo com duração planejada e questões associadas
- **UserTopics** — tópicos de interesse do usuário (N:N)
- **QuestionTopics** — tópicos associados a uma questão (N:N)
- **ReviewSessionQuestions** — questões dentro de uma sessão de revisão (N:N)

---

## Funcionalidades da base

- Autenticação com JWT
- CRUD de questões com organização em folders
- Notas por questão e notas soltas em folders
- Associação de tópicos a questões
- Algoritmo **SM-2 (Spaced Repetition)** para calcular automaticamente a próxima data de revisão de cada questão com base no desempenho do usuário
- Sessões de revisão com duração planejada e histórico

---

## Ideias para o futuro

### Contests
Entidade separada de `ReviewSession` com características próprias voltadas para competição:
- Timer rígido visível
- Pontuação baseada em dificuldade
- Resultado e histórico final
- Base para multiplayer no futuro

### Online Judge (via Judge0)
Integração com **Judge0** (open source) para execução de código diretamente no app:
- Suporte a múltiplas linguagens
- Submissão de código com validação por casos de teste
- Retorno de tempo de execução e uso de memória
- Entidade `Submission` para histórico de submissões por questão
- Integração com SM-2: submissão errada ajusta automaticamente o intervalo de revisão

### Multiplayer Contests
- Vários usuários competindo nas mesmas questões simultaneamente
- Ranking em tempo real
- Diferencial forte em relação às ferramentas existentes

---

## Diferenciais

- Spaced repetition automático integrado ao fluxo de estudo
- Organização flexível com folders e subfolders estilo Obsidian
- Foco total no estudante de programação competitiva e entrevistas técnicas
- Base extensível para contests e judge próprio no futuro
