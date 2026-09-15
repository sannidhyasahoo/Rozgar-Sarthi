// app/coding/assessment/layout.tsx
// Suppress the global navbar and footer for the full-screen IDE experience

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-[#08070c] transition-colors duration-200">
      {children}
    </div>
  );
}
