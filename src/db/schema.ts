import { relations } from "drizzle-orm";
import {
    pgTable,
    text,
    primaryKey,
    timestamp,
    uuid,
    pgEnum,
    date,
    integer,
    real,
} from "drizzle-orm/pg-core";
import { DESTRUCTION } from "node:dns";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    university: text("university").notNull(),
    major: text("major").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const topics = pgTable("topics", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userTopics = pgTable(
    "user_topics",
    {
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        topicId: uuid("topic_id")
            .notNull()
            .references(() => topics.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (t) => [primaryKey({ columns: [t.userId, t.topicId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
    userTopics: many(userTopics),
    reviewSessions: many(reviewSessions),
    questions: many(questions),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
    userTopics: many(userTopics),
    questionTopics: many(questionTopics),
}));

export const userTopicRelations = relations(userTopics, ({ one }) => ({
    user: one(users, {
        fields: [userTopics.userId],
        references: [users.id],
    }),
    topic: one(topics, {
        fields: [userTopics.topicId],
        references: [topics.id],
    }),
}));

export const folder = pgTable("folder", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const folderRelations = relations(folder, ({ one }) => ({
    user: one(users, {
        fields: [folder.userId],
        references: [users.id],
    }),
    parent: one(folder, {
        fields: [folder.parentId],
        references: [folder.id],
    }),
}));

export const questionStatusEnum = pgEnum("question_status", [
    "to_review",
    "reviewing",
    "reviewed",
    "accepted",
    "wrong_answer",
]);

export const questions = pgTable("questions", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    link: text("link").notNull(),
    status: questionStatusEnum("status").notNull().default("to_review"),
    difficulty_rating: text("difficulty_rating").notNull(),
    next_review: date("next_review"),
    user_dificulty: text("user_difficulty"),
    platform: text("platform"),
    times_reviewed: integer("times_reviewed").default(0),
    last_reviewed_at: timestamp("last_reviewed_at"),
    interval_days: integer("interval_days").default(0),
    ease_factor: real("ease_factor").default(2.5),
    solved_at: timestamp("solved_at"),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    folderId: uuid("folder_id").references(() => folder.id, {
        onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notes = pgTable("notes", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    questionId: uuid("question_id").references(() => questions.id, {
        onDelete: "cascade",
    }),
    folderId: uuid("folder_id").references(() => folder.id, {
        onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const questionTopics = pgTable(
    "question_topics",
    {
        questionId: uuid("question_id")
            .notNull()
            .references(() => questions.id, { onDelete: "cascade" }),
        topicId: uuid("topic_id")
            .notNull()
            .references(() => topics.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (t) => [primaryKey({ columns: [t.questionId, t.topicId] })],
);

export const questionRelations = relations(questions, ({ one, many }) => ({
    user: one(users, {
        fields: [questions.userId],
        references: [users.id],
    }),
    folder: one(folder, {
        fields: [questions.folderId],
        references: [folder.id],
    }),
    questionTopics: many(questionTopics),
    reviewSessionsQuestions: many(reviewSessionQuestions),
    notes: many(notes),
}));

export const questionTopicRelations = relations(questionTopics, ({ one }) => ({
    question: one(questions, {
        fields: [questionTopics.questionId],
        references: [questions.id],
    }),
    topic: one(topics, {
        fields: [questionTopics.topicId],
        references: [topics.id],
    }),
}));

export const reviewSessions = pgTable("review_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    plannedDuration: integer("planned_duration").notNull(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
});

export const reviewSessionQuestions = pgTable(
    "review_session_questions",
    {
        reviewSessionId: uuid("review_session_id")
            .notNull()
            .references(() => reviewSessions.id, { onDelete: "cascade" }),
        questionId: uuid("question_id")
            .notNull()
            .references(() => questions.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (t) => [primaryKey({ columns: [t.reviewSessionId, t.questionId] })],
);

export const reviewSessionRelations = relations(
    reviewSessions,
    ({ one, many }) => ({
        user: one(users, {
            fields: [reviewSessions.userId],
            references: [users.id],
        }),
        reviewSessionQuestions: many(reviewSessionQuestions),
    }),
);

export const reviewSessionQuestionRelations = relations(
    reviewSessionQuestions,
    ({ one }) => ({
        reviewSession: one(reviewSessions, {
            fields: [reviewSessionQuestions.reviewSessionId],
            references: [reviewSessions.id],
        }),
        question: one(questions, {
            fields: [reviewSessionQuestions.questionId],
            references: [questions.id],
        }),
    }),
);

export const notesRelations = relations(notes, ({ one }) => ({
    user: one(users, {
        fields: [notes.userId],
        references: [users.id],
    }),
    question: one(questions, {
        fields: [notes.questionId],
        references: [questions.id],
    }),
    folder: one(folder, {
        fields: [notes.folderId],
        references: [folder.id],
    }),
}));
