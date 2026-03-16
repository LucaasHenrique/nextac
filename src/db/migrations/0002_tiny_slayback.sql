CREATE TYPE IF NOT EXISTS "question_status" AS ENUM('to_review', 'reviewing', 'reviewed', 'accepted', 'wrong_answer');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_topics" (
	"question_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "question_topics_question_id_topic_id_pk" PRIMARY KEY("question_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"link" text NOT NULL,
	"status" "question_status" DEFAULT 'to_review' NOT NULL,
	"next_review" date,
	"difficulty_rating" text NOT NULL,
	"user_difficulty" text,
	"platform" text NOT NULL,
	"times_reviewed" integer DEFAULT 0 NOT NULL,
	"last_reviewed_at" timestamp,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"ease_factor" real DEFAULT 2.5 NOT NULL,
	"solved_at" timestamp,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE IF EXISTS "question_topics" ADD CONSTRAINT "question_topics_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE IF EXISTS "question_topics" ADD CONSTRAINT "question_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE IF EXISTS "questions" ADD CONSTRAINT "questions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;