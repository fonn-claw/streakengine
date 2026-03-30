import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getFriendsList, getUnreadNudges } from "@/lib/queries/friends";
import { FriendsList } from "@/components/friends-list";

export default async function FriendsPage() {
  const session = await requireAuth();

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const [friends, nudges] = await Promise.all([
    getFriendsList(session.userId),
    getUnreadNudges(session.userId),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-[14px] text-primary">FRIENDS</h1>
      <FriendsList friends={friends} nudges={nudges} />
    </div>
  );
}
