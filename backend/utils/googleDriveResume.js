import { ApiError } from "./api-error.js";
import { saveResumeBuffer } from "../middlewares/upload.middleware.js";

const FILE_ID_PATTERN = /^[a-zA-Z0-9_-]{10,128}$/;
const MAX_BYTES = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20000;

function isGoogleDriveLink(raw) {
  try {
    const host = new URL(String(raw || "").trim()).hostname.toLowerCase();
    return host === "drive.google.com" || host === "docs.google.com";
  } catch {
    return false;
  }
}

function parseDriveLink(raw) {
  let parsed;
  try {
    parsed = new URL(String(raw || "").trim());
  } catch {
    throw new ApiError(400, "Enter a valid Google Drive or Google Docs link.");
  }

  const host = parsed.hostname.toLowerCase();
  if (host !== "drive.google.com" && host !== "docs.google.com") {
    throw new ApiError(400, "Only Google Drive or Google Docs links can be imported.");
  }

  const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) {
    return { id: fileMatch[1], kind: "file" };
  }

  const docMatch = parsed.pathname.match(/\/document\/d\/([^/]+)/);
  if (docMatch) {
    return { id: docMatch[1], kind: "document" };
  }

  const folderMatch = parsed.pathname.match(/\/folders\/([^/]+)/);
  if (folderMatch) {
    throw new ApiError(400, "Paste a link to the resume file, not a Drive folder.");
  }

  const id = parsed.searchParams.get("id");
  if (id) {
    return { id, kind: "file" };
  }

  throw new ApiError(400, "Could not find a file id in that Google Drive link.");
}

function assertFileId(id) {
  if (!FILE_ID_PATTERN.test(id)) {
    throw new ApiError(400, "That Google Drive link does not look valid.");
  }
}

function looksLikeHtml(buffer) {
  const start = buffer.subarray(0, 256).toString("utf8").trim().toLowerCase();
  return start.startsWith("<!doctype") || start.startsWith("<html");
}

function detectResumeKind(buffer, contentType = "", contentDisposition = "") {
  const type = contentType.toLowerCase();
  const name = contentDisposition.toLowerCase();

  if (buffer.subarray(0, 5).toString("utf8") === "%PDF-" || type.includes("pdf") || name.includes(".pdf")) {
    return { ext: ".pdf", originalName: "drive-resume.pdf" };
  }
  if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
    return { ext: ".docx", originalName: "drive-resume.docx" };
  }
  if (buffer[0] === 0xd0 && buffer[1] === 0xcf) {
    return { ext: ".doc", originalName: "drive-resume.doc" };
  }

  return null;
}

function filenameFromDisposition(header, fallback) {
  const match = String(header || "").match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
  if (!match) {
    return fallback;
  }
  try {
    return decodeURIComponent(match[1].replaceAll('"', "")).trim() || fallback;
  } catch {
    return fallback;
  }
}

function extractConfirmToken(html) {
  return html.match(/confirm=([0-9A-Za-z_-]+)/)?.[1] || "";
}

async function fetchDriveBuffer(url, cookieHeader = "") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "*/*",
        "User-Agent": "JobPortalResumeImport/1.0",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    const length = Number(response.headers.get("content-length") || 0);
    if (length > MAX_BYTES) {
      throw new ApiError(400, "The Drive file is larger than 5MB.");
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      throw new ApiError(400, "The Drive file is larger than 5MB.");
    }

    const setCookie =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie().join("; ")
        : response.headers.get("set-cookie") || "";

    return {
      ok: response.ok,
      buffer,
      contentType: response.headers.get("content-type") || "",
      contentDisposition: response.headers.get("content-disposition") || "",
      cookie: setCookie,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Downloads a publicly shared Google Drive file or Google Doc and stores it as a resume.
 * The item must be shared as "Anyone with the link".
 */
async function importResumeFromGoogleDrive(req, driveUrl) {
  const { id, kind } = parseDriveLink(driveUrl);
  assertFileId(id);

  const firstUrl =
    kind === "document"
      ? `https://docs.google.com/document/d/${id}/export?format=pdf`
      : `https://drive.google.com/uc?export=download&id=${id}`;

  let result = await fetchDriveBuffer(firstUrl);

  if (looksLikeHtml(result.buffer)) {
    const confirm = extractConfirmToken(result.buffer.toString("utf8"));
    if (confirm) {
      result = await fetchDriveBuffer(
        `https://drive.google.com/uc?export=download&confirm=${encodeURIComponent(confirm)}&id=${id}`,
        result.cookie,
      );
    }
  }

  if (!result.ok || looksLikeHtml(result.buffer)) {
    throw new ApiError(
      400,
      'Could not download that resume. Share the file as "Anyone with the link" (Viewer) and paste the file or Google Docs URL.',
    );
  }

  const kindInfo = detectResumeKind(result.buffer, result.contentType, result.contentDisposition);
  if (!kindInfo) {
    throw new ApiError(400, "The Drive file must be a PDF, DOC, DOCX, or a Google Doc.");
  }

  const originalName = filenameFromDisposition(result.contentDisposition, kindInfo.originalName);
  const withExt = originalName.toLowerCase().endsWith(kindInfo.ext)
    ? originalName
    : `${originalName}${kindInfo.ext}`;

  return saveResumeBuffer(req, result.buffer, withExt);
}

export { importResumeFromGoogleDrive, isGoogleDriveLink };
