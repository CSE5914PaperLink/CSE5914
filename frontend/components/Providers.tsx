// components/Providers.tsx

"use client"; // make this component client-only

import React from "react";
import Navbar from "@/components/Navbar";
import { UserProvider } from "@/contexts/UserContext";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <UserProvider>
      <Navbar />
      {children}
    </UserProvider>
  );
}

