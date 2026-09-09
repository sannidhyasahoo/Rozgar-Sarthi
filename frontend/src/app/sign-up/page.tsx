"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { ArrowRight, Lock, Mail, User, Cpu, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { signInMock } = useAppAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    signInMock(name, email);

    // Forward to Onboarding to configure target role and upload resume
    setTimeout(() => {
      router.push("/onboarding");
    }, 300);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center px-4 py-12 bg-[#fafafa] dark:bg-[#08070c] transition-colors relative overflow-hidden">
      {/* Subtle ambient corporate radial glow in dark mode */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-iris/5 dark:bg-iris/[0.04] rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-[440px]">
        {/* Formal Enterprise Authentication Card */}
        <div className="bg-white dark:bg-[#0e0d14] border border-zinc-200/90 dark:border-[#1f1c2b] rounded-2xl p-8 sm:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all">
          
          {/* Card Header (Integrated Inside Card - No Floating Logo Above) */}
          <div className="mb-7 pb-6 border-b border-zinc-100 dark:border-[#1a1726]">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-iris text-white flex items-center justify-center shadow-xs">
                  <Cpu className="w-4 h-4 text-emerald-400 dark:text-white stroke-[2]" />
                </div>
                <span className="font-bold text-sm text-zinc-900 dark:text-white tracking-tight">
                  Rozgar Sarthi
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-[#9e98b7] uppercase tracking-wider bg-zinc-100 dark:bg-[#181622] px-2 py-0.5 rounded border border-zinc-200/80 dark:border-[#221e33]">
                Candidate Registration
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Create your account
            </h1>
            <p className="text-xs text-zinc-500 dark:text-[#9e98b7] mt-1.5 leading-relaxed">
              Start free adaptive mock interviews with live competency tracking and telemetry.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  suppressHydrationWarning
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-[#1f1c2b] bg-zinc-50/50 dark:bg-[#12111a] hover:bg-white dark:hover:bg-[#151320] focus:bg-white dark:focus:bg-[#151320] focus:outline-none focus:border-iris dark:focus:border-iris focus:ring-4 focus:ring-iris/10 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  suppressHydrationWarning
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-[#1f1c2b] bg-zinc-50/50 dark:bg-[#12111a] hover:bg-white dark:hover:bg-[#151320] focus:bg-white dark:focus:bg-[#151320] focus:outline-none focus:border-iris dark:focus:border-iris focus:ring-4 focus:ring-iris/10 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  suppressHydrationWarning
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-[#1f1c2b] bg-zinc-50/50 dark:bg-[#12111a] hover:bg-white dark:hover:bg-[#151320] focus:bg-white dark:focus:bg-[#151320] focus:outline-none focus:border-iris dark:focus:border-iris focus:ring-4 focus:ring-iris/10 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="w-full mt-2 rounded-xl bg-iris hover:bg-iris/90 text-white font-semibold text-sm py-2.5 transition-all duration-150 shadow-sm shadow-iris/20 flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
            >
              <span>{loading ? "Setting up..." : "Create Account & Start"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Card Footer Navigation */}
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-[#1a1726] text-center">
            <p className="text-xs text-zinc-500 dark:text-[#9e98b7]">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-semibold text-iris hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Formal Security & Compliance Footer */}
        <div className="mt-6 text-center space-y-1.5">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-1.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            No credit card required · Private candidate telemetry
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400 dark:text-zinc-600">
            <Link href="/" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Sentry Security</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
