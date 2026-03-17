import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

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

export { getAllUsers, getUserById, updateUser, deleteUser };
