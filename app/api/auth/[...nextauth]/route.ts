import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import type { Profile } from "next-auth";

// Define our custom GitHub profile properties we need
interface GitHubProfile extends Profile {
  login: string;
}

// Extend the Session type to include our custom properties
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    username?: string;
  }
}

// Extend the JWT type to include our custom properties
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    username?: string;
  }
}

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET || "",
      authorization: { params: { scope: "read:user repo admin:repo_hook" } },
    }),
  ],
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      // Type assertion for GitHub-specific profile properties
      const githubProfile = profile as GitHubProfile | undefined;
      if (githubProfile?.login) {
        token.username = githubProfile.login;
      }

      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.username = token.username;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
