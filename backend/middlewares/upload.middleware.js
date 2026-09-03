import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve("public", "uploads", "resumes");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safeBase = path
      .parse(file.originalname || "resume")
      .name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "resume";
    const ext = (path.extname(file.originalname || "").toLowerCase() || ".pdf").slice(0, 10);
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowedMimeTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);

  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Resume must be a PDF, DOC, or DOCX file."));
}

const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export { uploadResume };
