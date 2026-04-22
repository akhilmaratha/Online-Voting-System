import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";
import User from "@/models/User";
import Vote from "@/models/Vote";

export async function POST(req) {
  const userSession = await auth();

  if (!userSession?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (userSession.user.role !== "voter") {
    return NextResponse.json({ message: "Only voters can cast votes." }, { status: 403 });
  }

  try {
    const { candidateId } = await req.json();

    if (!candidateId) {
      return NextResponse.json({ message: "Candidate is required." }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return NextResponse.json({ message: "Invalid candidate id." }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userSession.user.id).lean();

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (user.hasVoted) {
      return NextResponse.json({ message: "You have already voted." }, { status: 409 });
    }

    const dbSession = await mongoose.startSession();

    try {
      let voteDoc = null;

      await dbSession.withTransaction(async () => {
        const alreadyVoted = await Vote.findOne({ voterId: user._id }).session(dbSession).lean();

        if (alreadyVoted) {
          throw new Error("DUPLICATE_VOTE");
        }

        const candidate = await Candidate.findById(candidateId).session(dbSession);

        if (!candidate) {
          throw new Error("CANDIDATE_NOT_FOUND");
        }

        voteDoc = await Vote.create(
          [
            {
              voterId: user._id,
              candidateId,
            },
          ],
          { session: dbSession },
        );

        await Candidate.updateOne(
          { _id: candidateId },
          { $inc: { voteCount: 1 } },
          { session: dbSession },
        );

        await User.updateOne(
          { _id: user._id },
          { $set: { hasVoted: true, votedFor: candidateId } },
          { session: dbSession },
        );
      });

      return NextResponse.json(
        {
          message: "Vote submitted successfully.",
          voteId: voteDoc?.[0]?._id?.toString(),
        },
        { status: 200 },
      );
    } catch (error) {
      if (error.message === "DUPLICATE_VOTE") {
        return NextResponse.json({ message: "Duplicate vote blocked." }, { status: 409 });
      }

      if (error.message === "CANDIDATE_NOT_FOUND") {
        return NextResponse.json({ message: "Candidate not found." }, { status: 404 });
      }

      if (error?.code === 11000) {
        return NextResponse.json({ message: "Duplicate vote blocked." }, { status: 409 });
      }

      const txUnsupported =
        typeof error?.message === "string" &&
        (error.message.includes("Transaction numbers are only allowed on a replica set member or mongos") ||
          error.message.includes("transaction") && error.message.includes("replica set"));

      if (txUnsupported) {
        return NextResponse.json(
          {
            message:
              "Voting transaction is not supported by your MongoDB deployment. Use a replica set (or Atlas) to enable atomic voting.",
          },
          { status: 503 },
        );
      }

      throw error;
    } finally {
      await dbSession.endSession();
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to cast vote.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
