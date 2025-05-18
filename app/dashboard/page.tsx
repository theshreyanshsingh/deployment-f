"use client";

import { signOut, useSession } from "next-auth/react";
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

interface EnvVariable {
  key: string;
  value: string;
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
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>([]);
  const [envKey, setEnvKey] = useState("");
  const [envValue, setEnvValue] = useState("");

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

  const addEnvVariable = () => {
    if (envKey.trim() === "") return;

    setEnvVariables([...envVariables, { key: envKey, value: envValue }]);
    setEnvKey("");
    setEnvValue("");
  };

  const removeEnvVariable = (index: number) => {
    const updatedVars = [...envVariables];
    updatedVars.splice(index, 1);
    setEnvVariables(updatedVars);
  };

  const updateEnvVariable = (index: number, key: string, value: string) => {
    const updatedVars = [...envVariables];
    updatedVars[index] = { key, value };
    setEnvVariables(updatedVars);
  };

  const handleEnvPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");

    if (!pastedText.trim()) return;

    // Process pasted content line by line
    const lines = pastedText.split(/\n/);
    const newVars: EnvVariable[] = [];

    lines.forEach((line) => {
      // Skip empty lines
      if (!line.trim()) return;

      // Handle commented lines (lines starting with #)
      let processLine = line.trim();
      const isCommented = processLine.startsWith("#");
      if (isCommented) {
        processLine = processLine.substring(1).trim();
      }

      // Try to split by common separators (=, :, space)
      const match = processLine.match(/^\s*([^=:\s]+)\s*[=:\s]\s*(.*)\s*$/);
      if (match && match.length >= 3) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove wrapping quotes
        value = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

        if (value.includes("`")) {
          const backtickMatch = value.match(/\s*`([^`]*)`\s*/);
          if (backtickMatch && backtickMatch.length > 1) {
            value = backtickMatch[1].trim();
          } else {
            value = value.replace(/`/g, "").trim();
          }
        }

        newVars.push({ key, value });
      }
    });

    if (newVars.length > 0) {
      setEnvVariables([...envVariables, ...newVars]);
      setEnvKey("");
      setEnvValue("");
    }
  };

  const handleDeploy = async () => {
    if (!selectedRepo || !selectedCategory || !session || isDeploying) {
      alert("Please select both a repository and a deployment type.");
      return;
    }

    setIsDeploying(true);

    try {
      // Format environment variables according to the required schema
      const formattedEnvVariables = envVariables.reduce(
        (acc, { key, value }) => {
          acc[key] = value;

          return acc;
        },
        {} as Record<string, string>
      );

      console.log("Actual formatted variables:", formattedEnvVariables);

      // Uncomment this when ready to deploy
      // const apiUrl = process.env.NEXT_PUBLIC_API || "https://dotcqkmhu1.execute-api.ap-south-1.amazonaws.com/api";
      // await axios.post(
      //   `${apiUrl}/project`,
      //   {
      //     repo: selectedRepo,
      //     category: selectedCategory,
      //     owner: session.username,
      //     accessToken: session.accessToken,
      //     envVariables: formattedEnvVariables,
      //   },
      //   {
      //     headers: { Authorization: `Bearer ${session.accessToken}` },
      //   }
      // );

      setIsDeploying(false);
    } catch (err) {
      setError("Error deploying repository. Please try again.");
      setIsDeploying(false);
      console.log(err);
    }

    // Simulate deployment process
    setIsDeploying(false);
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-800 border-t-white mb-4"></div>
          <div className="text-lg font-medium text-gray-400">Loading...</div>
          <div className="mt-2 text-sm text-gray-600">
            Preparing your dashboard
          </div>
        </div>
      </div>
    );
  }

  // Custom scrollbar styles
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(75, 75, 75, 0.1);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `;

  return (
    <div className="min-h-screen bg-black text-white p-4 relative">
      <style jsx global>
        {scrollbarStyles}
      </style>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0,_transparent_8px)] bg-[length:24px_24px]"></div>
      </div>
      <div className="justify-between items-center flex px-3">
        <h1 className="text-center text-4xl font-bold tracking-tight relative inline-block">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-300">
            Nearzero deploy
          </span>
          <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </h1>

        <div className="flex justify-end p-4">
          {session?.user && (
            <div className="flex items-center bg-black/40 backdrop-blur-sm border border-gray-800 rounded-full px-3 py-1.5 shadow-lg">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-700"
                />
              )}
              <span className="mx-2 text-sm font-medium">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center"
              >
                <span>Sign Out</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl relative z-10 backdrop-blur-sm bg-black/30 p-6 rounded-xl border border-gray-900 shadow-[0_0_25px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,255,255,0.03)]">
        {/* Section 1: What would you like to deploy? */}
        <div className="mb-12 relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-white/0 via-white/20 to-white/0"></div>
          <h2 className="mb-6 text-center text-xl font-medium tracking-wide">
            What would you like to deploy?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button
              onClick={() => setSelectedCategory("Static Site")}
              className={`group relative overflow-hidden border ${
                selectedCategory === "Static Site"
                  ? "border-white bg-white text-black"
                  : "border-gray-800 bg-black text-white hover:border-gray-600"
              } 
                p-5 rounded-lg text-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
            >
              <span className="relative z-10 font-medium">Static Site</span>
              {selectedCategory !== "Static Site" && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>

            <button
              disabled
              className="group relative overflow-hidden border border-gray-800 bg-black text-white/50 p-5 rounded-lg text-center transition-all duration-300 cursor-not-allowed"
            >
              <span className="relative z-10 font-medium">Dynamic Site</span>
              <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-white text-black text-xs px-2 py-0.5 rounded-md font-medium">
                Coming Soon
              </span>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button
              onClick={() => setSelectedCategory("Backend")}
              className={`group relative overflow-hidden border ${
                selectedCategory === "Backend"
                  ? "border-white bg-white text-black"
                  : "border-gray-800 bg-black text-white hover:border-gray-600"
              } 
                p-5 rounded-lg text-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
            >
              <span className="relative z-10 font-medium">Backend</span>
              {selectedCategory !== "Backend" && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>

            <button
              disabled
              className="group relative overflow-hidden border border-gray-800 bg-black text-white/50 p-5 rounded-lg text-center transition-all duration-300 cursor-not-allowed"
            >
              <span className="relative z-10 font-medium">Services</span>
              <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-white text-black text-xs px-2 py-0.5 rounded-md font-medium">
                Coming Soon
              </span>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Section 2: Repository List */}
        <div className="mb-12 relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-white/0 via-white/20 to-white/0"></div>
          <h2 className="mb-6 text-center text-xl font-medium tracking-wide">
            Select Repository
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
            </div>
          ) : error ? (
            <div className="p-5 text-red-400 text-center bg-red-900/10 border border-red-900/20 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {error}
            </div>
          ) : repositories.length === 0 ? (
            <div className="p-6 text-center text-gray-400 bg-gray-900/30 border border-gray-800 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              No repositories found
            </div>
          ) : (
            <div className="relative group">
              <select
                value={selectedRepo}
                onChange={(e) => {
                  setSelectedRepo(e.target.value);
                }}
                className="w-full p-4 border border-gray-800 bg-black/60 rounded-lg focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/30 transition-all duration-200 appearance-none backdrop-blur-sm"
              >
                <option value="">Select a repository</option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.name}>
                    {repo.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"></div>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
              <span className="text-gray-400 mx-4 text-sm">or</span>
              <div className="w-full h-px bg-gradient-to-r from-gray-700 via-gray-700 to-transparent"></div>
            </div>

            <div className="mt-6 relative group">
              <input
                type="text"
                placeholder="Enter public repository URL"
                className="w-full p-4 border border-gray-800 bg-black/60 rounded-lg focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/30 transition-all duration-200 backdrop-blur-sm"
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* Section 3: Environment Variables */}
        <div className="mb-12 relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-white/0 via-white/20 to-white/0"></div>
          <h2 className="mb-6 text-center text-xl font-medium tracking-wide">
            Environment Variables
          </h2>

          {/* Key-value input with paste support */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="text-xs font-medium text-gray-400 px-2">KEY</div>
            <div className="text-xs font-medium text-gray-400 px-2">VALUE</div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="relative group">
                <input
                  type="text"
                  value={envKey}
                  onChange={(e) => setEnvKey(e.target.value)}
                  onPaste={handleEnvPaste}
                  placeholder="KEY or paste environment variables"
                  className="w-full p-3 font-mono text-white/90 border border-gray-700 bg-black/60 rounded-md focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/30 transition-all duration-200 backdrop-blur-sm"
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"></div>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  value={envValue}
                  onChange={(e) => setEnvValue(e.target.value)}
                  placeholder="VALUE"
                  className="w-full p-3 font-mono text-white/90 border border-gray-700 bg-black/60 rounded-md focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/30 transition-all duration-200 backdrop-blur-sm"
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"></div>
              </div>
            </div>
            <button
              onClick={addEnvVariable}
              disabled={envKey.trim() === ""}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                envKey.trim() === ""
                  ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              Add
            </button>
          </div>

          <div className="mb-6 text-center">
            <p className="text-gray-400 text-sm italic">
              Paste environment variables directly in the KEY field (e.g.
              <span className="text-white/80 mx-1 font-mono text-xs">
                NEXT_PUBLIC_API=https://example.com
              </span>
              )
            </p>
          </div>

          {/* Display added variables */}
          <div
            className={`mt-6 border border-gray-800 rounded-lg p-5 transition-all duration-300 ${
              envVariables.length > 0 ? "opacity-100" : "opacity-50"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium tracking-wide flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-white mr-2"></span>
                Added Variables
                {envVariables.length > 0 && (
                  <span className="ml-2 text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">
                    {envVariables.length}
                  </span>
                )}
              </h3>
            </div>

            {envVariables.length === 0 ? (
              <div className="py-8 text-center text-gray-500 italic">
                No environment variables added yet
              </div>
            ) : (
              <>
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <div className="text-xs font-medium text-gray-400 px-2">
                    KEY
                  </div>
                  <div className="text-xs font-medium text-gray-400 px-2">
                    VALUE
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {envVariables.map((variable, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-900/80 border border-gray-800 rounded-md hover:border-gray-700 transition-colors duration-200"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="relative group">
                          <input
                            type="text"
                            value={variable.key}
                            onChange={(e) =>
                              updateEnvVariable(
                                index,
                                e.target.value,
                                variable.value
                              )
                            }
                            className="w-full p-2 font-mono text-white/90 bg-black/40 border border-gray-800 rounded-md focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/30 transition-all duration-200"
                            placeholder="KEY"
                          />
                          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"></div>
                        </div>
                        <div className="relative group">
                          <input
                            type="text"
                            value={variable.value}
                            onChange={(e) =>
                              updateEnvVariable(
                                index,
                                variable.key,
                                e.target.value
                              )
                            }
                            className={`w-full p-2 font-mono text-gray-300 bg-black/40 border border-gray-800 rounded-md focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/30 transition-all duration-200`}
                            placeholder="VALUE"
                          />
                          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"></div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeEnvVariable(index)}
                        className="ml-3 text-gray-500 hover:text-white bg-transparent hover:bg-gray-800 p-1.5 rounded-md transition-colors duration-200"
                        aria-label="Remove variable"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 4: Deploy Button */}
        <div className="text-center relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-white/0 via-white/20 to-white/0"></div>
          <button
            onClick={handleDeploy}
            disabled={!selectedRepo || !selectedCategory || isDeploying}
            className={`w-full p-5 rounded-lg font-bold text-lg relative overflow-hidden transition-all duration-300 transform hover:scale-[1.01] ${
              !selectedRepo || !selectedCategory || isDeploying
                ? "bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-800"
                : "bg-white text-black hover:bg-gray-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            }`}
          >
            {isDeploying ? (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-black mr-2"></div>
                <span>Deploying...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span>Deploy</span>
                {selectedRepo && selectedCategory && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                )}
              </div>
            )}
            {selectedRepo && selectedCategory && !isDeploying && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
