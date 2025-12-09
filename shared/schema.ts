import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const admins = pgTable("admins", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const platforms = pgTable("platforms", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nameEn: text("name_en").notNull(),
  nameFa: text("name_fa").notNull(),
  icon: text("icon").notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  platformId: integer("platform_id").notNull().references(() => platforms.id, { onDelete: "cascade" }),
  nameEn: text("name_en").notNull(),
  nameFa: text("name_fa").notNull(),
  descriptionEn: text("description_en"),
  descriptionFa: text("description_fa"),
  downloadLink: text("download_link").notNull(),
  version: text("version"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tutorials = pgTable("tutorials", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: text("type").notNull().$type<"text" | "video">(),
  category: text("category").notNull().$type<"general" | "bot" | "troubleshooting">(),
  titleEn: text("title_en").notNull(),
  titleFa: text("title_fa").notNull(),
  contentEn: text("content_en"),
  contentFa: text("content_fa"),
  videoUrl: text("video_url"),
  platformId: integer("platform_id").references(() => platforms.id, { onDelete: "set null" }),
  appId: integer("app_id").references(() => applications.id, { onDelete: "set null" }),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const announcements = pgTable("announcements", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  titleEn: text("title_en").notNull(),
  titleFa: text("title_fa").notNull(),
  contentEn: text("content_en").notNull(),
  contentFa: text("content_fa").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const platformsRelations = relations(platforms, ({ many }) => ({
  applications: many(applications),
  tutorials: many(tutorials),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  platform: one(platforms, {
    fields: [applications.platformId],
    references: [platforms.id],
  }),
  tutorials: many(tutorials),
}));

export const tutorialsRelations = relations(tutorials, ({ one }) => ({
  platform: one(platforms, {
    fields: [tutorials.platformId],
    references: [platforms.id],
  }),
  application: one(applications, {
    fields: [tutorials.appId],
    references: [applications.id],
  }),
}));

export const insertAdminSchema = createInsertSchema(admins).omit({ id: true, createdAt: true });
export const insertPlatformSchema = createInsertSchema(platforms).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true });
export const insertTutorialSchema = createInsertSchema(tutorials).omit({ id: true, createdAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Platform = typeof platforms.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertTutorial = z.infer<typeof insertTutorialSchema>;
export type Tutorial = typeof tutorials.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;
