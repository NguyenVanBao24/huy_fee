"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Header: React.FC = () => {
  const router = useRouter();

  const handlelogout = async () => {
    router.push("/auth");
    localStorage.setItem("token", "");
  };
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">MyApp</div>
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link href="/user" className="hover:underline">
              User
            </Link>
          </li>
          <li>
            <Link href="/" className="hover:underline" onClick={handlelogout}>
              Logout
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
