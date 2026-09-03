// app/coding/assessment/layout.tsx
// Suppress the global navbar and footer for the full-screen IDE experience

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f10]">
      {children}
    </div>
  );
}
