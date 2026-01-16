-- AlterTable
ALTER TABLE "user" ADD COLUMN     "apiKeys" JSONB NOT NULL DEFAULT '{}';
