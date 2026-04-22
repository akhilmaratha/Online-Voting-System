import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

export async function PUT(req, { params }) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } =await params;
    const body = await req.json();

    await connectDB();

    const updated = await Candidate.findByIdAndUpdate(
      id,
      {
        name: body.name?.trim(),
        party: body.party?.trim(),
        bio: body.bio?.trim() || "",
        image: body.image?.trim() || "",
        color: body.color?.trim() || "#3b82f6",
      },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ message: "Candidate not found." }, { status: 404 });
    }

    return NextResponse.json({ candidate: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update candidate.", error: error.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } =await params;

    await connectDB();

    const deleted = await Candidate.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ message: "Candidate not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Candidate deleted." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete candidate.", error: error.message }, { status: 500 });
  }
}
