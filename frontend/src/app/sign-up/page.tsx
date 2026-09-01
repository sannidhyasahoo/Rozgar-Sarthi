"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { MonoEyebrow } from "@/components/shared/MonoEyebrow";
import { ArrowRight, Lock, Mail, User, ShieldCheck } from "lucide-react";

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
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <MonoEyebrow color="iris">CANDIDATE ONBOARDING</MonoEyebrow>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-sm text-zinc-600">
            Sign up to calibrate your target role and begin adaptive assessments.
          </p>
        </div>

        <div className="dev-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-700 font-semibold mb-1.5 uppercase">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-iris/20 focus:border-iris transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-700 font-semibold mb-1.5 uppercase">
                Work or Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="alex@engineer.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-iris/20 focus:border-iris transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-700 font-semibold mb-1.5 uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-iris/20 focus:border-iris transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-action w-full mt-2"
            >
              <span>{loading ? "Creating Account..." : "Continue to Target Role"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-200/80 text-center">
            <p className="text-xs text-zinc-500">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-semibold text-iris hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-sprout" />
          <span>Clerk Auth Ready • Client Local Storage Enabled</span>
        </div>
      </div>
    </div>
  );
}
