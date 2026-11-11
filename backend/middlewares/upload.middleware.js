import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";
import { ApiError } from "../utils/api-error.js";
import { buildPublicFileUrl } from "../utils/publicUrl.js";

const uploadDir = path.resolve("public", "uploads", "resumes");
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
]);

function sanitizeResumeName(originalName) {
  const parsed = path.parse(originalName || "resume");
  const safeBase =
    parsed.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "resume";
  const ext = (parsed.ext || ".pdf").toLowerCase().slice(0, 10);
  return { safeBase, ext: ALLOWED_EXTENSIONS.has(ext) ? ext : ".pdf" };
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const { safeBase, ext } = sanitizeResumeName(file.originalname);
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext) && ALLOWED_MIME_TYPES.has(file.mimetype)) {
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

function saveResumeBuffer(req, buffer, originalName) {
  const { safeBase, ext } = sanitizeResumeName(originalName);
  if (!buffer?.length) {
    throw new ApiError(400, "The Drive file was empty.");
  }
  if (buffer.length > 5 * 1024 * 1024) {
    throw new ApiError(400, "Resume must be 5MB or smaller.");
  }

  const filename = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${safeBase}${ext}`;
  const relativePath = `uploads/resumes/${filename}`;
  fs.writeFileSync(path.join(uploadDir, filename), buffer);

  return {
    url: buildPublicFileUrl(req, relativePath),
    localPath: relativePath,
    originalName: originalName || `drive-resume${ext}`,
  };
}

export { uploadResume, saveResumeBuffer, ALLOWED_EXTENSIONS };
