ALTER TYPE "public"."availability_status" ADD VALUE 'completed';--> statement-breakpoint
ALTER TYPE "public"."availability_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TABLE "Accounts" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Accounts" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Sessions" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Sessions" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Patients" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "MedicalRecords" ALTER COLUMN "bloodType" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Users" DROP COLUMN "passwordHash";