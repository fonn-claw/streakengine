"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import PixelButton from "@/components/ui/pixel-button";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, {});

  return (
    <main className="bg-game min-h-screen flex flex-col items-center justify-center p-4">
      {/* Hero image */}
      <img
        src="/assets/hero-login.png"
        alt="StreakEngine world"
        className="w-full max-w-[400px] mb-6 pixel-border"
      />

      {/* Logo wordmark */}
      <img
        src="/assets/logo.svg"
        alt="STREAK ENGINE"
        className="h-10 mb-8"
      />

      {/* Login form */}
      <div className="w-full max-w-[380px] bg-surface pixel-border p-6">
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block font-body text-text-dim text-[10px] uppercase mb-1"
            >
              EMAIL
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-surface-raised border-3 border-border text-text font-body text-[12px] px-4 py-3 placeholder:text-text-dim focus:border-primary outline-none"
              placeholder="user@streakengine.app"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-body text-text-dim text-[10px] uppercase mb-1"
            >
              PASSWORD
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-surface-raised border-3 border-border text-text font-body text-[12px] px-4 py-3 placeholder:text-text-dim focus:border-primary outline-none"
              placeholder="demo1234"
            />
          </div>

          {state?.error && (
            <div className="border-3 border-danger bg-surface p-3">
              <p className="text-danger font-body text-[12px]">{state.error}</p>
            </div>
          )}

          <PixelButton
            type="submit"
            disabled={isPending}
            variant="primary"
            className="w-full font-heading text-[12px] py-3"
          >
            {isPending ? "LOADING..." : "LOG IN"}
          </PixelButton>
        </form>
      </div>
    </main>
  );
}
