function buildPublicFileUrl(req, relativePath) {
  const cleanPath = String(relativePath || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
  const base = (
    process.env.API_PUBLIC_URL ||
    `${req.protocol}://${req.get("host")}`
  ).replace(/\/+$/, "");
  return `${base}/${cleanPath}`;
}

export { buildPublicFileUrl };
