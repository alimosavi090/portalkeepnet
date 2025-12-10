import { db } from "./db";
import { eq, asc, desc } from "drizzle-orm";
import {
  admins,
  platforms,
  applications,
  tutorials,
  announcements,
  type Admin,
  type InsertAdmin,
  type Platform,
  type InsertPlatform,
  type Application,
  type InsertApplication,
  type Tutorial,
  type InsertTutorial,
  type Announcement,
  type InsertAnnouncement,
} from "@shared/schema";

export interface IStorage {
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  getAdminById(id: number): Promise<Admin | undefined>;
  updateAdminUsername(id: number, username: string): Promise<Admin | undefined>;
  updateAdminPassword(id: number, password: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  getAllPlatforms(): Promise<Platform[]>;
  getPlatformById(id: number): Promise<Platform | undefined>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;
  updatePlatform(id: number, platform: Partial<InsertPlatform>): Promise<Platform | undefined>;
  deletePlatform(id: number): Promise<boolean>;

  getAllApplications(): Promise<Application[]>;
  getApplicationsByPlatformId(platformId: number): Promise<Application[]>;
  getApplicationById(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;

  getAllTutorials(): Promise<Tutorial[]>;
  getTutorialsByCategory(category: string): Promise<Tutorial[]>;
  getTutorialById(id: number): Promise<Tutorial | undefined>;
  createTutorial(tutorial: InsertTutorial): Promise<Tutorial>;
  updateTutorial(id: number, tutorial: Partial<InsertTutorial>): Promise<Tutorial | undefined>;
  deleteTutorial(id: number): Promise<boolean>;

  getAllAnnouncements(): Promise<Announcement[]>;
  getActiveAnnouncements(): Promise<Announcement[]>;
  getAnnouncementById(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }

  async getAdminById(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async updateAdminUsername(id: number, username: string): Promise<Admin | undefined> {
    const [admin] = await db.update(admins).set({ username }).where(eq(admins.id, id)).returning();
    return admin;
  }

  async updateAdminPassword(id: number, password: string): Promise<Admin | undefined> {
    const [admin] = await db.update(admins).set({ password }).where(eq(admins.id, id)).returning();
    return admin;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [newAdmin] = await db.insert(admins).values(admin).returning();
    return newAdmin;
  }

  async getAllPlatforms(): Promise<Platform[]> {
    return db.select().from(platforms).orderBy(asc(platforms.order), asc(platforms.id));
  }

  async getPlatformById(id: number): Promise<Platform | undefined> {
    const [platform] = await db.select().from(platforms).where(eq(platforms.id, id));
    return platform;
  }

  async createPlatform(platform: InsertPlatform): Promise<Platform> {
    const [newPlatform] = await db.insert(platforms).values(platform).returning();
    return newPlatform;
  }

  async updatePlatform(id: number, platform: Partial<InsertPlatform>): Promise<Platform | undefined> {
    const [updated] = await db.update(platforms).set(platform).where(eq(platforms.id, id)).returning();
    return updated;
  }

  async deletePlatform(id: number): Promise<boolean> {
    const result = await db.delete(platforms).where(eq(platforms.id, id));
    return true;
  }

  async getAllApplications(): Promise<Application[]> {
    return db.select().from(applications).orderBy(asc(applications.order), asc(applications.id));
  }

  async getApplicationsByPlatformId(platformId: number): Promise<Application[]> {
    return db.select().from(applications).where(eq(applications.platformId, platformId)).orderBy(asc(applications.order), asc(applications.id));
  }

  async getApplicationById(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application | undefined> {
    const [updated] = await db.update(applications).set(application).where(eq(applications.id, id)).returning();
    return updated;
  }

  async deleteApplication(id: number): Promise<boolean> {
    await db.delete(applications).where(eq(applications.id, id));
    return true;
  }

  async getAllTutorials(): Promise<Tutorial[]> {
    return db.select().from(tutorials).orderBy(asc(tutorials.order), asc(tutorials.id));
  }

  async getTutorialsByCategory(category: string): Promise<Tutorial[]> {
    return db.select().from(tutorials).where(eq(tutorials.category, category)).orderBy(asc(tutorials.order), asc(tutorials.id));
  }

  async getTutorialsByPlatformId(platformId: number): Promise<Tutorial[]> {
    return db.select().from(tutorials).where(eq(tutorials.platformId, platformId)).orderBy(asc(tutorials.order), asc(tutorials.id));
  }

  async getTutorialById(id: number): Promise<Tutorial | undefined> {
    const [tutorial] = await db.select().from(tutorials).where(eq(tutorials.id, id));
    return tutorial;
  }

  async createTutorial(tutorial: InsertTutorial): Promise<Tutorial> {
    const [newTutorial] = await db.insert(tutorials).values(tutorial).returning();
    return newTutorial;
  }

  async updateTutorial(id: number, tutorial: Partial<InsertTutorial>): Promise<Tutorial | undefined> {
    const [updated] = await db.update(tutorials).set(tutorial).where(eq(tutorials.id, id)).returning();
    return updated;
  }

  async deleteTutorial(id: number): Promise<boolean> {
    await db.delete(tutorials).where(eq(tutorials.id, id));
    return true;
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).where(eq(announcements.isActive, true)).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncementById(id: number): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }

  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const [updated] = await db.update(announcements).set({ ...announcement, updatedAt: new Date() }).where(eq(announcements.id, id)).returning();
    return updated;
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    await db.delete(announcements).where(eq(announcements.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
