import QuizDashboard from "@/features/quiz/QuizDashboard";
import { getMcqBankIndex } from "@/features/quiz/mcqBank";

export const dynamic = "force-dynamic";

export default async function McqQuizPage() {
  const bankIndex = await getMcqBankIndex();

  return <QuizDashboard bankIndex={bankIndex} />;
}
