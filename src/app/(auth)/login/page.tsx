"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, {});

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm pixel-border bg-surface p-6">
        <h1 className="font-heading text-primary text-[14px] mb-6 text-center">
          STREAK ENGINE
        </h1>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block font-body text-text-dim text-[12px] mb-1"
            >
              EMAIL
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-surface-raised border-2 border-border text-text font-body text-[12px] px-3 py-2 focus:border-primary outline-none"
              placeholder="user@streakengine.app"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-body text-text-dim text-[12px] mb-1"
            >
              PASSWORD
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-surface-raised border-2 border-border text-text font-body text-[12px] px-3 py-2 focus:border-primary outline-none"
              placeholder="demo1234"
            />
          </div>

          {state?.error && (
            <p className="text-danger font-body text-[12px]">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-text font-heading text-[12px] py-3 border-3 border-border hover:bg-primary/80 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "LOADING..." : "LOG IN"}
          </button>
        </form>
      </div>
    </main>
  );
}
