// app/coding/assessment/[id]/report/page.tsx
// Final assessment report page

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { getReport, type AssessmentReport } from "@/lib/codingApi";
import { AssessmentReportComponent } from "@/components/coding/AssessmentReport";
import { Loader2, Code2 } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ReportPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReport(id)
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center gap-4 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#6a5ed9]" />
        <p className="font-mono text-sm">Generating your assessment report…</p>
        <p className="text-xs text-zinc-600">Analyzing performance across all submissions</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center gap-4 text-zinc-400">
        <Code2 className="w-8 h-8 text-zinc-600" />
        <p className="font-mono text-sm text-red-400">Failed to load report</p>
        <p className="text-xs text-zinc-600">{error}</p>
        <button
          onClick={() => router.push("/coding")}
          className="mt-4 btn-primary-action px-6 py-2 text-sm"
        >
          Return to Coding
        </button>
      </div>
    );
  }

  return (
    <AssessmentReportComponent
      report={report}
      onReturnDashboard={() => router.push("/dashboard")}
    />
  );
}
