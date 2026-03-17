import mongoose, { Schema } from "mongoose";

const companySchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    logo: {
      type: {
        url: String,
        localPath: String,
      },
    },

    website: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);
