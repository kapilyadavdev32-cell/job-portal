import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";




const getAllUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admins can access this resource");
  }
  const users = await User.find().select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, { users }, "All users fetched"));
});

const getAllCompanies = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admins can access this resource");
  }
  const companies = await Company.find();
  return res
    .status(200)
    .json(new ApiResponse(200, { companies }, "All companies fetched"));
});

const verifyCompany = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admins can perform this action");
  }
  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, "Company not found");
  company.isVerified = true;
  await company.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { company }, "Company verified"));
});

const changeUserRole = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admins can perform this action");
  }
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  user.role = role;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User role updated"));
});

export { getAllUsers, getAllCompanies, verifyCompany, changeUserRole };
