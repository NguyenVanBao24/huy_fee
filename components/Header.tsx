"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Header: React.FC = () => {
  const router = useRouter();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/auth");
  }, [router]);

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wide">MyApp</h1>
        <ul className="flex space-x-6 text-lg">
          {["/", "User", "Admin"].map((item) => (
            <li key={item}>
              <Link href={`/${item.toLowerCase()}`} className="hover:text-gray-300 transition">
                {item}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="hover:text-gray-300 transition focus:outline-none"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
