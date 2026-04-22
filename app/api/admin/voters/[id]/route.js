import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function DELETE(_, { params }) {
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

    const voter = await User.findOne({ _id: id, role: "voter" }).lean();

    if (!voter) {
      return NextResponse.json({ message: "Voter not found." }, { status: 404 });
    }

    if (voter.isVerified) {
      return NextResponse.json({ message: "Only unverified voters can be deleted." }, { status: 400 });
    }

    await User.deleteOne({ _id: id });

    return NextResponse.json({ message: "Voter deleted." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete voter.", error: error.message }, { status: 500 });
  }
}
