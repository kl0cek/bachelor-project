import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const uploadsDir = path.join(process.cwd(), 'uploads', 'activities');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitized = basename.replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${sanitized}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

export const uploadPDF = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(process.cwd(), filePath);
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error deleting file:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
