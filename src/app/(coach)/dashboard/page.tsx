import { PixelCard } from "@/components/ui/pixel-card";

export default function CoachDashboardPage() {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <PixelCard className="w-full flex flex-col items-center gap-4 py-8">
        <h1 className="font-heading text-primary text-[14px] text-center">
          COACH DASHBOARD
        </h1>
        <p className="font-body text-text-dim text-[12px] text-center">
          Community engagement data will appear here
        </p>
      </PixelCard>
    </div>
  );
}
