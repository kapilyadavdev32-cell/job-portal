import mongoose, { Schema } from "mongoose";

const savedJobSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

// prevent duplicate saved records
savedJobSchema.index({ job: 1, user: 1 }, { unique: true });

export const SavedJob = mongoose.model("SavedJob", savedJobSchema);
