import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";

export async function GET() {
  try {
    await connectDB();
    const candidates = await Candidate.find({}).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ candidates }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch candidates.", error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, party, bio, image, color } = await req.json();

    if (!name || !party) {
      return NextResponse.json({ message: "Name and party are required." }, { status: 400 });
    }

    await connectDB();

    const created = await Candidate.create({
      name: name.trim(),
      party: party.trim(),
      bio: bio?.trim() || "",
      image: image?.trim() || "",
      color: color?.trim() || "#3b82f6",
    });

    return NextResponse.json({ candidate: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create candidate.", error: error.message }, { status: 500 });
  }
}
