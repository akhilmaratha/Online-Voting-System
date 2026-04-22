import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PATCH(_, { params }) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } =await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid voter id." }, { status: 400 });
    }

    await connectDB();

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "voter" },
      { $set: { isVerified: true } },
      { new: true },
    )
      .select("name email phone voterIdMasked aadhaarMasked isVerified hasVoted")
      .lean();

    if (!updated) {
      return NextResponse.json({ message: "Voter not found." }, { status: 404 });
    }

    return NextResponse.json({ voter: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to verify voter.", error: error.message }, { status: 500 });
  }
}
