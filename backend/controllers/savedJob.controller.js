import { SavedJob } from "../models/savedJob.model.js";
import { Job } from "../models/job.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const saveJob = asyncHandler(async (req, res) => {
  const { job: jobId } = req.body;
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found");

  const existing = await SavedJob.findOne({ job: jobId, user: req.user._id });
  if (existing) throw new ApiError(409, "Job already saved");

  const saved = await SavedJob.create({ job: jobId, user: req.user._id });
  return res
    .status(201)
    .json(new ApiResponse(201, { savedJob: saved }, "Job saved"));
});

const getSavedJobs = asyncHandler(async (req, res) => {
  const saved = await SavedJob.find({ user: req.user._id }).populate("job");
  return res
    .status(200)
    .json(new ApiResponse(200, { savedJobs: saved }, "Saved jobs fetched"));
});

const removeSavedJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const saved = await SavedJob.findById(id);
  if (!saved) throw new ApiError(404, "Saved job not found");
  if (saved.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }
  await saved.remove();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Saved job removed"));
});

export { saveJob, getSavedJobs, removeSavedJob };
