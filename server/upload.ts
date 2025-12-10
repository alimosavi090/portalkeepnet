import multer from "multer";
import path from "path";
import { Request } from "express";
import crypto from "crypto";
import fs from "fs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880"); // 5MB default

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-randomhex-originalname
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, "_");
        cb(null, `${uniqueSuffix}-${sanitizedBasename}${ext}`);
    },
});

// File filter - only allow images
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."));
    }
};

// Create multer instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

// Helper function to delete file
export function deleteFile(filename: string): boolean {
    try {
        const filePath = path.join(UPLOAD_DIR, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error deleting file:", error);
        return false;
    }
}

// Helper function to delete multiple files
export function deleteFiles(filenames: string[]): void {
    filenames.forEach((filename) => deleteFile(filename));
}

// Get file URL
export function getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
}
