import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Vote from "@/models/Vote";
import Candidate from "@/models/Candidate";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [totalVoters, votesCast, leadingCandidate] = await Promise.all([
      User.countDocuments({ role: "voter" }),
      Vote.countDocuments(),
      Candidate.findOne({}).sort({ voteCount: -1 }).lean(),
    ]);

    const turnout = totalVoters > 0 ? (votesCast / totalVoters) * 100 : 0;

    return NextResponse.json(
      {
        totalVoters,
        votesCast,
        turnout,
        leadingCandidate: leadingCandidate
          ? {
              name: leadingCandidate.name,
              party: leadingCandidate.party,
              voteCount: leadingCandidate.voteCount,
            }
          : null,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch admin stats.", error: error.message }, { status: 500 });
  }
}
