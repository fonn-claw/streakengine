import { relations } from "drizzle-orm";
import {
  users,
  habitLogs,
  streaks,
  userAchievements,
  friendships,
  challengeParticipants,
  challenges,
  habits,
  achievements,
  nudges,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  habitLogs: many(habitLogs),
  streaks: many(streaks),
  userAchievements: many(userAchievements),
  friendships: many(friendships),
  challengeParticipants: many(challengeParticipants),
}));

export const habitsRelations = relations(habits, ({ many }) => ({
  habitLogs: many(habitLogs),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  user: one(users, {
    fields: [habitLogs.userId],
    references: [users.id],
  }),
  habit: one(habits, {
    fields: [habitLogs.habitId],
    references: [habits.id],
  }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, {
    fields: [streaks.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(
  userAchievements,
  ({ one }) => ({
    user: one(users, {
      fields: [userAchievements.userId],
      references: [users.id],
    }),
    achievement: one(achievements, {
      fields: [userAchievements.achievementId],
      references: [achievements.id],
    }),
  })
);

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user: one(users, {
    fields: [friendships.userId],
    references: [users.id],
    relationName: "user",
  }),
  friend: one(users, {
    fields: [friendships.friendId],
    references: [users.id],
    relationName: "friend",
  }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  participants: many(challengeParticipants),
}));

export const challengeParticipantsRelations = relations(
  challengeParticipants,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeParticipants.challengeId],
      references: [challenges.id],
    }),
    user: one(users, {
      fields: [challengeParticipants.userId],
      references: [users.id],
    }),
  })
);

export const nudgesRelations = relations(nudges, ({ one }) => ({
  sender: one(users, {
    fields: [nudges.senderId],
    references: [users.id],
    relationName: "nudgeSender",
  }),
  recipient: one(users, {
    fields: [nudges.recipientId],
    references: [users.id],
    relationName: "nudgeRecipient",
  }),
}));
