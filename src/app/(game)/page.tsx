import { PixelCard } from "@/components/ui/pixel-card";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <PixelCard className="w-full flex flex-col items-center gap-4 py-8">
        <img
          src="/assets/empty-quests.svg"
          alt="No quests"
          width={200}
          height={160}
        />
        <h1 className="font-heading text-primary text-[14px] text-center">
          QUEST BOARD
        </h1>
        <p className="font-body text-text-dim text-[12px] text-center">
          Your daily quests will appear here
        </p>
      </PixelCard>
    </div>
  );
}
