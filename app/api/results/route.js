import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";
import Vote from "@/models/Vote";

export async function GET() {
  try {
    await connectDB();

    const candidates = await Candidate.find({}).sort({ voteCount: -1 }).lean();
    const totalVotes = await Vote.countDocuments();

    const winner = candidates[0]
      ? {
          id: candidates[0]._id,
          name: candidates[0].name,
          party: candidates[0].party,
          votes: candidates[0].voteCount,
        }
      : null;

    return NextResponse.json(
      {
        candidates,
        totalVotes,
        winner,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch results.", error: error.message }, { status: 500 });
  }
}
