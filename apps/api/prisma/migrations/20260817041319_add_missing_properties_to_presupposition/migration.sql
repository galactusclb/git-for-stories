/*
  Warnings:

  - Added the required column `operation` to the `Commit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lineageId` to the `Scene` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommitOp" AS ENUM ('INIT', 'ADD', 'EDIT', 'DELETE', 'MERGE');

-- AlterTable
ALTER TABLE "Commit" ADD COLUMN     "operation" "CommitOp" NOT NULL;

-- AlterTable
ALTER TABLE "Presupposition" ADD COLUMN     "expectedValue" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Scene" ADD COLUMN     "lineageId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Scene_lineageId_idx" ON "Scene"("lineageId");
