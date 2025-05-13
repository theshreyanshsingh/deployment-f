"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 dark:text-white"
        >
          Nearzero
        </Link>

        <div className="flex items-center space-x-4">
          {status === "authenticated" ? (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium ${
                  pathname === "/dashboard"
                    ? "text-black dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
              >
                Sign Out
              </button>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-300 dark:border-gray-700"
                />
              )}
            </>
          ) : (
            <Link
              href="/login"
              className={`text-sm font-medium ${
                pathname === "/login"
                  ? "text-black dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
