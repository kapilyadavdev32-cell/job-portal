import nodemailer from "nodemailer";
import dns from "dns/promises";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function buildTransporter() {
  // Optional custom SMTP transport (kept for compatibility).
  if (process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim()) {
    const port = Number.parseInt(String(process.env.SMTP_PORT || "587"), 10);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port: Number.isFinite(port) ? port : 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || "",
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
  }

  // Default transport: Gmail with App Password.
  if (!process.env.GMAIL_USER?.trim() || !process.env.GMAIL_APP_PASSWORD?.trim()) {
    throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD in backend/.env");
  }

  // FORCE IPv4 by manually looking up the IP address.
  // This bypasses Node.js connecting to IPv6 on Render (ENETUNREACH bug).
  const lookup = await dns.lookup("smtp.gmail.com", { family: 4 });

  return nodemailer.createTransport({
    host: lookup.address, // Explicit IPv4 address 
    port: 587,
    secure: false, // STARTTLS
    tls: {
      servername: "smtp.gmail.com", // Ensure TLS verifies the correct hostname
    },
    auth: {
      user: process.env.GMAIL_USER.trim(),
      pass: process.env.GMAIL_APP_PASSWORD.trim(),
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });
}

function getMailerProviderName() {
  if (process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim()) {
    return "SMTP";
  }
  return "Gmail";
}

/**
 * @param {{email: string; subject: string; content: { text: string; html: string }}} options
 */
const sendEmail = async (options) => {
  try {
    const transporter = await buildTransporter(); // awaits the async dns lookup
    const from =
      process.env.MAIL_FROM?.trim() ||
      `Job Portal <${(process.env.GMAIL_USER || "noreply@example.com").trim()}>`;

    const info = await transporter.sendMail({
      from,
      to: options.email,
      subject: options.subject,
      text: options.content?.text || "",
      html: options.content?.html || "",
    });

    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[email] Sent via ${getMailerProviderName()} to ${options.email} | subject="${options.subject}" | messageId=${info?.messageId || "n/a"}`,
      );
    }
  } catch (error) {
    console.error(
      "Email send failed (user flow continues). Set GMAIL_USER + GMAIL_APP_PASSWORD (or SMTP_*) and MAIL_FROM in backend/.env.",
    );
    console.error(error);
  }
};

function createEmailShell(title, intro, actionText, actionLink, outro) {
  const safeTitle = escapeHtml(title);
  const safeIntro = escapeHtml(intro);
  const safeActionText = escapeHtml(actionText);
  const safeOutro = escapeHtml(outro);
  const safeActionLink = escapeHtml(actionLink);

  return {
    text: `${title}\n\n${intro}\n\n${actionText}: ${actionLink}\n\n${outro}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:600px;margin:0 auto;">
        <h2 style="margin-bottom:12px;">${safeTitle}</h2>
        <p style="margin:0 0 16px;">${safeIntro}</p>
        <p style="margin:0 0 20px;">
          <a href="${safeActionLink}" style="background:#22BC66;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;display:inline-block;">
            ${safeActionText}
          </a>
        </p>
        <p style="margin:0;">${safeOutro}</p>
      </div>
    `,
  };
}

/**
 * @param {string} username
 * @param {string} verificationUrl
 * @returns {{ text: string; html: string }}
 */
const emailVerificationContent = (username, verificationUrl) => {
  const safeUser = escapeHtml(username || "there");
  return createEmailShell(
    `Hi ${safeUser}, verify your email`,
    "Welcome to Job Portal. Please verify your email to activate your account.",
    "Verify your email",
    verificationUrl,
    "Need help? Reply to this email and we will assist you.",
  );
};

/**
 * @param {string} username
 * @param {string} passwordResetUrl
 * @returns {{ text: string; html: string }}
 */
const forgotPasswordContent = (username, passwordResetUrl) => {
  const safeUser = escapeHtml(username || "there");
  return createEmailShell(
    `Hi ${safeUser}, reset your password`,
    "We received a request to reset your account password.",
    "Reset password",
    passwordResetUrl,
    "If you did not request this, you can safely ignore this email.",
  );
};

export { emailVerificationContent, forgotPasswordContent, sendEmail };
