import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const phoneRegex = /^[6-9]\d{9}$/;
const aadhaarRegex = /^\d{12}$/;
const voterIdRegex = /^[A-Z]{3}[0-9]{7}$/;

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function maskAadhaar(aadhaar) {
  return `XXXX-XXXX-${aadhaar.slice(-4)}`;
}

function maskVoterId(voterId) {
  return `${voterId.slice(0, 3)}***${voterId.slice(-4)}`;
}

export async function POST(req) {
  try {
    const { name, email, password, phone, aadhaar, voterId } = await req.json();

    if (!name || !email || !password || !phone || !aadhaar || !voterId) {
      return NextResponse.json(
        { message: "Name, email, password, phone, aadhaar and voter ID are required." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = String(phone).replace(/\D/g, "").slice(0, 10);
    const normalizedAadhaar = String(aadhaar).replace(/\D/g, "").slice(0, 12);
    const normalizedVoterId = String(voterId).trim().toUpperCase();

    if (!phoneRegex.test(normalizedPhone)) {
      return NextResponse.json({ message: "Phone number must be a valid 10-digit Indian mobile number." }, { status: 400 });
    }

    if (!aadhaarRegex.test(normalizedAadhaar)) {
      return NextResponse.json({ message: "Aadhaar must be exactly 12 digits." }, { status: 400 });
    }

    if (!voterIdRegex.test(normalizedVoterId)) {
      return NextResponse.json({ message: "Voter ID must match format ABC1234567." }, { status: 400 });
    }

    await connectDB();

    const aadhaarHash = sha256(normalizedAadhaar);
    const voterIdHash = sha256(normalizedVoterId);

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: normalizedPhone },
        { aadhaarHash },
        { voterIdHash },
      ],
    })
      .select("email phone aadhaarHash voterIdHash")
      .lean();

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return NextResponse.json({ message: "Email already exists." }, { status: 409 });
      }

      if (existingUser.phone === normalizedPhone) {
        return NextResponse.json({ message: "Phone number already exists." }, { status: 409 });
      }

      if (existingUser.aadhaarHash === aadhaarHash) {
        return NextResponse.json({ message: "Aadhaar number already exists." }, { status: 409 });
      }

      if (existingUser.voterIdHash === voterIdHash) {
        return NextResponse.json({ message: "Voter ID already exists." }, { status: 409 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const existingUsersCount = await User.countDocuments({});
    const assignedRole = existingUsersCount === 0 ? "admin" : "voter";
    const verifiedState = true;

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      aadhaarHash,
      aadhaarMasked: maskAadhaar(normalizedAadhaar),
      voterIdHash,
      voterIdMasked: maskVoterId(normalizedVoterId),
      password: hashedPassword,
      role: assignedRole,
      isVerified: verifiedState,
    });

    return NextResponse.json(
      {
        message:
          assignedRole === "admin"
            ? "Registration successful. First account promoted to admin."
            : "Registration successful. Your account is active now.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: assignedRole,
          isVerified: verifiedState,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      if (duplicateField === "email") {
        return NextResponse.json({ message: "Email already exists." }, { status: 409 });
      }

      if (duplicateField === "phone") {
        return NextResponse.json({ message: "Phone number already exists." }, { status: 409 });
      }

      if (duplicateField === "aadhaarHash") {
        return NextResponse.json({ message: "Aadhaar number already exists." }, { status: 409 });
      }

      if (duplicateField === "voterIdHash") {
        return NextResponse.json({ message: "Voter ID already exists." }, { status: 409 });
      }
    }

    return NextResponse.json({ message: "Registration failed.", error: error.message }, { status: 500 });
  }
}
