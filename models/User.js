import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: /^[6-9]\d{9}$/,
    },
    aadhaarHash: {
      type: String,
      required: true,
      unique: true,
      minlength: 64,
      maxlength: 64,
      select: false,
    },
    aadhaarMasked: {
      type: String,
      required: true,
    },
    voterIdHash: {
      type: String,
      required: true,
      unique: true,
      minlength: 64,
      maxlength: 64,
      select: false,
    },
    voterIdMasked: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["voter", "admin"],
      default: "voter",
    },
    hasVoted: {
      type: Boolean,
      default: false,
    },
    votedFor: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true });
UserSchema.index({ aadhaarHash: 1 }, { unique: true });
UserSchema.index({ voterIdHash: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
