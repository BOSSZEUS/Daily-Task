"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Brag Doc
          </h1>
          <p className="mt-2 text-zinc-500">
            Track your wins. Own your narrative.
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <p className="font-medium text-green-800">Check your email!</p>
            <p className="mt-1 text-sm text-green-600">
              We sent a magic link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-3 font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-zinc-50 px-2 text-zinc-400">
                  or use email
                </span>
              </div>
            </div>

            <form onSubmit={handleMagicLink} className="space-y-4">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
