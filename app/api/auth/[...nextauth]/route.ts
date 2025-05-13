// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

// import { API } from "@/app/helpers/config";
// interface SessionUser {
//   id?: string;
//   name?: string | null | undefined;
//   email?: string | null | undefined;
//   image?: string | null | undefined;
//   plan?: string;
//   sessionId?: string;
// }

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
  debug: true,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        // Optionally add more user info to token if needed
      }
      if (account && account.provider === "github" && account.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass the access token to the client
      return {
        ...session,
        accessToken: token.accessToken,
      };
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

export { handler as GET, handler as POST };
