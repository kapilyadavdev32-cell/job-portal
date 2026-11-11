import { User } from "../models/user.model.js";
import { buildPublicFileUrl } from "../utils/publicUrl.js";
import { importResumeFromGoogleDrive } from "../utils/googleDriveResume.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const USER_PUBLIC_FIELDS =
  "-password -refreshToken -emailVerificationToken -emailVerificationExpiry";

function assertCanManageResume(user) {
  if (user.role !== "jobseeker") {
    throw new ApiError(403, "Only job seekers can save a resume");
  }
}

const getAllUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Unauthorized");
  }
  const users = await User.find().select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );
  return res
    .status(200)
    .json(new ApiResponse(200, { users }, "Users fetched"));
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "admin" && req.user._id.toString() !== id) {
    throw new ApiError(403, "Unauthorized");
  }
  const user = await User.findById(id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );
  if (!user) throw new ApiError(404, "User not found");
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User fetched"));
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "admin" && req.user._id.toString() !== id) {
    throw new ApiError(403, "Unauthorized");
  }
  const updates = req.body;
  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );
  if (!user) throw new ApiError(404, "User not found");
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User updated"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "admin" && req.user._id.toString() !== id) {
    throw new ApiError(403, "Unauthorized");
  }
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, "User not found");
  return res.status(200).json(new ApiResponse(200, {}, "User deleted"));
});

const uploadMyResume = asyncHandler(async (req, res) => {
  assertCanManageResume(req.user);
  if (!req.file) {
    throw new ApiError(400, "Resume file is required");
  }

  const relativePath = `uploads/resumes/${req.file.filename}`;
  const resume = {
    url: buildPublicFileUrl(req, relativePath),
    localPath: relativePath,
    originalName: req.file.originalname,
  };

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { resume } },
    { new: true, runValidators: true },
  ).select(USER_PUBLIC_FIELDS);

  return res
    .status(200)
    .json(new ApiResponse(200, { user, resume }, "Resume uploaded"));
});

const importMyResume = asyncHandler(async (req, res) => {
  assertCanManageResume(req.user);
  const resumeUrl = typeof req.body?.resumeUrl === "string" ? req.body.resumeUrl.trim() : "";
  if (!resumeUrl) {
    throw new ApiError(400, "A Google Drive or Google Docs link is required");
  }

  const resume = await importResumeFromGoogleDrive(req, resumeUrl);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { resume } },
    { new: true, runValidators: true },
  ).select(USER_PUBLIC_FIELDS);

  return res
    .status(200)
    .json(new ApiResponse(200, { user, resume }, "Resume imported from Google Drive"));
});

export { getAllUsers, getUserById, updateUser, deleteUser, uploadMyResume, importMyResume };
