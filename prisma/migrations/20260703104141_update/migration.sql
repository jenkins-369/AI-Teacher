/*
  Warnings:

  - A unique constraint covering the columns `[course_id]` on the table `student_progress` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ai_summaries" DROP CONSTRAINT "ai_summaries_material_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_history" DROP CONSTRAINT "chat_history_material_id_fkey";

-- DropForeignKey
ALTER TABLE "document_chunks" DROP CONSTRAINT "document_chunks_material_id_fkey";

-- DropForeignKey
ALTER TABLE "flashcards" DROP CONSTRAINT "flashcards_material_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_questions" DROP CONSTRAINT "quiz_questions_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_material_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "student_progress_course_id_key" ON "student_progress"("course_id");

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "study_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "study_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "study_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "study_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_history" ADD CONSTRAINT "chat_history_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "study_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
