"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
const UserProvider = dynamic(
  () => import("@/contexts/UserContext").then((mod) => ({ default: mod.UserProvider })),
  { ssr: false }
);

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <Navbar />
      {children}
    </UserProvider>
  );
}