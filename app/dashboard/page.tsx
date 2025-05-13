"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  updated_at: string;
  language: string | null;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (status === "authenticated" && session) {
      fetchRepositories();
    }
  }, [status, session, router]);

  const fetchRepositories = async () => {
    try {
      // Get access token from session
      if (!session?.accessToken) {
        setError("No access token found. Please sign in again.");
        setLoading(false);
        return;
      }
      // Using the GitHub API with the access token from the session
      const response = await fetch("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }

      const data = await response.json();
      setRepositories(data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching repositories. Please try again.");
      setLoading(false);
      console.error(err);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="animate-pulse text-xl font-semibold text-gray-800 dark:text-gray-200">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <header className="mb-8 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          GitHub Repositories
        </h1>
        {session?.user && (
          <div className="flex items-center space-x-3">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full border border-gray-300 dark:border-gray-700"
              />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {session.user.name}
            </span>
          </div>
        )}
      </header>

      <main>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg border border-gray-200 dark:border-gray-800 p-4"
              >
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : repositories.length === 0 ? (
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No repositories found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repositories.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-gray-200 dark:border-gray-800 p-4 transition-all hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300">
                  {repo.name}
                </h2>
                {repo.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {repo.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {repo.language && (
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {repo.language}
                      </span>
                    )}
                    <div className="flex items-center space-x-1">
                      <svg
                        className="h-4 w-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                      </svg>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {repo.stargazers_count}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(repo.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
