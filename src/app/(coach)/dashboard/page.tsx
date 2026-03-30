import { requireAuth } from "@/lib/auth";
import { getCoachDashboardData } from "@/lib/queries/coach";
import { UserCardGrid } from "@/components/coach/user-card-grid";

export default async function CoachDashboardPage() {
  const session = await requireAuth();
  const users = await getCoachDashboardData(session.userId);

  const totalUsers = users.length;
  const atRisk = users.filter((u) => u.riskLevel === "red").length;
  const moderate = users.filter((u) => u.riskLevel === "yellow").length;

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <div>
        <h1 className="font-heading text-[16px] text-primary">COMMUNITY</h1>
        <div className="flex items-center gap-4 mt-2">
          <span className="font-body text-[11px] text-text">
            {totalUsers} USERS
          </span>
          <span className="font-body text-[11px] text-danger">
            {atRisk} AT RISK
          </span>
          <span className="font-body text-[11px] text-accent">
            {moderate} MODERATE
          </span>
        </div>
      </div>

      {/* User grid */}
      <UserCardGrid users={users} />
    </div>
  );
}
