import mongoose, { Schema } from "mongoose";

const CandidateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    party: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    voteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    color: {
      type: String,
      default: "#3b82f6",
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

const Candidate =
  mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);

export default Candidate;
