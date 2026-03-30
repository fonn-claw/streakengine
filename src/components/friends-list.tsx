"use client";

import { useState } from "react";
import { FriendRow } from "@/components/friend-row";
import { NudgeToast } from "@/components/nudge-toast";

interface FriendsListProps {
  friends: {
    userId: number;
    displayName: string;
    level: number;
    totalXp: number;
    currentStreak: number;
    lastActive: Date | null;
  }[];
  nudges: { id: number; senderName: string; date: string }[];
}

export function FriendsList({ friends, nudges }: FriendsListProps) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {!dismissed && nudges.length > 0 && (
        <NudgeToast nudges={nudges} onDismiss={() => setDismissed(true)} />
      )}

      {friends.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <img
            src="/assets/empty-friends.svg"
            alt="No friends"
            width={200}
            height={160}
          />
          <p className="font-body text-text-dim text-[12px]">
            No party members yet
          </p>
        </div>
      ) : (
        friends.map((friend) => (
          <FriendRow key={friend.userId} friend={friend} />
        ))
      )}
    </div>
  );
}
