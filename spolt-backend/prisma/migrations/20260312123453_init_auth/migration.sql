-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "refresh_token_hash" VARCHAR(255),
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';
