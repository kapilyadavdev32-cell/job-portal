import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    resume: {
      url: String,
      localPath: String,
    },

    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Rejected", "Hired"],
      default: "Applied",
    },

    coverLetter: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Application = mongoose.model(
  "Application",
  applicationSchema
);
