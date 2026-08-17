/*
  Warnings:

  - You are about to drop the column `object` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Event` table. All the data in the column will be lost.
  - Added the required column `subjectId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EntityKind" AS ENUM ('CHARACTER', 'OBJECT', 'LOCATION', 'FACTION');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "object",
DROP COLUMN "subject",
ADD COLUMN     "objectId" TEXT,
ADD COLUMN     "subjectId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Fact" (
    "id" TEXT NOT NULL,
    "commitId" TEXT NOT NULL,
    "sequenceId" INTEGER NOT NULL,
    "subjectId" TEXT NOT NULL,
    "predicate" TEXT NOT NULL,
    "objectId" TEXT,
    "value" BOOLEAN NOT NULL,
    "sourceEventId" TEXT NOT NULL,
    "extractorVersion" INTEGER NOT NULL,

    CONSTRAINT "Fact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presupposition" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "predicate" TEXT NOT NULL,
    "objectId" TEXT,

    CONSTRAINT "Presupposition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headCommitId" TEXT,
    "forkedFromCommitId" TEXT,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commit" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "parentId" TEXT,
    "mergeParentId" TEXT,
    "sceneId" TEXT,

    CONSTRAINT "Commit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "kind" "EntityKind" NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Fact_commitId_idx" ON "Fact"("commitId");

-- CreateIndex
CREATE INDEX "Fact_subjectId_idx" ON "Fact"("subjectId");

-- CreateIndex
CREATE INDEX "Fact_objectId_idx" ON "Fact"("objectId");

-- CreateIndex
CREATE INDEX "Fact_sourceEventId_idx" ON "Fact"("sourceEventId");

-- CreateIndex
CREATE INDEX "Fact_subjectId_predicate_objectId_idx" ON "Fact"("subjectId", "predicate", "objectId");

-- CreateIndex
CREATE INDEX "Presupposition_subjectId_predicate_objectId_idx" ON "Presupposition"("subjectId", "predicate", "objectId");

-- CreateIndex
CREATE INDEX "Presupposition_sceneId_idx" ON "Presupposition"("sceneId");

-- CreateIndex
CREATE INDEX "Branch_storyId_idx" ON "Branch"("storyId");

-- CreateIndex
CREATE INDEX "Commit_branchId_idx" ON "Commit"("branchId");

-- CreateIndex
CREATE INDEX "Commit_parentId_idx" ON "Commit"("parentId");

-- CreateIndex
CREATE INDEX "Commit_mergeParentId_idx" ON "Commit"("mergeParentId");

-- CreateIndex
CREATE INDEX "Commit_sceneId_idx" ON "Commit"("sceneId");

-- AddForeignKey
ALTER TABLE "Fact" ADD CONSTRAINT "Fact_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "Commit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fact" ADD CONSTRAINT "Fact_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fact" ADD CONSTRAINT "Fact_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fact" ADD CONSTRAINT "Fact_sourceEventId_fkey" FOREIGN KEY ("sourceEventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presupposition" ADD CONSTRAINT "Presupposition_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presupposition" ADD CONSTRAINT "Presupposition_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presupposition" ADD CONSTRAINT "Presupposition_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_headCommitId_fkey" FOREIGN KEY ("headCommitId") REFERENCES "Commit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_forkedFromCommitId_fkey" FOREIGN KEY ("forkedFromCommitId") REFERENCES "Commit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Commit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_mergeParentId_fkey" FOREIGN KEY ("mergeParentId") REFERENCES "Commit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
