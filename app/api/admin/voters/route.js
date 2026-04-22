import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const status = req.nextUrl.searchParams.get("status") || "all";
    const query = { role: "voter" };

    if (status === "pending") {
      query.isVerified = false;
    }

    if (status === "verified") {
      query.isVerified = true;
    }

    const voters = await User.find(query)
      .select("name email phone voterIdMasked aadhaarMasked isVerified hasVoted createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ voters }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch voters.", error: error.message }, { status: 500 });
  }
}
