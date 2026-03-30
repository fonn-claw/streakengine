"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { logout } from "@/lib/actions/auth";

const tabs = [
  { label: "Home", href: "/", icon: "/assets/icon-flame.svg" },
  { label: "Quests", href: "/quests", icon: "/assets/icon-sword.svg" },
  { label: "Friends", href: "/friends", icon: "/assets/icon-people.svg" },
  { label: "Profile", href: "/profile", icon: "/assets/icon-shield.svg" },
] as const;

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:block bg-surface border-b-3 border-border">
      <div className="max-w-[720px] mx-auto px-4 flex items-center h-14">
        {/* Logo */}
        <Link href="/" className="shrink-0 mr-8">
          <img src="/assets/logo.svg" alt="StreakEngine" height={32} className="h-8" />
        </Link>

        {/* Tabs */}
        <div className="flex items-center gap-6 flex-1">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "flex items-center gap-2 py-4 relative",
                  isActive ? "opacity-100" : "opacity-60 hover:opacity-80"
                )}
              >
                <img
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className={clsx(
                    isActive ? "brightness-100" : "brightness-50"
                  )}
                />
                <span
                  className={clsx(
                    "font-body text-[12px]",
                    isActive ? "text-primary" : "text-text-dim"
                  )}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Logout */}
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
  );
}

export default TopNav;
