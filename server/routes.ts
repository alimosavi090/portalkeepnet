import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import {
  insertPlatformSchema,
  insertApplicationSchema,
  insertTutorialSchema,
  insertAnnouncementSchema,
} from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    adminId?: number;
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  if (!process.env.SESSION_SECRET) {
    console.warn("SESSION_SECRET not set, using fallback - this is insecure in production!");
  }
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "vpn-support-secret-key-dev-only",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post("/api/v1/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.adminId = admin.id;
      res.json({ id: admin.id, username: admin.username });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/v1/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/v1/auth/me", async (req, res) => {
    if (!req.session.adminId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const admin = await storage.getAdminById(req.session.adminId);
    if (!admin) {
      return res.status(401).json({ error: "Admin not found" });
    }
    res.json({ id: admin.id, username: admin.username });
  });

  app.patch("/api/v1/auth/username", requireAuth, async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }
      const admin = await storage.updateAdminUsername(req.session.adminId!, username);
      res.json({ id: admin?.id, username: admin?.username });
    } catch (error) {
      res.status(500).json({ error: "Failed to update username" });
    }
  });

  app.patch("/api/v1/auth/password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password are required" });
      }

      const admin = await storage.getAdminById(req.session.adminId!);
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      const validPassword = await bcrypt.compare(currentPassword, admin.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateAdminPassword(req.session.adminId!, hashedPassword);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update password" });
    }
  });

  app.get("/api/v1/platforms", async (req, res) => {
    try {
      const platformsList = await storage.getAllPlatforms();
      res.json(platformsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch platforms" });
    }
  });

  app.get("/api/v1/platforms/:id", async (req, res) => {
    try {
      const platform = await storage.getPlatformById(parseInt(req.params.id));
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      res.json(platform);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch platform" });
    }
  });

  app.post("/api/v1/platforms", requireAuth, async (req, res) => {
    try {
      const parsed = insertPlatformSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const platform = await storage.createPlatform(parsed.data);
      res.status(201).json(platform);
    } catch (error) {
      res.status(500).json({ error: "Failed to create platform" });
    }
  });

  app.patch("/api/v1/platforms/:id", requireAuth, async (req, res) => {
    try {
      const platform = await storage.updatePlatform(parseInt(req.params.id), req.body);
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      res.json(platform);
    } catch (error) {
      res.status(500).json({ error: "Failed to update platform" });
    }
  });

  app.delete("/api/v1/platforms/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePlatform(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete platform" });
    }
  });

  app.get("/api/v1/applications", async (req, res) => {
    try {
      const { platformId } = req.query;
      let apps;
      if (platformId) {
        apps = await storage.getApplicationsByPlatformId(parseInt(platformId as string));
      } else {
        apps = await storage.getAllApplications();
      }
      res.json(apps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.get("/api/v1/applications/:id", async (req, res) => {
    try {
      const application = await storage.getApplicationById(parseInt(req.params.id));
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch application" });
    }
  });

  app.post("/api/v1/applications", requireAuth, async (req, res) => {
    try {
      const parsed = insertApplicationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const application = await storage.createApplication(parsed.data);
      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to create application" });
    }
  });

  app.patch("/api/v1/applications/:id", requireAuth, async (req, res) => {
    try {
      const application = await storage.updateApplication(parseInt(req.params.id), req.body);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  app.delete("/api/v1/applications/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteApplication(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete application" });
    }
  });

  app.get("/api/v1/tutorials", async (req, res) => {
    try {
      const { category, platformId } = req.query;
      let tutorialsList;
      if (category) {
        tutorialsList = await storage.getTutorialsByCategory(category as string);
      } else if (platformId) {
        tutorialsList = await storage.getTutorialsByPlatformId(parseInt(platformId as string));
      } else {
        tutorialsList = await storage.getAllTutorials();
      }
      res.json(tutorialsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tutorials" });
    }
  });

  app.get("/api/v1/tutorials/:id", async (req, res) => {
    try {
      const tutorial = await storage.getTutorialById(parseInt(req.params.id));
      if (!tutorial) {
        return res.status(404).json({ error: "Tutorial not found" });
      }
      res.json(tutorial);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tutorial" });
    }
  });

  app.post("/api/v1/tutorials", requireAuth, async (req, res) => {
    try {
      const parsed = insertTutorialSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const tutorial = await storage.createTutorial(parsed.data);
      res.status(201).json(tutorial);
    } catch (error) {
      res.status(500).json({ error: "Failed to create tutorial" });
    }
  });

  app.patch("/api/v1/tutorials/:id", requireAuth, async (req, res) => {
    try {
      const tutorial = await storage.updateTutorial(parseInt(req.params.id), req.body);
      if (!tutorial) {
        return res.status(404).json({ error: "Tutorial not found" });
      }
      res.json(tutorial);
    } catch (error) {
      res.status(500).json({ error: "Failed to update tutorial" });
    }
  });

  app.delete("/api/v1/tutorials/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteTutorial(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tutorial" });
    }
  });

  app.get("/api/v1/announcements", async (req, res) => {
    try {
      const { active } = req.query;
      let announcementsList;
      if (active === "true") {
        announcementsList = await storage.getActiveAnnouncements();
      } else {
        announcementsList = await storage.getAllAnnouncements();
      }
      res.json(announcementsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  app.get("/api/v1/announcements/:id", async (req, res) => {
    try {
      const announcement = await storage.getAnnouncementById(parseInt(req.params.id));
      if (!announcement) {
        return res.status(404).json({ error: "Announcement not found" });
      }
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch announcement" });
    }
  });

  app.post("/api/v1/announcements", requireAuth, async (req, res) => {
    try {
      const parsed = insertAnnouncementSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const announcement = await storage.createAnnouncement(parsed.data);
      res.status(201).json(announcement);
    } catch (error) {
      res.status(500).json({ error: "Failed to create announcement" });
    }
  });

  app.patch("/api/v1/announcements/:id", requireAuth, async (req, res) => {
    try {
      const announcement = await storage.updateAnnouncement(parseInt(req.params.id), req.body);
      if (!announcement) {
        return res.status(404).json({ error: "Announcement not found" });
      }
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ error: "Failed to update announcement" });
    }
  });

  app.delete("/api/v1/announcements/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteAnnouncement(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete announcement" });
    }
  });

  app.post("/api/v1/seed-admin", async (req, res) => {
    try {
      const existingAdmin = await storage.getAdminByUsername("admin");
      if (existingAdmin) {
        return res.json({ message: "Admin already exists", id: existingAdmin.id });
      }
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = await storage.createAdmin({ username: "admin", password: hashedPassword });
      res.status(201).json({ message: "Admin created", id: admin.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed admin" });
    }
  });

  return httpServer;
}
