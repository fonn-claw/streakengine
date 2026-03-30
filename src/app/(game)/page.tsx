import { logout } from "@/lib/actions/auth";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="font-heading text-primary text-[14px]">QUEST BOARD</h1>
      <p className="font-body text-text-dim text-[12px]">
        Your daily quests will appear here.
      </p>
      <form action={logout}>
        <button
          type="submit"
          className="bg-surface pixel-border text-text font-body text-[12px] px-4 py-2 hover:bg-surface-raised cursor-pointer"
        >
          LOG OUT
        </button>
      </form>
    </main>
  );
}
