"use client";

import { useTransition } from "react";
import { PixelButton } from "@/components/ui/pixel-button";
import { markNudgesRead } from "@/lib/actions/social";

interface NudgeToastProps {
  nudges: { id: number; senderName: string; date: string }[];
  onDismiss: () => void;
}

export function NudgeToast({ nudges, onDismiss }: NudgeToastProps) {
  const [isPending, startTransition] = useTransition();

  if (nudges.length === 0) return null;

  const message =
    nudges.length === 1
      ? `${nudges[0].senderName} nudged you!`
      : `You have ${nudges.length} nudges!`;

  function handleDismiss() {
    startTransition(async () => {
      await markNudgesRead(nudges.map((n) => n.id));
      onDismiss();
    });
  }

  return (
    <div className="bg-surface-raised pixel-border p-3 flex items-center gap-3">
      <img
        src="/assets/icon-nudge.svg"
        alt="Nudge"
        width={20}
        height={20}
      />
      <span className="font-body text-[11px] text-text flex-1">{message}</span>
      <PixelButton
        variant="secondary"
        size="sm"
        onClick={handleDismiss}
        disabled={isPending}
      >
        OK
      </PixelButton>
    </div>
  );
}
