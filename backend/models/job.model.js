import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    skillsRequired: {
      type: [String],
      index: true,
    },

    jobType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Internship", "Contract"],
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: ["Fresher", "Junior", "Mid", "Senior"],
      required: true,
    },

    salaryRange: {
      min: Number,
      max: Number,
    },

    location: {
      type: String,
      trim: true,
    },

    isRemote: {
      type: Boolean,
      default: false,
    },

    lastDateToApply: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
