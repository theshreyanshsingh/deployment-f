import "next-auth";
import "next-auth/providers/github";

// Extending the GitHubProfile type
declare module "next-auth" {
  interface Session {
    username?: string;
    accessToken?: string;
  }

  interface User {
    username?: string;
  }

  // Extending GitHubProfile with 'login' field
  interface GitHubProfile {
    login: string; // GitHub username (login)
  }
}
