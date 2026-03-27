import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

// create new job (recruiter/admin)
const createJob = asyncHandler(async (req, res) => {
  const {
    company,
    title,
    description,
    skillsRequired,
    jobType,
    experienceLevel,
    salaryRange,
    location,
    isRemote,
    lastDateToApply,
  } = req.body;

  const comp = await Company.findById(company);
  if (!comp) throw new ApiError(404, "Company not found");

  // only company owner or admin can post
  if (
    req.user.role !== "admin" &&
    comp.owner.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Unauthorized to create job for this company");
  }

  const job = await Job.create({
    company,
    title,
    description,
    skillsRequired,
    jobType,
    experienceLevel,
    salaryRange,
    location,
    isRemote,
    lastDateToApply,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { job }, "Job created"));
});

const getJobs = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.company) filters.company = req.query.company;
  if (req.query.jobType) filters.jobType = req.query.jobType;
  if (req.query.experienceLevel)
    filters.experienceLevel = req.query.experienceLevel;
  if (req.query.isRemote) filters.isRemote = req.query.isRemote === "true";
  if (req.query.q && String(req.query.q).trim()) {
    filters.title = {
      $regex: String(req.query.q).trim(),
      $options: "i",
    };
  }

  const jobs = await Job.find(filters).populate("company");
  return res
    .status(200)
    .json(new ApiResponse(200, { jobs }, "Jobs fetched"));
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate("company");
  if (!job) throw new ApiError(404, "Job not found");
  return res
    .status(200)
    .json(new ApiResponse(200, { job }, "Job fetched"));
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, "Job not found");

  const comp = await Company.findById(job.company);
  if (
    req.user.role !== "admin" &&
    comp.owner.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Unauthorized");
  }

  Object.assign(job, req.body);
  const updated = await job.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { job: updated }, "Job updated"));
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, "Job not found");

  const comp = await Company.findById(job.company);
  if (
    req.user.role !== "admin" &&
    comp.owner.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Unauthorized");
  }

  await job.remove();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Job deleted"));
});

export { createJob, getJobs, getJobById, updateJob, deleteJob };
