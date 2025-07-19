/*
  Warnings:

  - You are about to drop the column `file` on the `Fragment` table. All the data in the column will be lost.
  - Added the required column `files` to the `Fragment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Fragment" DROP COLUMN "file",
ADD COLUMN     "files" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "userId" TEXT NOT NULL;
