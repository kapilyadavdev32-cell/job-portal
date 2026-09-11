import { Resend } from "resend";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

let resendClient = null;

function getResendClient() {
  if (resendClient) return resendClient;
  
  const apiKey = process.env.RESEND_API_KEY;
  resendClient = new Resend(apiKey);
  return resendClient;
}

/**
 * @param {{email: string; subject: string; content: { text: string; html: string }}} options
 */
const sendEmail = async (options) => {
  try {
    const resend = getResendClient();
    
    // Resend requires verified sending domains. They give everyone 'onboarding@resend.dev' for sandbox testing.
    // If you add a custom domain to Resend later, you can use process.env.MAIL_FROM.
    const from = process.env.MAIL_FROM?.trim() || "onboarding@resend.dev";

    const { data, error } = await resend.emails.send({
      from,
      to: options.email,
      subject: options.subject,
      html: options.content?.html || "",
      text: options.content?.text || "",
    });

    if (error) {
      console.error("Resend API Error:", error);
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.info(`[email] Sent via Resend to ${options.email} | id=${data?.id}`);
      }
    }
  } catch (err) {
    console.error("Email send failed (user flow continues). Error details:");
    console.error(err);
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
