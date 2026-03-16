ALTER TABLE "questions" ALTER COLUMN "times_reviewed" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "interval_days" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "ease_factor" DROP NOT NULL;