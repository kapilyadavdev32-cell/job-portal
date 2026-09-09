import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  emailVerificationContent,
  forgotPasswordContent,
  sendEmail,
} from "../utils/email.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { getAuthCookieOptions } from "../utils/cookies.js";

/** Public URL for the verify-email link (email + dev fallback). Prefer VERIFY_EMAIL_BASE_URL so links work behind Vite proxy. */
function buildEmailVerificationUrl(req, unHashedToken) {
  const base =
    process.env.VERIFY_EMAIL_BASE_URL?.replace(/\/+$/, "") ||
    process.env.API_PUBLIC_URL?.replace(/\/+$/, "");
  if (base) {
    return `${base}/api/v1/auth/verify-email/${unHashedToken}`;
  }
  return `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`;
}

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // attach refresh token to the user document to avoid refreshing the access token with multiple refresh tokens
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the access token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists", []);
  }
  const allowedRoles = ["jobseeker", "recruiter", "admin"];
  const userRole = allowedRoles.includes(role) ? role : "jobseeker";

  const user = await User.create({
    email,
    password,
    username,
    role: userRole,
    isEmailVerified: false,
  });

  /**
   * unHashedToken: unHashed token is something we will send to the user's mail
   * hashedToken: we will keep record of hashedToken to validate the unHashedToken in verify email controller
   * tokenExpiry: Expiry to be checked before validating the incoming token
   */
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  /**
   * assign hashedToken and tokenExpiry in DB till user clicks on email verification link
   * The email verification is handled by {@link verifyEmail}
   */
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const verificationUrl = buildEmailVerificationUrl(req, unHashedToken);

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    content: emailVerificationContent(user.username, verificationUrl),
  });

  if (process.env.NODE_ENV !== "production") {
    console.info(
      "\n[dev] If no verification email arrived, open this link once in your browser:\n" +
        verificationUrl +
        "\n",
    );
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "Users registered successfully and verification email has been sent on your email.",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email first");
  }

  // Compare the incoming password with hashed password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  // get the user document ignoring the password and refreshToken field
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  const cookieOpts = getAuthCookieOptions();

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOpts) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, cookieOpts) // set the refresh token in the cookie
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    { new: true },
  );

  const cookieOpts = getAuthCookieOptions();

  return res
    .status(200)
    .clearCookie("accessToken", cookieOpts)
    .clearCookie("refreshToken", cookieOpts)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const verificationToken = req.params.verificationToken || req.params.token;

  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is missing");
  }

  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    if (req.accepts("html") || req.headers["user-agent"]?.includes("Mozilla")) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Verification Failed</title><style>body{font-family:sans-serif;text-align:center;padding:50px;background:#f8fafc;} .card{background:white;padding:30px;border-radius:16px;max-width:500px;margin:auto;box-shadow:0 4px 6px rgba(0,0,0,0.05);}</style></head>
        <body>
          <div class="card">
            <h2 style="color:#e11d48">Link Expired or Invalid</h2>
            <p style="color:#475569">This verification link is invalid or has already expired. Please request a new verification email from the login page.</p>
          </div>
        </body>
        </html>
      `);
    }
    throw new ApiError(410, "Token is invalid or expired");
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  // If user clicked link in browser directly, show friendly HTML page with button to Sign In
  if (req.accepts("html") || req.headers["user-agent"]?.includes("Mozilla")) {
    const frontendUrl = process.env.CORS_ORIGIN?.split(",")[0] || "https://job-portal-dzq8.onrender.com";
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified Successfully</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 60px 20px; background: #f8fafc; color: #0f172a; }
          .card { background: white; padding: 40px; border-radius: 24px; max-width: 480px; margin: auto; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
          .icon { width: 64px; height: 64px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; font-weight: bold; }
          h2 { margin: 0 0 10px; font-size: 24px; font-weight: 800; color: #0f172a; }
          p { color: #64748b; font-size: 15px; margin-bottom: 25px; line-height: 1.5; }
          a { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; transition: background 0.2s; }
          a:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✓</div>
          <h2>Email Verified!</h2>
          <p>Your account email has been successfully verified. You can now sign in to your account.</p>
          <a href="${frontendUrl}/auth">Proceed to Sign In</a>
        </div>
      </body>
      </html>
    `);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { isEmailVerified: true }, "Email is verified"));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User does not exists", []);
  }

  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is already verified!");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const verificationUrl = buildEmailVerificationUrl(req, unHashedToken);

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    content: emailVerificationContent(user.username, verificationUrl),
  });

  if (process.env.NODE_ENV !== "production") {
    console.info("\n[dev] Resend — open this link if inbox is empty:\n" + verificationUrl + "\n");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Mail has been sent to your mail ID"));
});

const resendVerificationEmailPublic = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (user && !user.isEmailVerified) {
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    const verificationUrl = buildEmailVerificationUrl(req, unHashedToken);
    await sendEmail({
      email: user.email,
      subject: "Please verify your email",
      content: emailVerificationContent(user.username, verificationUrl),
    });

    if (process.env.NODE_ENV !== "production") {
      console.info("\n[dev] Public resend — open this link if inbox is empty:\n" + verificationUrl + "\n");
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "If that email exists and is not verified, a verification link has been sent.",
      ),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const cookieOpts = getAuthCookieOptions();

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOpts)
      .cookie("refreshToken", newRefreshToken, cookieOpts)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exists", []);
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Password reset request",
    content: forgotPasswordContent(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
    ),
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset mail has been sent on your mail id",
      ),
    );
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const resetToken = req.params.resetToken || req.body.resetToken;
  const { newPassword } = req.body;

  let hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(410, "Token is invalid or expired");
  }

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

export {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resendVerificationEmailPublic,
  resetForgottenPassword,
  verifyEmail,
  resendEmailVerification as resendVerificationEmail,
  resetForgottenPassword as resetPassword,
};
