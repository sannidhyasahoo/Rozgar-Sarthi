import React from "react";

interface MonoEyebrowProps {
  children: React.ReactNode;
  color?: "sprout" | "cobalt" | "coral" | "iris" | "zinc" | "emerald";
  className?: string;
}

export function MonoEyebrow({
  children,
  color = "sprout",
  className = "",
}: MonoEyebrowProps) {
  const colorMap = {
    sprout: "text-sprout bg-sprout/10 border-sprout/20",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    cobalt: "text-cobalt bg-cobalt/10 border-cobalt/20",
    coral: "text-coral bg-coral/10 border-coral/20",
    iris: "text-iris bg-iris/10 border-iris/20",
    zinc: "text-zinc-600 bg-zinc-100 border-zinc-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-medium tracking-[0.08em] uppercase border ${colorMap[color]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
