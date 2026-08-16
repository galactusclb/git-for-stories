/*
  Warnings:

  - A unique constraint covering the columns `[sceneId,model]` on the table `SceneEmbedding` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SceneEmbedding_sceneId_model_key" ON "SceneEmbedding"("sceneId", "model");
