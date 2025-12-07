-- Add avatar column to projects for storing assigned avatar key
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "avatar" TEXT;

