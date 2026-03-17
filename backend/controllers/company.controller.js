import { Company } from "../models/company.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

// create a new company (only recruiter/admin)
const createCompany = asyncHandler(async (req, res) => {
  const {
    name,
    website,
    location,
    description,
    logo,
  } = req.body;

  const company = await Company.create({
    owner: req.user._id,
    name,
    website,
    location,
    description,
    logo,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { company }, "Company created"));
});

// fetch list of companies with optional filters
const getCompanies = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.owner) filters.owner = req.query.owner;
  if (req.query.isVerified !== undefined)
    filters.isVerified = req.query.isVerified === "true";

  const companies = await Company.find(filters);
  return res
    .status(200)
    .json(new ApiResponse(200, { companies }, "Companies fetched"));
});

const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, "Company not found");
  return res
    .status(200)
    .json(new ApiResponse(200, { company }, "Company fetched"));
});

const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, "Company not found");

  if (
    company.owner.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Unauthorized");
  }

  Object.assign(company, req.body);
  
  const updated = await company.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { company: updated }, "Company updated"));
});

const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, "Company not found");

  if (
    company.owner.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Unauthorized");
  }

  await company.remove();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Company deleted"));
});

const verifyCompany = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admins can verify companies");
  }

  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, "Company not found");

  company.isVerified = true;
  await company.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { company }, "Company verified"));
});

export {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  verifyCompany,
}; 