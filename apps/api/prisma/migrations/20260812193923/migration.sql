-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "SceneEmbedding" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SceneEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SceneEmbedding_sceneId_idx" ON "SceneEmbedding"("sceneId");

-- AddForeignKey
ALTER TABLE "SceneEmbedding" ADD CONSTRAINT "SceneEmbedding_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
