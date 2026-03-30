import { getSession } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Coach top nav */}
      <nav className="bg-surface border-b-3 border-border">
        <div className="max-w-[720px] mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <a href="/">
              <img src="/assets/logo.svg" alt="StreakEngine" height={32} className="h-8" />
            </a>
            <span className="font-body text-[12px] text-accent">
              COACH DASHBOARD
            </span>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="font-body text-[12px] text-text-dim hover:text-danger px-3 py-2 cursor-pointer"
            >
              LOG OUT
            </button>
          </form>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 py-4">
        {children}
      </main>
    </div>
  );
}
