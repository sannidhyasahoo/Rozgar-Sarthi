"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { MonoEyebrow } from "@/components/shared/MonoEyebrow";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const { signInMock } = useAppAuth();
  const [email, setEmail] = useState("alex@developer.io");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const inferredName = email.split("@")[0].replace(".", " ");
    const capitalized = inferredName.charAt(0).toUpperCase() + inferredName.slice(1);
    signInMock(capitalized || "Candidate", email);

    setTimeout(() => {
      router.push("/dashboard");
    }, 300);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <MonoEyebrow color="cobalt">WELCOME BACK</MonoEyebrow>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-2">
            Sign In to Rozgar Sarthi
          </h1>
          <p className="text-sm text-zinc-600">
            Access your active competency state, interview telemetry, and coding rounds.
          </p>
        </div>

        <div className="dev-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-700 font-semibold mb-1.5 uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-iris/20 focus:border-iris transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-zinc-700 font-semibold uppercase">
                  Password
                </label>
                <span className="text-xs text-iris hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
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
              <span>{loading ? "Signing in..." : "Sign In to Dashboard"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-200/80 text-center">
            <p className="text-xs text-zinc-500">
              New candidate?{" "}
              <Link href="/sign-up" className="font-semibold text-iris hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-sprout" />
          <span>Quick Demo Login Enabled</span>
        </div>
      </div>
    </div>
  );
}
