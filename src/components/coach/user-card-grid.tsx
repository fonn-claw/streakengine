"use client";

import { UserCard } from "@/components/coach/user-card";
import { PixelCard } from "@/components/ui/pixel-card";
import type { CoachUserCard } from "@/lib/queries/coach";

export function UserCardGrid({ users }: { users: CoachUserCard[] }) {
  if (users.length === 0) {
    return (
      <PixelCard className="flex items-center justify-center py-8">
        <p className="font-body text-[12px] text-text-dim">
          No users to monitor
        </p>
      </PixelCard>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {users.map((user) => (
        <UserCard user={user} key={user.userId} />
      ))}
    </div>
  );
}

export default UserCardGrid;
