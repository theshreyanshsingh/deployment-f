"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";

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
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session) fetchRepositories();
  }, [status, session, router]);

  const fetchRepositories = async () => {
    try {
      if (!session?.accessToken) {
        setError("No access token found. Please sign in again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://api.github.com/user/repos?per_page=100",
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch repositories");

      const data = await response.json();

      setRepositories(data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching repositories. Please try again.");
      setLoading(false);
      console.error(err);
    }
  };

  const handleDeploy = async () => {
    if (!selectedRepo || !selectedCategory || !session || isDeploying) {
      alert("Please select both a repository and a deployment type.");
      return;
    }

    setIsDeploying(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/project`,
        {
          repo: selectedRepo,
          category: selectedCategory,
          owner: session.username,
          accessToken: session.accessToken,
        },
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );

      setIsDeploying(false);
    } catch (err) {
      setError("Error deploying repository. Please try again.");
      setIsDeploying(false);
      console.error(err);
    }
    console.log(selectedRepo, selectedCategory, session.user?.email);

    // Simulate deployment process

    setIsDeploying(false);
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="flex justify-end p-4">
        {session?.user && (
          <div className="flex items-center">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt="Profile"
                width={30}
                height={30}
                className="rounded-full"
              />
            )}
            <span className="mx-2 text-sm">{session.user.name}</span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-400 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-center text-3xl font-bold">Nearzero deploy</h1>

        {/* Section 1: What would you like to deploy? */}
        <div className="mb-12">
          <h2 className="mb-6 text-center text-xl font-medium">
            What would you like to deploy?
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedCategory("Static Site")}
              className={`${
                selectedCategory === "Static Site"
                  ? "border-white bg-white text-black"
                  : "border-gray-700 bg-black text-white hover:border-white"
              } border p-4 rounded-md text-center transition-colors`}
            >
              Static Site
            </button>

            <button
              disabled
              onClick={() => setSelectedCategory("Dynamic Site")}
              className={`${
                selectedCategory === "Dynamic Site"
                  ? "border-white bg-white text-black"
                  : "border-gray-700 bg-black text-white hover:border-white"
              } border p-4 rounded-md text-center transition-colors relative`}
            >
              Dynamic Site
              <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-white text-black text-xs px-1 rounded">
                Coming Soon
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory("Backend")}
              className={`${
                selectedCategory === "Backend"
                  ? "border-white bg-white text-black"
                  : "border-gray-700 bg-black text-white hover:border-white"
              } border p-4 rounded-md text-center transition-colors`}
            >
              Backend
            </button>

            <button
              disabled
              onClick={() => setSelectedCategory("Services")}
              className={`${
                selectedCategory === "Services"
                  ? "border-white bg-white text-black"
                  : "border-gray-700 bg-black text-white hover:border-white"
              } border p-4 rounded-md text-center transition-colors relative`}
            >
              Services
              <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-white text-black text-xs px-1 rounded">
                Coming Soon
              </span>
            </button>
          </div>
        </div>

        {/* Section 2: Repository List */}
        <div className="mb-12">
          <h2 className="mb-6 text-center text-xl font-medium">
            Select Repository
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-red-400 text-center">{error}</div>
          ) : repositories.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No repositories found
            </div>
          ) : (
            <select
              value={selectedRepo}
              onChange={(e) => {
                setSelectedRepo(e.target.value);
              }}
              className="w-full p-4 border border-gray-700 bg-black rounded-md focus:outline-none focus:border-white"
            >
              <option value="">Select a repository</option>
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.name}>
                  {repo.name}
                </option>
              ))}
            </select>
          )}

          <div className="mt-4">
            <div className="flex items-center justify-center">
              <span className="text-gray-400">or</span>
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter public repository URL"
                className="w-full p-4 border border-gray-700 bg-black rounded-md focus:outline-none focus:border-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Deploy Button */}
        <div className="text-center">
          <button
            onClick={handleDeploy}
            disabled={!selectedRepo || !selectedCategory || isDeploying}
            className={`w-full p-4 rounded-md font-bold ${
              !selectedRepo || !selectedCategory || isDeploying
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            {isDeploying ? (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-black mr-2"></div>
                Deploying...
              </div>
            ) : (
              "Deploy"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
