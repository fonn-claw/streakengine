import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface SessionData {
  userId: number;
  role: "player" | "coach";
  displayName: string;
  isLoggedIn: boolean;
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "streakengine-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days -- always-remember for demo
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/login");
  }
  return session;
}
