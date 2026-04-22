import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        await connectDB();
        const user = await User.findOne({ email }).lean();

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          hasVoted: user.hasVoted,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role;
        token.hasVoted = user.hasVoted;
        token.isVerified = user.isVerified;
      }

      if (trigger === "update" && token?.email) {
        await connectDB();
        const freshUser = await User.findOne({ email: token.email }).lean();
        if (freshUser) {
          token.role = freshUser.role;
          token.hasVoted = freshUser.hasVoted;
          token.isVerified = freshUser.isVerified;
          token.name = freshUser.name;
          token.sub = freshUser._id.toString();
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.hasVoted = Boolean(token.hasVoted);
        session.user.isVerified = Boolean(token.isVerified);
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
