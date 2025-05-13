import Navigation from "./components/Navigation";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navigation />

      <main className="pt-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            GitHub Repository Viewer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Sign in with your GitHub account to view and manage all your
            repositories in one place.
          </p>
        </div>

        <div className="flex justify-center mb-16">
          <Link
            href="/login"
            className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-100 dark:bg-gray-800 mb-4">
              <svg
                className="h-6 w-6 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Repository Access
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              View all your public and private repositories in a clean,
              organized interface.
            </p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-100 dark:bg-gray-800 mb-4">
              <svg
                className="h-6 w-6 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Secure Authentication
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Authenticate securely with GitHub using OAuth, no passwords
              stored.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} GitHub Repository Viewer. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
