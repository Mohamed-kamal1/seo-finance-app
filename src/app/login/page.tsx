"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, formAction] = useFormState(signIn, { error: "" } satisfies LoginState);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-display text-2xl text-white tracking-tight">SEO House</div>
          <div className="text-xs text-muted font-mono-num mt-1 tracking-widest">FINANCE LEDGER</div>
        </div>
        <form action={formAction} className="card p-6 space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
              placeholder="you@seohouse.com"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>
          {state.error && <div className="text-xs text-danger">{state.error}</div>}
          <SubmitButton />
        </form>
        <p className="text-center text-xs text-muted mt-4">
          Admin account created in Supabase Auth. See README for setup.
        </p>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-accent text-ink font-medium text-sm rounded-md py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

