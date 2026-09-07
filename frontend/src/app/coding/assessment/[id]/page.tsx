// app/coding/assessment/[id]/page.tsx
// Resilient page for coding assessment session

import { getQuestion } from "@/lib/codingApi";
import AssessmentPageClient from "./AssessmentPageClient";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AssessmentPage({ params }: Props) {
  const { id } = await params;

  let questionState = null;
  let errorMsg = null;

  try {
    questionState = await getQuestion(id);
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Assessment session not found";
  }

  if (!questionState?.question) {
    return (
      <div className="min-h-screen bg-[#0f0f10] text-zinc-200 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Assessment Session Not Found</h1>
        <p className="text-zinc-400 text-sm max-w-md mb-8 leading-relaxed">
          {errorMsg || "This assessment session may have expired, been completed, or the ID is invalid."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/coding"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#6a5ed9] hover:bg-[#7b6fe0] text-white font-bold text-sm transition-all shadow-lg shadow-[#6a5ed9]/20"
          >
            <RefreshCw className="w-4 h-4" />
            Start New Assessment
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1a1a1e] hover:bg-[#2a2a2e] text-zinc-300 font-medium text-sm border border-[#2a2a2e] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
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
