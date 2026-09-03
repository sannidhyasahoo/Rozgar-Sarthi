// app/coding/assessment/[id]/page.tsx
// Server component — fetches initial question state, renders client

import { getQuestion } from "@/lib/codingApi";
import AssessmentPageClient from "./AssessmentPageClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AssessmentPage({ params }: Props) {
  const { id } = await params;

  let questionState;
  try {
    questionState = await getQuestion(id);
  } catch {
    notFound();
  }

  if (!questionState?.question) {
    notFound();
  }

  return (
    <AssessmentPageClient
      assessmentId={id}
      initialQuestion={questionState.question}
      initialIndex={questionState.questionIndex}
      totalQuestions={questionState.totalQuestions}
      timeLimitMinutes={60}
      initialSubmissions={questionState.submissions}
    />
  );
}
