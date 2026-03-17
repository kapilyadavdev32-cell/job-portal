import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

// jobseeker submits application
const applyToJob = asyncHandler(async (req, res) => {
  const { job: jobId, resume, coverLetter } = req.body;
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found");

  const already = await Application.findOne({ job: jobId, applicant: req.user._id });
  if (already) throw new ApiError(409, "Already applied to this job");

  const application = await Application.create({
    job: jobId,
    applicant: req.user._id,
    resume,
    coverLetter,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { application }, "Application submitted"));
});

const getApplications = asyncHandler(async (req, res) => {
  let applications;
  if (req.user.role === "recruiter") {
    // only show applications for jobs belonging to companies owned by recruiter
    const companies = await Company.find({ owner: req.user._id }).select("_id");
    const jobs = await Job.find({ company: { $in: companies.map((c) => c._id) } }).select("_id");
    applications = await Application.find({ job: { $in: jobs.map((j) => j._id) } })
      .populate("job")
      .populate("applicant");
  } else if (req.user.role === "admin") {
    applications = await Application.find().populate("job").populate("applicant");
  } else {
    applications = await Application.find({ applicant: req.user._id }).populate("job");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { applications }, "Applications fetched"));
});

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("job")
    .populate("applicant");
  if (!application) throw new ApiError(404, "Application not found");

  if (req.user.role === "jobseeker" && application.applicant._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }
  if (req.user.role === "recruiter") {
    const company = await Company.findById(application.job.company);
    if (company.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Unauthorized");
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { application }, "Application fetched"));
});

const updateApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, "Application not found");

  if (req.user.role === "recruiter") {
    const job = await Job.findById(application.job);
    const company = await Company.findById(job.company);
    if (company.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Unauthorized");
    }
  } else if (req.user.role === "jobseeker") {
    if (application.applicant.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Unauthorized");
    }
  } else if (req.user.role !== "admin") {
    throw new ApiError(403, "Unauthorized");
  }

  Object.assign(application, req.body);
  const updated = await application.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { application: updated }, "Application updated"));
});

const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, "Application not found");

  if (req.user.role === "jobseeker") {
    if (application.applicant.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Unauthorized");
    }
  } else if (req.user.role === "recruiter") {
    const job = await Job.findById(application.job);
    const company = await Company.findById(job.company);
    if (company.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Unauthorized");
    }
  } else if (req.user.role !== "admin") {
    throw new ApiError(403, "Unauthorized");
  }

  await application.remove();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Application deleted"));
});

export { applyToJob, getApplications, getApplicationById, updateApplication, deleteApplication };
