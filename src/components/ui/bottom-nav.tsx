"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { label: "Home", href: "/", icon: "/assets/icon-flame.svg" },
  { label: "Quests", href: "/quests", icon: "/assets/icon-sword.svg" },
  { label: "Friends", href: "/friends", icon: "/assets/icon-people.svg" },
  { label: "Profile", href: "/profile", icon: "/assets/icon-shield.svg" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t-3 border-border md:hidden">
      <div className="flex items-center justify-around h-16">
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
                "flex flex-col items-center gap-1 px-3 py-2 relative",
                isActive ? "opacity-100" : "opacity-50"
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
                  "font-body text-[10px]",
                  isActive ? "text-primary" : "text-text-dim"
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
