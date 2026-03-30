import { getSession } from "@/lib/auth";
import { TopNav } from "@/components/ui/top-nav";
import { BottomNav } from "@/components/ui/bottom-nav";

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 pb-20 md:pb-4 pt-4">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
