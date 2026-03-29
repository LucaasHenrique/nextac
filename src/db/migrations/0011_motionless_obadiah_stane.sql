ALTER TABLE "review_sessions" ALTER COLUMN "started_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "review_sessions" ALTER COLUMN "started_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "review_sessions" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;